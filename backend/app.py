from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import subprocess
import tempfile
import os
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://stg2-jp.misumi-ec.com/inventory/locator","https://usertest2025-07-jp.misumi-ec.com/inventory/locator"])

def decode_image(img):
    """
    Decode barcodes using ZXing CLI
    """
    try:
        # Create a temporary file to save the image
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            temp_path = temp_file.name
            
        # Save the image to the temporary file
        cv2.imwrite(temp_path, img)
        
        try:
            # Run ZXing CLI to decode barcodes
            result = subprocess.run(
                ['zxing', temp_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            decoded_results = []
            
            if result.returncode == 0 and result.stdout.strip():
                # ZXing CLI outputs each barcode on a separate line
                # Format is typically: "Format Text"
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if line.strip():
                        # Try to parse the format and data
                        parts = line.strip().split(' ', 1)
                        if len(parts) >= 2:
                            barcode_type = parts[0]
                            barcode_data = parts[1]
                        else:
                            barcode_type = 'Unknown'
                            barcode_data = line.strip()
                        
                        decoded_results.append({
                            'type': barcode_type,
                            'data': barcode_data
                        })
            
            return decoded_results
            
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
                
    except subprocess.TimeoutExpired:
        print("[ERROR] ZXing CLI timeout")
        return []
    except Exception as e:
        print(f"[ERROR] ZXing decoding failed: {str(e)}")
        return []

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
    import os
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=False)