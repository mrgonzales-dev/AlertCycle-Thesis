from __future__ import absolute_import, division, print_function

import sys
import os
import time

from ultralytics.models.yolo import detect
sys.path.append(os.path.abspath('monodepth2'))
import cv2
import numpy as np
import torch
import matplotlib.animation as animation
import matplotlib.cm as cm
import matplotlib.colors as mpl
import matplotlib.pyplot as plt
from PIL import Image as pil
from torchvision import transforms
from monodepth2.layers import disp_to_depth
from monodepth2.evaluate_depth import *
from monodepth2 import networks
from monodepth2.networks import ResnetEncoder
from monodepth2.utils import download_model_if_doesnt_exist
from flask import Flask, render_template
from flask_socketio import SocketIO
import json
import requests 



# Integrating YOLO for object detection
from ultralytics import YOLO
yolo_model = YOLO('alertCycleV5.pt')
# yolo_model = YOLO('yolov5nu.pt')


# Function to set up the depth prediction model
def setup_model(model_name, device):
    """
    Download and load the pre-trained encoder and decoder for depth estimation.

    Parameters:
    -----------
    model_name : str
        Name of the pre-trained model to be used (mono+stereo, etc.).
    device : torch.device
        The device (CPU or GPU) where the model will run.

    Returns:
    --------
    encoder : torch.nn.Module
        The loaded ResNet encoder model.
    depth_decoder : torch.nn.Module
        The loaded depth decoder model.
    feed_width : int
        Input image width required by the encoder.
    feed_height : int
        Input image height required by the encoder.
    """
    download_model_if_doesnt_exist(model_name)
    model_path = os.path.join("models", model_name)

    # Load encoder
    encoder_path = os.path.join(model_path, "encoder.pth")
    depth_decoder_path = os.path.join(model_path, "depth.pth")

    print("-> Loading model from ", model_path)

    # Load pretrained encoder
    print("   Loading pretrained encoder")
    encoder = ResnetEncoder(18, False)
    loaded_dict_enc = torch.load(encoder_path, map_location=device)
    feed_height = loaded_dict_enc['height']
    feed_width = loaded_dict_enc['width']
    filtered_dict_enc = {k: v for k, v in loaded_dict_enc.items() if k in encoder.state_dict()}
    encoder.load_state_dict(filtered_dict_enc)
    encoder.to(device)
    encoder.eval()

    # Load pretrained decoder
    print("   Loading pretrained decoder")
    depth_decoder = networks.DepthDecoder(num_ch_enc=encoder.num_ch_enc, scales=range(4))
    loaded_dict = torch.load(depth_decoder_path, map_location=device)
    depth_decoder.load_state_dict(loaded_dict)
    depth_decoder.to(device)
    depth_decoder.eval()

    return encoder, depth_decoder, feed_width, feed_height


# Function to predict depth and display the output frame
def predict_and_display_frame(encoder, depth_decoder, frame, feed_width, feed_height, device, pred_metric_depth=True):
    """
    Predict the depth map for a frame and color map the result.

    Parameters:
    -----------
    encoder : torch.nn.Module
        The pre-trained ResNet encoder model.
    depth_decoder : torch.nn.Module
        The depth decoder model.
    frame : np.ndarray
        The current frame from the video stream.
    feed_width : int
        Required input width for the encoder.
    feed_height : int
        Required input height for the encoder.
    device : torch.device
        Device to run the model on (CPU or GPU).
    pred_metric_depth : bool
        If True, predicts depth in metric units, otherwise predicts disparity.

    Returns:
    --------
    colormapped_im : np.ndarray
        The color-mapped depth image for display.
    """
    original_height, original_width = frame.shape[:2]
    
    # Preprocess the frame for the model
    input_image = pil.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    input_image = input_image.resize((feed_width, feed_height), pil.Resampling.LANCZOS)
    input_image = transforms.ToTensor()(input_image).unsqueeze(0).to(device)

    # Run depth prediction model
    with torch.no_grad():
        features = encoder(input_image)
        outputs = depth_decoder(features)

        disp = outputs[("disp", 0)]
        disp_resized = torch.nn.functional.interpolate(
            disp, (original_height, original_width), mode="bilinear", align_corners=False
        )

        # Convert disparity to depth (metric if required)
        scaled_disp, depth =disp_to_depth(disp, 0.1, 100)
        if pred_metric_depth:
            metric_depth = STEREO_SCALE_FACTOR * depth.cpu().numpy()
            disp_resized_np = metric_depth.squeeze()
        else:
            disp_resized_np = disp_resized.squeeze().cpu().numpy()

    # Apply color map to the disparity map
    vmax = np.percentile(disp_resized_np, 90)
    normalizer = mpl.Normalize(vmin=disp_resized_np.min(), vmax=vmax)
    mapper = cm.ScalarMappable(norm=normalizer, cmap='magma')
    colormapped_im = (mapper.to_rgba(disp_resized_np)[:, :, :3] * 255).astype(np.uint8)

    return colormapped_im


# Function to calculate average depth in a bounding box region
def get_distance_from_depth_map(depth_map, box):
  
    """
    Calculate the average depth within a specified bounding box on the depth map.

    Parameters:
    -----------
    depth_map : numpy.ndarray
        A 2D array representing the depth values for each pixel.
    box : list or tuple (x1, y1, x2, y2)
        Coordinates of the bounding box to calculate average depth.

    Returns:
    --------
    avg_depth : float
        The average depth value within the bounding box.
    """
  
    x1, y1, x2, y2 = map(int, box)

    # Extract the depth values inside the bounding box
    depth_region = depth_map[y1:y2, x1:x2]

    # Return the average depth in the region
    avg_depth = np.mean(depth_region)

    return avg_depth

def send_data_to_nodejs(data):
    """
    Sends data (coordinates of detected objects) to the Node.js server via HTTP POST request.
    """
    url = 'http://localhost:3000/api/data'  # Replace with your Node.js server URL
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=0.5)
        if response.status_code == 200:
            try:
                print("✅ Successfully sent data to Node.js:")
            except ValueError:
                print("⚠️ Server response is not valid JSON.")
        else:
            print(f"⚠️ Server responded with status.")
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to connect to server: {e}. Data not sent.")

# Main function to run the webcam feed and display depth and YOLO detections
def main():
    """
    Main function to capture webcam feed, predict depth, and detect objects using YOLOv8.

    - Displays depth estimation and YOLO object detection on webcam frames.
    - Exits the loop when 'q' is pressed.
    """
 
    model_name = "mono+stereo_640x192"  # Change the model as needed
    pred_metric_depth = False # Set True if using stereo models and need metric depth

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    encoder, depth_decoder, feed_width, feed_height = setup_model(model_name, device)

    cap = cv2.VideoCapture(2)  # Open webcam stream

    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("-> Starting webcam feed. Press 'q' to quit.")

    frame_counter = 1

    detected_objects = []
   
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame, retrying...")
            continue  # Skip the rest of the loop and try capturing the next frame

        frame_counter += 1
        print(f"frame: {frame_counter}")
        # Run YOLO object detection
        results = yolo_model.predict(frame, imgsz=320)
        
        print(f"Found Results!!...")
        if results and results[0].boxes:
            # Detect cars (cls == 2) and motorcycles (cls == 3)
            detections = [res for res in results[0].boxes] 

            depth_map = predict_and_display_frame(encoder, depth_decoder, frame, feed_width, feed_height, device, pred_metric_depth)

            for detection in detections:
                box = detection.xyxy[0].cpu().numpy()  # Get YOLO bounding box coordinates
                conf = detection.conf  # YOLO confidence score

                # Calculate distance from depth map for the detected object
                # NOTE: the higher the average_depth, the closer the distance
                average_depth = get_distance_from_depth_map(depth_map.squeeze(), box)
                hazard_level = ""
                inRisk = False
               
                if average_depth > 80: 
                    hazard_level = "BAD DISTANCE"
                    inRisk = True 
                elif average_depth <= 80: 
                    hazard_level = "GOOD DISTANCE"
                    inRisk = False 
                
                # Get the default resolution
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

                print(f"Webcam Resolution: {width}x{height}")
                # Draw bounding box and label
                x1, y1, x2, y2 = map(int, box)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0,0,255) if inRisk else (0,255,0), 5)  # Green for car or motorcycle
                
                #NOTE: This prints out all the coordinates of the object
                # Send the detected objects to Node.js server

                detected_class = ""
                detected_objects = []
                if results and results[0].boxes:
                    for detection in results[0].boxes:
                        average_depth = get_distance_from_depth_map(depth_map.squeeze(), box)
                        box = detection.xyxy[0].cpu().numpy()  # Get YOLO bounding box coordinates
                        cls = int(detection.cls.item())  # Object class ID
                        x1, y1, x2, y2 = map(int, box)
                        center_x = (x1 + x2) // 2
                        center_y = (y1 + y2) // 2
                        
                        detected_class = cls

                        object_class = {
                            0 : "bus",
                            1 : "car",
                            2 : "cyclist",
                            3 : "electric_car",
                            4 : "jeep",
                            5 : "motor",
                            6 : "pedicab",
                            7 : "tricycle",
                            8 : "truck",
                        }.get(cls, "UNKNOWN")
                        
                        # NOTE: AVERAGE DEPTH - FEET
                        #     150 - 5ft
                        #     140 - 10ft
                        #     95  - 20ft
                        #     85  - 30ft
                        #     75  - 40ft
                        #     65  - 50ft
                        # NOTE: AVERAGE DEPTH - METERS 
                        #     150 - 1.52m  
                        #     130 - 2.50m
                        #     140 - 3.05m  
                        #     95  - 6.10m  
                        #     85  - 9.14m  
                        #     75  - 12.19m  
                        #     65  - 15.24m  
                        
                        if average_depth >= 130: 
                                hazard_level = "Dangerous Ranged Vehicle"
                                inRisk = True 
                        elif average_depth < 130 and average_depth >= 140: 
                                hazard_level = "Hazardous Ranged Vehicle"
                                inRisk = False 
                        elif average_depth < 140:
                                hazard_level = "No Hazard Vehicle nearby"
                                inRisk = False 
                        # Append object data with risk assessment
                        detected_objects.append({
                            "object_class": object_class, 
                            "x": center_x,
                            "y": center_y,
                            "mDA": average_depth,
                            "risk": inRisk  # Adding risk information
                        })

                print(f"\n\n sent and mapped data: {detected_objects} \n\n")
                send_data_to_nodejs(detected_objects)
                print(f" detected class: {detected_class}")
                # Add text to the top-left corner of the screen
                # overlay_text = f"Risk: {'ALL GOODS!' if inRisk is False else 'WARNING!!'}"
                # cv2.putText(frame, overlay_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255) if inRisk else (0, 255, 0), 2)
                # label = f"{hazard_level}"
                print(f"Object: {detected_class} | mAD: {average_depth} ")
                # cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255) if inRisk else (0, 255,0), 1)
        else: 
                # Append object data with risk assessment
                detected_objects.append({
                    "object_class": "none", 
                    "x": "none",
                    "y": "none",
                    "mDA": "none",
                    "risk": False # Adding risk information
                })
                send_data_to_nodejs(detected_objects)
        # Run depth prediction for the frame
        colormapped_im = predict_and_display_frame(
            encoder, depth_decoder, frame, feed_width, feed_height, device, pred_metric_depth
        )
  
        # Display webcam frame and depth map
        # cv2.imshow("Webcam - Original", frame)
        # cv2.imshow("Webcam - Depth Estimation", colormapped_im)

        # if cv2.waitKey(1) & 0xFF == ord('q'):
        #     break

    # Release webcam and close all windows
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
