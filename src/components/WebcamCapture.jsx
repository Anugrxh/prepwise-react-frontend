import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const WebcamCapture = ({ onCapture, onVideoRecorded, isRecording = false, className = "" }) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  const handleUserMedia = useCallback((stream) => {
    console.log('🎥 Camera stream received:', stream);
    setIsWebcamEnabled(true);
    setError(null);
    
    // Set up MediaRecorder for video recording
    if (stream && typeof MediaRecorder !== 'undefined') {
      try {
        // Remove audio tracks from the stream to record video only
        const videoStream = new MediaStream();
        stream.getVideoTracks().forEach(track => {
          videoStream.addTrack(track);
        });
        console.log('🎥 Audio muted - recording video only');
        
        // Use WebM format (most reliable) and let Django handle it
        let mimeType = 'video/webm;codecs=vp8';
        
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        
        console.log('🎥 Using reliable WebM format:', mimeType);
        
        console.log('🎥 Using MIME type:', mimeType);
        
        const mediaRecorder = new MediaRecorder(videoStream, {
          mimeType: mimeType
        });
        
        mediaRecorder.ondataavailable = (event) => {
          console.log('🎥 Data available:', event.data.size, 'bytes', 'type:', event.data.type);
          if (event.data.size > 0) {
            setRecordedChunks((prev) => {
              const newChunks = [...prev, event.data];
              console.log('🎥 Total chunks:', newChunks.length, 'Total size:', newChunks.reduce((sum, chunk) => sum + chunk.size, 0));
              return newChunks;
            });
          }
        };
        
        mediaRecorder.onstart = () => {
          console.log('🎥 MediaRecorder started successfully');
        };
        
        mediaRecorder.onstop = () => {
          console.log('🎥 MediaRecorder stopped');
        };
        
        mediaRecorder.onerror = (event) => {
          console.error('🎥 MediaRecorder error:', event.error);
          setError('Recording failed: ' + event.error.message);
        };
        
        mediaRecorderRef.current = mediaRecorder;
        console.log('🎥 MediaRecorder setup complete');
      } catch (error) {
        console.error('🎥 Failed to create MediaRecorder:', error);
        setError('Video recording not supported in this browser');
      }
    } else {
      console.error('🎥 MediaRecorder not available');
      setError('Video recording not supported');
    }
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

  // Handle recording start/stop based on isRecording prop
  useEffect(() => {
    if (mediaRecorderRef.current) {
      if (isRecording && mediaRecorderRef.current.state === 'inactive') {
        console.log('🎥 Starting recording...');
        setRecordedChunks([]);
        try {
          // Use no timeslice for better file integrity
          mediaRecorderRef.current.start(); // Record as single chunk
          console.log('🎥 Recording started successfully (single chunk mode)');
        } catch (error) {
          console.error('🎥 Failed to start recording:', error);
          setError('Failed to start recording: ' + error.message);
        }
      } else if (!isRecording && mediaRecorderRef.current.state === 'recording') {
        console.log('🎥 Stopping recording...');
        try {
          // Stop recording immediately (don't request extra data)
          mediaRecorderRef.current.stop();
          console.log('🎥 Recording stopped successfully');
        } catch (error) {
          console.error('🎥 Failed to stop recording:', error);
        }
      }
    } else if (isRecording) {
      console.error('🎥 Cannot start recording - MediaRecorder not available');
      setError('Camera not ready for recording');
    }
  }, [isRecording]);

  // Handle recorded chunks and create video file
  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      // Add delay to ensure all data is available
      setTimeout(() => {
        console.log('🎥 Creating video file from', recordedChunks.length, 'chunks');
        
        // Calculate total size
        const totalSize = recordedChunks.reduce((total, chunk) => total + chunk.size, 0);
        console.log('🎥 Total video size:', totalSize, 'bytes');
        
        // Log each chunk for debugging
        recordedChunks.forEach((chunk, index) => {
          console.log(`🎥 Chunk ${index + 1}: ${chunk.size} bytes, type: ${chunk.type}`);
        });
      
      if (totalSize > 1000) { // Minimum 1KB for a valid video
        // Keep original WebM format (don't fake convert to MP4)
        const originalMimeType = recordedChunks[0].type || 'video/webm';
        console.log('🎥 Recording MIME type:', originalMimeType);
        
        // Create blob and file with original format
        const blob = new Blob(recordedChunks, { type: originalMimeType });
        const extension = originalMimeType.includes('mp4') ? 'mp4' : 'webm';
        
        const videoFile = new File([blob], `interview-recording-${Date.now()}.${extension}`, {
          type: originalMimeType
        });
        
        console.log('🎥 Created video file:', {
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          isRealFormat: true
        });
        
        console.log('🎥 Video file created:', {
          name: videoFile.name,
          size: videoFile.size,
          type: videoFile.type,
          lastModified: videoFile.lastModified
        });
        
        // Validate the blob
        if (blob.size === videoFile.size && blob.size > 0) {
          console.log('🎥 Video file validation: PASSED');
          if (onVideoRecorded) {
            onVideoRecorded(videoFile);
          }
        } else {
          console.error('🎥 Video file validation: FAILED');
          setError('Video file validation failed');
        }
      } else {
        console.error('🎥 Video too small or empty:', totalSize, 'bytes');
        setError('Video recording too short or empty');
      }
      
        setRecordedChunks([]);
      }, 500); // 500ms delay to ensure data is complete
    }
  }, [recordedChunks, isRecording, onVideoRecorded]);

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
