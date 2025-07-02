import torch
import torchvision.models as models

# Example: Load a pre-defined ResNet18 model
model = models.resnet18(pretrained=False)  # Use the correct architecture here

# Load the weights into the model
checkpoint = torch.load('ac_mobile.pt', map_location=torch.device('cpu'))

# If it's just the state_dict (weights) being loaded:
model.load_state_dict(checkpoint)
