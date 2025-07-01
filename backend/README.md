# Barcode Scanner Backend

A Flask backend service for barcode/QR code scanning using ZXing CLI.

## Changes from pyzbar to ZXing CLI

This application has been updated to use **ZXing CLI** instead of pyzbar for better deployment compatibility with platforms like render.com.

### Key Changes:

1. **Removed pyzbar dependency** - No longer requires Python bindings to C libraries
2. **Added ZXing CLI integration** - Uses the ZXing C++ CLI tool for barcode decoding
3. **Docker-based deployment** - Full containerization for consistent deployment
4. **Production-ready** - Uses gunicorn for production serving

## Local Development

### Prerequisites

- Python 3.10+
- Docker (for deployment)
- ZXing CLI (for local development without Docker)

### Setup

1. Create virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Install ZXing CLI:

**On macOS:**

```bash
# Option 1: Using Homebrew (Recommended)
brew install zxing-cpp

# Option 2: Build from source
brew install cmake opencv
git clone https://github.com/zxing-cpp/zxing-cpp.git
cd zxing-cpp
mkdir build && cd build
cmake .. -DBUILD_EXAMPLES=ON
make -j$(sysctl -n hw.ncpu)
cp zxing /usr/local/bin/
```

**On Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install -y build-essential cmake git libopencv-dev
git clone https://github.com/zxing-cpp/zxing-cpp.git
cd zxing-cpp
mkdir build && cd build
cmake .. -DBUILD_EXAMPLES=ON
make -j$(nproc)
sudo cp zxing /usr/local/bin/
```

4. Test the setup:

```bash
python test_zxing.py
```

5. Run the development server:

```bash
python app.py
```

## Docker Deployment

### Build and run locally:

```bash
docker build -t barcode-backend .
docker run -p 5002:5002 barcode-backend
```

### Deploy to render.com:

1. Connect your GitHub repository to render.com
2. Create a new web service
3. Select "Docker" as the environment
4. The `render.yaml` file will automatically configure the deployment
5. Deploy!

## API Endpoints

### POST /decode-barcode

Decode barcodes from uploaded images.

**Request formats:**

1. File upload:

```bash
curl -X POST -F "image=@barcode.jpg" http://localhost:5002/decode-barcode
```

2. Base64 image:

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"image_base64":"<base64-encoded-image>"}' \
  http://localhost:5002/decode-barcode
```

**Response:**

```json
{
  "success": true,
  "barcodes": [
    {
      "type": "QR_CODE",
      "data": "Hello World"
    }
  ]
}
```

## Environment Variables

- `PORT`: Server port (default: 5002)
- `FLASK_ENV`: Flask environment (production/development)

## Supported Barcode Types

ZXing CLI supports various barcode formats including:

- QR Code
- Code 128
- Code 39
- EAN-13/EAN-8
- UPC-A/UPC-E
- Data Matrix
- PDF417
- And many more...

## Troubleshooting

1. **ZXing CLI not found**: Make sure ZXing CLI is installed and in PATH
2. **Image decode errors**: Check image format and quality
3. **Memory issues**: Ensure sufficient memory for image processing
4. **Timeout errors**: Large images may require longer processing time

## Files Overview

- `app.py` - Main Flask application
- `Dockerfile` - Docker configuration for deployment
- `render.yaml` - render.com deployment configuration
- `requirements.txt` - Python dependencies
- `test_zxing.py` - Test script for ZXing CLI integration
