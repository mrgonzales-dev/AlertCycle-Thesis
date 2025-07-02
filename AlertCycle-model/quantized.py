import torch

# Load your model
model = torch.load('roboflowmodels/AlertCycleV6.pt', map_location=torch.device('cpu'), weights_only=False)

# Convert to quantized version
quantized_model = torch.quantization.quantize_dynamic(
    model,
    {torch.nn.Linear},  # List of modules to quantize
    dtype=torch.qint8
)

# Save the quantized model
torch.save(quantized_model.state_dict(), 'roboflowmodels/AlertCycleV6_quantized.pt')
