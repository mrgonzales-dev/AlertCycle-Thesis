
import onnx

model = onnx.load("alertcycleModelV1.onnx")
for input_tensor in model.graph.input:
    print(input_tensor)
