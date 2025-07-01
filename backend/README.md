# Barcode Backend (Flask)

This backend provides a REST API to decode barcodes from images using Python, OpenCV, and pyzbar.

## Setup

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python app.py
   ```

The server will start on `http://localhost:5002`.

## API Usage

### POST /decode-barcode

- **Form-data:**
  - `image`: Image file (PNG, JPG, etc.)
- **OR JSON:**
  - `image_base64`: Base64-encoded image string

**Response:**

```json
{
  "success": true,
  "barcodes": [{ "type": "CODE128", "data": "1234567890" }]
}
```

**Error:**

```json
{
  "success": false,
  "error": "No image provided"
}
```
