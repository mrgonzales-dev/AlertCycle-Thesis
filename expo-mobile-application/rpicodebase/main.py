"""
           _           _    _____           _      
     /\   | |         | |  / ____|         | |     
    /  \  | | ___ _ __| |_| |    _   _  ___| | ___ 
   / /\ \ | |/ _ \ '__| __| |   | | | |/ __| |/ _ \
  / ____ \| |  __/ |  | |_| |___| |_| | (__| |  __/
 /_/    \_\_|\___|_|   \__|\_____\__, |\___|_|\___|
                                  __/ |            
                                 |___/             
"""


from __future__ import absolute_import, division, print_function

# ======== IMPORTS =========
# === system imports ==
import sys
import os
import time
# === yolo imports ==
from ultralytics.models.yolo import detect
import cv2
import numpy as np
# === torch imports ==
import torch
from PIL import Image as pil
from torchvision import transforms
# === monodepth2 imports ==
sys.path.append(os.path.abspath('monodepth2'))
from monodepth2.layers import disp_to_depth
from monodepth2.evaluate_depth import *
from monodepth2 import networks
from monodepth2.networks import ResnetEncoder
from monodepth2.utils import download_model_if_doesnt_exist
# === matplotlib imports ==
import matplotlib.animation as animation
import matplotlib.cm as cm
import matplotlib.colors as mpl
import matplotlib.pyplot as plt
# === flask imports ==
from flask import Flask, render_template
from flask_socketio import SocketIO
import json
import requests
# === multithreading imports==
import threading
import queue
# Create a queue for the processed data
data_queue = queue.Queue(maxsize=100)
# ====================

# ====== INTEGRATE OWN MODEL =======
from ultralytics import YOLO
# yolo_model = YOLO('./roboflowmodels/AlertCycleV6_prune.pt')
yolo_model = YOLO('./roboflowmodels/AlertCycleV5.pt')
# ==================================

# ===== Setup the model =======
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

    log(f"-> Loading model from {model_path}")

    # Load pretrained encoder
    log("   Loading pretrained encoder")
    encoder = ResnetEncoder(18, False)
    loaded_dict_enc = torch.load(encoder_path, map_location=device)
    feed_height = loaded_dict_enc['height']
    feed_width = loaded_dict_enc['width']
    filtered_dict_enc = {k: v for k, v in loaded_dict_enc.items() if k in encoder.state_dict()}
    encoder.load_state_dict(filtered_dict_enc)
    encoder.to(device)
    encoder.eval()

    # Load pretrained decoder
    log("   Loading pretrained decoder")
    depth_decoder = networks.DepthDecoder(num_ch_enc=encoder.num_ch_enc, scales=range(4))
    loaded_dict = torch.load(depth_decoder_path, map_location=device)
    depth_decoder.load_state_dict(loaded_dict)
    depth_decoder.to(device)
    depth_decoder.eval()

    return encoder, depth_decoder, feed_width, feed_height


# === Predicting the depth and display of the output frame =====
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


# ==== Calculation of average depth in a bounding box region =====
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


# ====== Act as Log output =====
def log(x): 
    print(f"[AlertCycle LOG]: {x}") 
# ===============================

def process_frame(frame, cap, encoder, depth_decoder, feed_width, feed_height, device):
    """
    This function handles frame processing:
    - Object detection
    - Depth prediction
    """
    results = yolo_model.predict(frame, imgsz=224)  # YOLO object detection
    
    if results and results[0].boxes:
        detections = [res for res in results[0].boxes]
        depth_map = predict_and_display_frame(encoder, depth_decoder, frame, feed_width, feed_height, device, pred_metric_depth=False)

        detected_objects = []
        for detection in detections:
            box = detection.xyxy[0].cpu().numpy()
            average_depth = get_distance_from_depth_map(depth_map.squeeze(), box)
            hazard_level = ""
            realMetric = ""
            """ =================== GROUND RULES ===================
             
             NOTE: AVERAGE DEPTH - FEET
                 150 - 5ft
                 140 - 10ft
                 95  - 20ft
                 85  - 30ft
                 75  - 40ft
                 65  - 50ft
             
             NOTE: AVERAGE DEPTH - METERS 
                 150 - 1.52m  
                 140 - 2.05m  
                 130 - 3.50m
                 95  - 6.10m  
                 85  - 9.14m  
                 75  - 12.19m  
                 65  - 15.24m  
            =========================================================
            """ 
    
            #NOTE: Higher average depth equalis to lower distance
            # Calculate risk based on average depth
            if average_depth >= 130:
                hazard_level = "high"
                realMetric= "2.50"
            elif average_depth < 140 and average_depth >= 130:
                hazard_level = "hazardous"
                realMetric = "1.50"
            else:
                hazard_level = "safe"
                realMetric = "3.0"

            x1, y1, x2, y2 = map(int, box)
            center_x = (x1 + x2) // 2
            center_y = (y1 + y2) // 2

            log(hazard_level)

            detected_class = int(detection.cls.item())
            object_class = {
                0: "bus", 1: "car", 2: "cyclist", 3: "electric_car", 4: "jeep", 
                5: "motor", 6: "pedicab", 7: "tricycle", 8: "truck"
            }.get(detected_class, "UNKNOWN")

            detected_objects.append({
                "object_class": object_class,
                "x": center_x,
                "y": center_y,
                "mDA": round(average_depth),
                "hazard_level": hazard_level, 
                "realWorldDistance": realMetric,
            })

        return detected_objects
    else:
        log("No detections found")
        return [{
            "object_class": "none", 
            "x": "none",
            "y": "none",
            "mDA": "none",
            "hazard_level": "safe", 
            "realWorldDistance": "none", 
}]

def send_data_to_nodejs(data):
    """
    Sends data (coordinates of detected objects) to the Node.js server via HTTP POST request.
    """
    url = 'http://localhost:3000/api/data'
    headers = {'Content-Type': 'application/json'}
        
    # ===================== SEND REQUEST TO SERVER =========================
    def send_request():
        try:
            response = requests.post(url, json=data, headers=headers, timeout=0.1)
            try:
                log(f"✅ Successfully sent data to Node.js: {response.status_code}")
            except ValueError:
                log("⚠️ Server response is not valid JSON.")
        except requests.exceptions.RequestException as e:
            log(f"✅ Data Sent SUCCESSFUL with empty response.")
    #========================================================================

    # ========= USED FIRE AND FORGET METHOD==========
    """
    The function send_request() is run in a separate thread. 
    This is achieved by creating a new thread using threading.
    Thread and passing send_request as the target function to execute in that thread.
    """
    thread = threading.Thread(target=send_request)
    thread.start()
    #================================================


# Main function
def main():
    # Load the model for depth estimation
    model_name = "mono+stereo_640x192"
    pred_metric_depth = False
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    encoder, depth_decoder, feed_width, feed_height = setup_model(model_name, device)

    # Set up the video capture
    cap = cv2.VideoCapture(2)
    if not cap.isOpened():
        log("Error: Could not open webcam.")
        return
    log(" ======= Starting Detection! =======")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            log("Failed to capture frame, Retrying.........")
            continue
        
        frame = cv2.flip(frame, 1)
        # Process the frame (object detection and depth prediction)
        detected_objects = process_frame(frame, cap, encoder, depth_decoder, feed_width, feed_height, device)
        # Send the detected objects to the Node.js server
        send_data_to_nodejs(detected_objects)
        log(detected_objects)
    # Release the webcam and close all windows
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
