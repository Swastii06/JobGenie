// components/proctoring/webcam-capture.jsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2, Camera } from "lucide-react";
import { canvasToBase64, getWebcamStream } from "@/lib/proctoring-service";

export default function WebcamCapture({
  onCapture,
  isLoading = false,
  onStream,
  minimal = false, // when true, render bare preview without text/chrome
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    const initWebcam = async () => {
      try {
        setError(null);
        const userStream = await getWebcamStream();
        setStream(userStream);
        streamRef.current = userStream;

        // Notify parent of active stream so it can manage cleanup
        if (typeof onStream === "function") {
          try { onStream(userStream); } catch (e) { /* ignore */ }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (err) {
        console.error("Camera initialization error:", err);
        setError(err.message);
      }
    };

    initWebcam();

    return () => {
      const s = streamRef.current;
      if (s) s.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      // Clear parent stream reference on unmount
      if (typeof onStream === "function") {
        try { onStream(null); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  const handleRetryCamera = () => {
    setError(null);
    // Retry camera initialization
    const initWebcam = async () => {
      try {
        const userStream = await getWebcamStream();
        setStream(userStream);
        streamRef.current = userStream;
        
        if (typeof onStream === "function") {
          try { onStream(userStream); } catch (e) { /* ignore */ }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (err) {
        console.error("Camera retry failed:", err);
        setError(err.message);
      }
    };
    initWebcam();
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      const imageData = canvasToBase64(canvasRef.current);
      setCapturedImage(imageData);
      onCapture(imageData);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Camera Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
          <CardDescription className="mt-2 text-sm">
            💡 Make sure you've granted camera permissions to this site in your browser settings, then click retry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleRetryCamera}
            className="w-full"
            variant="outline"
          >
            <Camera className="h-4 w-4 mr-2" />
            Retry Camera Access
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Minimal overlay mode: just show live preview, no text/buttons
  if (minimal) {
    return (
      <div className="w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" width={320} height={240} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Face Verification
        </CardTitle>
        <CardDescription>
          Please position your face in the center of the camera frame
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {!capturedImage ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="rounded-lg border border-border w-full max-w-sm"
              style={{ aspectRatio: "4/3" }}
            />
          ) : (
            <div className="space-y-4 w-full">
              <img
                src={capturedImage}
                alt="Captured"
                className="rounded-lg border border-border w-full max-w-sm mx-auto"
              />
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={handleRetake} disabled={isLoading}>
                  Retake Photo
                </Button>
                <Button onClick={handleCapture} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Use This Photo"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" width={320} height={240} />

        {!capturedImage && (
          <Button
            onClick={handleCapture}
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
