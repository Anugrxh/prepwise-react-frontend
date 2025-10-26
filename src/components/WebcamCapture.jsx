import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const WebcamCapture = ({ onCapture, isRecording = false, className = "" }) => {
  const webcamRef = useRef(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(true);
  const [error, setError] = useState(null);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  const handleUserMedia = useCallback(() => {
    setIsWebcamEnabled(true);
    setError(null);
  }, []);

  const handleUserMediaError = useCallback((error) => {
    setError("Unable to access camera. Please check permissions.");
    setIsWebcamEnabled(false);
    console.error("Webcam error:", error);
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc && onCapture) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <div className={`webcam-container ${className}`}>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {isWebcamEnabled ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full h-auto"
            />
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">
                  Recording
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-gray-800 text-white">
            {error ? (
              <div className="text-center p-4">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-300">{error}</p>
              </div>
            ) : (
              <div className="text-center p-4">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-300">Initializing camera...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
