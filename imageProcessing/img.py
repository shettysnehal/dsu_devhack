from flask import Flask, request, send_file, jsonify
from pdf2image import convert_from_bytes
import io
import base64
from flask_cors import CORS
from PIL import Image, ImageDraw
import numpy as np
import pytesseract
import cv2
import fitz  # PyMuPDF
import img2pdf
import requests
from fpdf import FPDF
from tempfile import NamedTemporaryFile
import os
import hashlib

app = Flask(__name__)
CORS(app)

# Set the path to poppler binaries (update the path as necessary)
poppler_path = r"C:\Users\hp\Downloads\Release-24.07.0-0\poppler-24.07.0\Library\bin"

@app.route('/convert', methods=['POST'])
def convert_pdf_to_images():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    pdf_file = request.files['file']

    try:
        # Convert PDF to a list of PIL images
        images = convert_from_bytes(pdf_file.read(), poppler_path=poppler_path)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Prepare images in base64 format
    image_files = []
    for i, image in enumerate(images):
        img_io = io.BytesIO()
        image.save(img_io, 'PNG')
        img_io.seek(0)
        img_base64 = base64.b64encode(img_io.read()).decode('utf-8')
        image_files.append({
            "filename": f"page_{i + 1}.png",
            "data": img_base64
        })

    return jsonify({
        "message": "PDF converted successfully",
        "images": image_files
    }), 200

# Function to download the image from IPFS using its CID
def download_image_from_ipfs(cid):
    ipfs_url = f"https://gateway.lighthouse.storage/ipfs/{cid}"
    response = requests.get(ipfs_url)
    if response.status_code == 200:
        image_data = np.asarray(bytearray(response.content), dtype="uint8")
        return cv2.imdecode(image_data, cv2.IMREAD_COLOR)
    else:
        raise Exception(f"Failed to download image from IPFS. Status code: {response.status_code}")

# Function to preprocess the image (convert to grayscale and apply thresholding)
def preprocess_image(image):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Convert hex color #8e8f8e (RGB: 142, 143, 142) to grayscale value
    r, g, b = 142, 143, 142
    threshold_value = int(0.299 * r + 0.587 * g + 0.114 * b)  # Grayscale value: ~143

    # Apply thresholding using the calculated value
    _, thresholded_image = cv2.threshold(gray_image, threshold_value, 255, cv2.THRESH_BINARY)

    return thresholded_image

# Function to perform OCR and extract text with coordinates
def perform_ocr_with_coordinates(preprocessed_image):
    data = pytesseract.image_to_data(preprocessed_image, lang='eng+hin', output_type=pytesseract.Output.DICT)
    return data

# Function to hit the local Dialogflow API and get results
def hit_dialogflow_api(text):
    url = 'http://localhost:3000/api/detectpii'  # Change to your API endpoint
    headers = {'Content-Type': 'application/json'}
    data = {'query': text}
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error hitting Dialogflow API. Status code: {response.status_code}")

# Helper function to mask the words
def mask_words(image, bounding_boxes):
    draw = ImageDraw.Draw(image)
    for box in bounding_boxes:
        x, y, w, h = box
        draw.rectangle([x, y, x + w, y + h], fill="black")
    return image

# Helper function to aggregate text into lines based on y-coordinates
def aggregate_text_by_line(ocr_data):
    lines = []
    current_line = []
    current_y = None

    for i in range(len(ocr_data['text'])):
        if int(ocr_data['conf'][i]) > 0:
            text = ocr_data['text'][i].strip()
            if text:
                x = ocr_data['left'][i]
                y = ocr_data['top'][i]
                w = ocr_data['width'][i]
                h = ocr_data['height'][i]
                
                if current_y is None or abs(y - current_y) < h:
                    current_line.append((text, x, y, w, h))
                else:
                    lines.append(current_line)
                    current_line = [(text, x, y, w, h)]
                
                current_y = y

    if current_line:
        lines.append(current_line)
    
    return lines

# Function to convert the masked image to a PDF
def convert_to_pdf(image: Image.Image, link: str) -> io.BytesIO:
    with NamedTemporaryFile(delete=False, suffix=".png") as temp_image:
        image.save(temp_image, format="PNG")
        temp_image_path = temp_image.name
    with open(temp_image_path, "rb") as img_file:
        pdf_bytes = img2pdf.convert(img_file.read())
    pdf = FPDF()
    pdf.add_page()
    pdf.image(temp_image_path, x=10, y=10, w=180)
    pdf.set_xy(10, 260)
    pdf.set_font("Arial", size=12, style='U')
    pdf.set_text_color(0, 0, 255)
    pdf.cell(0, 10, "Request for masked version", ln=1, link=link)
    pdf_output = io.BytesIO()
    pdf_output.write(pdf.output(dest='S').encode('latin1'))
    os.remove(temp_image_path)
    pdf_output.seek(0)
    return pdf_output

# Flask route to process the image
@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        cid = request.form.get('cid')
        manager_address = request.form.get('managerAddress')
        upload_address = request.form.get('uploadAddress')

        if not cid or not manager_address or not upload_address:
            return jsonify({"error": "CID, managerAddress, and uploadAddress are required"}), 400

        # Step 1: Download image from IPFS
        image = download_image_from_ipfs(cid)

        # Step 2: Preprocess the image
        preprocessed_image = preprocess_image(image)

        # Step 3: Perform OCR
        ocr_data = perform_ocr_with_coordinates(preprocessed_image)

        # Step 4: Aggregate text into lines
        aggregated_lines = aggregate_text_by_line(ocr_data)

        bounding_boxes = []
        for line in aggregated_lines:
            sentence = ' '.join([text for text, x, y, w, h in line])
            
            # Call Dialogflow API for each aggregated line (sentence)
            dialogflow_response = hit_dialogflow_api(sentence)
            
            if dialogflow_response.get('fulfillmentText') == '1':
                for text, x, y, w, h in line:
                    bounding_boxes.append((x, y, w, h))
            keywords = ['address', 'पता']
            if any(keyword in sentence.lower() for keyword in keywords):
                for _, x, y, w, h in line:
                    # Expand the bounding box by 10 pixels and add it to bounding_boxes
                    bounding_boxes.append((x, y, w, h))

        # Convert image to PIL for masking
        pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        # Step 5: Mask the sensitive information in the image
        masked_image = mask_words(pil_image, bounding_boxes)

        # Step 6: Convert masked image to PDF
        link = f"http://localhost:3000/pdf/unmasked/{manager_address}/{upload_address}"
        pdf_output = convert_to_pdf(masked_image, link)

        # Return masked PDF
        return send_file(
            pdf_output,
            as_attachment=True,
            download_name='masked_document.pdf',
            mimetype='application/pdf'
        )

    except requests.RequestException as e:
        return jsonify({"error": f"Request error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)