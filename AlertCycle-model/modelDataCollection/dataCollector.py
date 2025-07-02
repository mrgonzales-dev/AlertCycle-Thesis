
import requests
from fpdf import FPDF

# Replace with your actual values from Roboflow
API_KEY = "YOUR_ROBOFLOW_API_KEY"
PROJECT_ID = "alertcycle-model"  # e.g., "my-dataset"
MODEL_ID = " "  # e.g., "model-123"
VERSION = "5"  # e.g., "1"

# API URL to fetch model metrics (e.g., precision, recall, mAP, etc.)
url = f"https://api.roboflow.com/{PROJECT_ID}/{VERSION}/{MODEL_ID}/metrics?api_key={API_KEY}"

# Send a GET request to the Roboflow API
response = requests.get(url)
if response.status_code == 200:
    data = response.json()
    epochs = data['epochs']
    precision = data['precision']
    recall = data['recall']
    map_score = data['map']
    confusion_matrix = data.get('confusion_matrix', None)
else:
    print(f"Error fetching data from Roboflow: {response.status_code}")
    exit(1)

# PDF setup using FPDF
pdf = FPDF()
pdf.add_page()

# Title
pdf.set_font("Arial", "B", 16)
pdf.cell(200, 10, txt="Model Performance Report", ln=True, align="C")

# Add model performance data to PDF
pdf.set_font("Arial", size=12)
pdf.ln(10)  # line break
pdf.cell(200, 10, txt=f"Epochs: {epochs}", ln=True)
pdf.cell(200, 10, txt=f"Precision: {precision:.2f}", ln=True)
pdf.cell(200, 10, txt=f"Recall: {recall:.2f}", ln=True)
pdf.cell(200, 10, txt=f"mAP: {map_score:.2f}", ln=True)

# Add confusion matrix if available
if confusion_matrix:
    pdf.ln(10)  # line break
    pdf.cell(200, 10, txt="Confusion Matrix:", ln=True)
    for row in confusion_matrix:
        pdf.cell(200, 10, txt=str(row), ln=True)

# Save PDF
output_pdf = "model_performance_report.pdf"
pdf.output(output_pdf)

print(f"PDF report saved as {output_pdf}")
