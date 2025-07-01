from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from pyzbar.pyzbar import decode as pyzbar_decode

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://stg2-jp.misumi-ec.com/inventory/locator","https://usertest2025-07-jp.misumi-ec.com/inventory/locator"])

def decode_image(img):
    decoded = pyzbar_decode(img)
    return [{'type': b.type, 'data': b.data.decode('utf-8')} for b in decoded]

@app.route('/decode-barcode', methods=['POST'])
def decode_barcode():
    if 'image' not in request.files and (not request.is_json or 'image_base64' not in request.json):
        return jsonify({'success': False, 'error': 'No image provided'}), 400

    # Handle file upload
    if 'image' in request.files:
        file = request.files['image']
        npimg = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    else:
         # Handle base64 upload
        image_b64 = request.json['image_base64']
        try:
            img_data = base64.b64decode(image_b64)
            npimg = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        except Exception as e:
            return jsonify({'success': False, 'error': 'Invalid base64 image data'}), 400

    if img is None:
        return jsonify({'success': False, 'error': 'Invalid image data'}), 400

    # Decode
    results = decode_image(img)
    print(f"[INFO] Detected {len(results)} barcode(s)")

    return jsonify({'success': True, 'barcodes': results})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)