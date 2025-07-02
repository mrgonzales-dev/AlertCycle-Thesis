import ultralytics 

# Add the custom class DetectionModel to the allowed globals list

from ultralytics import YOLO
yolo_model = YOLO('alertcycleModelV1.pt')

# Print the model to inspect it
print(yolo_model._reset_ckpt_args)
