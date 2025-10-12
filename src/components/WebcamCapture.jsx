import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

const WebcamCapture = ({ onCapture, isRecording = false, className = "" }) => {
  const webcamRef = useRef(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
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

  const toggleWebcam = () => {
    if (isWebcamEnabled) {
      setIsWebcamEnabled(false);
    } else {
      setIsWebcamEnabled(true);
      setError(null);
    }
  };

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
                <p className="text-sm text-gray-300">Camera disabled</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center space-x-3">
        <button
          onClick={toggleWebcam}
          className={`btn ${isWebcamEnabled ? "btn-danger" : "btn-primary"}`}
        >
          {isWebcamEnabled ? (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-4.95-4.95m0 0L5.636 5.636M13.05 16.05L18 21"
                />
              </svg>
              Disable Camera
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
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
              Enable Camera
            </>
          )}
        </button>

        {isWebcamEnabled && onCapture && (
          <button onClick={capture} className="btn btn-outline">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Capture
          </button>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
