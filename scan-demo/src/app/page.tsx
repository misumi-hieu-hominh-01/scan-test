"use client";

import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";

// Interface for barcode result
interface BarcodeResult {
  success?: boolean;
  data?: string;
  error?: string;
  [key: string]: unknown;
}

// Function to decode barcode from captured image
async function decodeBarcodeFromCapture(
  imageSrc: string,
  backendUrl = "http://localhost:5002/decode-barcode"
) {
  // Convert base64 to blob
  const response = await fetch(imageSrc);
  const blob = await response.blob();

  // Create FormData and append the image
  const formData = new FormData();
  formData.append("image", blob, "capture.jpg");

  const apiResponse = await fetch(backendUrl, {
    method: "POST",
    body: formData,
  });

  return apiResponse.json();
}

// Function to decode barcode from uploaded file
async function decodeBarcodeFromFile(
  file: File,
  backendUrl = "http://localhost:5002/decode-barcode"
) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(backendUrl, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"camera" | "upload" | null>(
    null
  );

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setUploadedImage(null);
      setImageSource("camera");
      setLoading(true);
      setError(null);

      try {
        const barcodeResult = await decodeBarcodeFromCapture(imageSrc);
        setResult(barcodeResult);
      } catch (err) {
        setError("Failed to decode barcode. Please try again.");
        console.error("Error decoding barcode:", err);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Create preview URL
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage(imageUrl);
        setCapturedImage(null);
        setImageSource("upload");
        setLoading(true);
        setError(null);

        try {
          const barcodeResult = await decodeBarcodeFromFile(file);
          setResult(barcodeResult);
        } catch (err) {
          setError("Failed to decode barcode. Please try again.");
          console.error("Error decoding barcode:", err);
        } finally {
          setLoading(false);
        }
      }
    },
    []
  );

  const retryCapture = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    setResult(null);
    setError(null);
    setImageSource(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const currentImage = imageSource === "camera" ? capturedImage : uploadedImage;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "1rem",
        backgroundColor: "#f5f5f5",
      }}
    >
      <main
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2rem)",
            fontWeight: "bold",
            textAlign: "center",
            margin: "0 0 1rem 0",
            color: "#333",
          }}
        >
          Barcode Scanner
        </h1>

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "500px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            height="auto"
            style={{
              border: "2px solid #333",
              borderRadius: "12px",
              maxWidth: "100%",
              height: "auto",
              minHeight: "400px",
              objectFit: "cover",
            }}
            videoConstraints={{
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: "environment", // Use back camera on mobile
            }}
          />

          {/* Capture button overlay */}
          <button
            onClick={capture}
            disabled={loading}
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "white",
              color: "#333",
              border: "2px solid #333",
              borderRadius: "50%",
              width: "70px",
              height: "70px",
              fontSize: "24px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {loading ? "..." : "📷"}
          </button>
        </div>

        {/* Upload button */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button
            onClick={triggerFileUpload}
            disabled={loading}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "500",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Upload Image
          </button>
        </div>

        {/* Image preview */}
        {currentImage && (
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                margin: "0 0 1rem 0",
                color: "#333",
              }}
            >
              {imageSource === "camera" ? "Captured Image:" : "Uploaded Image:"}
            </h3>
            <img
              src={currentImage}
              alt={imageSource === "camera" ? "Captured" : "Uploaded"}
              style={{
                width: "100%",
                maxWidth: "300px",
                height: "auto",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            />
            <br />
            <button
              onClick={retryCapture}
              style={{
                backgroundColor: "#666",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Try Another Image
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              fontSize: "18px",
              color: "#666",
            }}
          >
            <p>Processing barcode...</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "1rem",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "8px",
              border: "1px solid #ef5350",
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "1rem",
              backgroundColor: "#e8f5e8",
              borderRadius: "8px",
              border: "1px solid #4caf50",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                fontSize: "1.2rem",
                color: "#333",
              }}
            >
              Barcode Result:
            </h3>
            <pre
              style={{
                backgroundColor: "#f5f5f5",
                padding: "1rem",
                borderRadius: "8px",
                overflow: "auto",
                fontSize: "14px",
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#000000",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "1rem",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <h4
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1.1rem",
              color: "#333",
            }}
          >
            Instructions:
          </h4>
          <ul
            style={{
              textAlign: "left",
              lineHeight: "1.6",
              margin: 0,
              paddingLeft: "1.2rem",
              fontSize: "14px",
              color: "#666",
            }}
          >
            <li>
              Position the barcode in front of your camera and click the white
              camera button
            </li>
            <li>
              OR click &quot;Upload Image&quot; to select a barcode image from
              your device
            </li>
            <li>Make sure the barcode is clearly visible and well-lit</li>
            <li>Results will appear below the image</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
