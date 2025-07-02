import torch
import torch.nn as nn
import torch.nn.utils.prune as prune
import torch.optim as optim
from torchvision import datasets, transforms

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 1. Define a sample model architecture
class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, stride=1)  # Output: (28-3+1)=26x26
        self.pool = nn.MaxPool2d(2, 2)                          # Output: 13x13
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, stride=1) # Output: (13-3+1)=11x11
        self.fc1 = nn.Linear(64 * 5 * 5, 128)                   # Correct input dimension
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))     # Shape: [B, 32, 13, 13]
        x = self.pool(torch.relu(self.conv2(x)))     # Shape: [B, 64, 5, 5]
        x = torch.flatten(x, 1)                      # Flatten to [B, 64*5*5=1600]
        x = torch.relu(self.fc1(x))                  # Pass to fc1: [B, 128]
        x = self.fc2(x)                              # Output: [B, 10]
        return x

# 2. Initialize and save sample model (pretend this is your model.pt)
model = SimpleCNN().to(device)
torch.save(model.state_dict(), "ac_mobile.pt")

# 3. Load the saved model
loaded_model = SimpleCNN().to(device)
loaded_model.load_state_dict(torch.load("ac_mobile.pt"))
loaded_model.eval()

# 4. Pruning function
def prune_model_l1_unstructured(model, amount=0.2):
    for name, module in model.named_modules():
        if isinstance(module, (nn.Conv2d, nn.Linear)):
            # Prune weights
            prune.l1_unstructured(module, name='weight', amount=amount)
            # Remove pruning parameterization (makes pruning permanent)
            prune.remove(module, 'weight')
    return model

# Prune 30% of weights
pruned_model = prune_model_l1_unstructured(loaded_model, amount=0.3)

# 5. Verify pruning
def print_sparsity(model):
    for name, module in model.named_modules():
        if isinstance(module, (nn.Conv2d, nn.Linear)):
            print(f"Sparsity in {name}.weight:",
                  f"{(100. * float(torch.sum(module.weight == 0)) / float(module.weight.nelement())):.2f}%")

print("Sparsity after pruning:")
print_sparsity(pruned_model)

# 6. Fine-tuning after pruning (optional but recommended)
def fine_tune(model, epochs=3):
    # Dummy dataset - replace with your actual data
    transform = transforms.Compose([transforms.ToTensor()])
    train_loader = torch.utils.data.DataLoader(
        datasets.MNIST('../data', train=True, download=True, transform=transform),
        batch_size=64, shuffle=True)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    model.train()
    for epoch in range(epochs):
        for data, target in train_loader:
            data, target = data.to(device), target.to(device)
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
        print(f"Epoch {epoch+1}/{epochs} - Loss: {loss.item():.4f}")

# Run fine-tuning
print("\nFine-tuning pruned model...")
fine_tune(pruned_model, epochs=3)

# 7. Save pruned model
torch.save(pruned_model.state_dict(), "pruned_model.pt")
print("\nPruned model saved as pruned_model.pt")

# 8. Test accuracy (example)
def test_accuracy(model):
    test_loader = torch.utils.data.DataLoader(
        datasets.MNIST('../data', train=False, transform=transforms.ToTensor()),
        batch_size=1000, shuffle=True)
    
    model.eval()
    correct = 0
    with torch.no_grad():
        for data, target in test_loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            pred = output.argmax(dim=1, keepdim=True)
            correct += pred.eq(target.view_as(pred)).sum().item()
    
    print(f"Accuracy: {correct/len(test_loader.dataset)*100:.2f}%")

print("\nTesting pruned model accuracy:")
test_accuracy(pruned_model)
