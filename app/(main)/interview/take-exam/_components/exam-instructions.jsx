"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, AlertCircle, CheckCircle2, Loader2, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getWebcamStream } from "@/lib/proctoring-service";

export default function ExamInstructions({ onProceedToExam, examConfig, isGenerating = false }) {
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const cameraStreamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setcameraError] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsLoadingCamera(true);
        setcameraError(null);
        const stream = await getWebcamStream();
        setCameraStream(stream);
        cameraStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn("Video playback failed:", playErr);
          }
        }
        setCameraReady(true);
        toast.success("📷 Camera ready! You can proceed when ready.");
      } catch (err) {
        console.error("Camera initialization error:", err);
        setcameraError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoadingCamera(false);
      }
    };

    initCamera();

    return () => {
      // Cleanup: Stop camera stream
      const s = cameraStreamRef.current;
      if (s) s.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    };
  }, []);

  const handleRetryCamera = async () => {
    try {
      setIsLoadingCamera(true);
      setcameraError(null);

      // Stop existing stream
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
      }

      // Try again
      const stream = await getWebcamStream();
      setCameraStream(stream);
      cameraStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video playback failed:", playErr);
        }
      }
      setCameraReady(true);
      toast.success("📷 Camera ready!");
    } catch (err) {
      console.error("Camera retry error:", err);
      setcameraError(err.message);
      toast.error("Failed to access camera. Please check permissions.");
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const handleProceed = async (e) => {
    e.preventDefault();

    if (!cameraReady) {
      toast.error("Camera is not ready. Please enable camera access.");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please acknowledge the proctoring terms.");
      return;
    }

    // Stop camera stream before proceeding
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    // Request fullscreen
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        console.log("✓ Fullscreen activated");
        toast.success("✓ Exam started in fullscreen mode");
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request failed:", err.message);
      toast.warning("⚠️ Could not activate fullscreen. Please press F11 or zoom functionality.");
    }

    // Proceed to exam
    onProceedToExam();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Exam Instructions</h1>
          <p className="text-slate-300">
            Review the rules and confirm your camera is working before you start.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Instructions */}
          <div className="space-y-6">
            {/* Proctoring Requirements */}
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-blue-400" />
                  Proctoring Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Full Screen Mode</p>
                      <p className="text-sm text-slate-300">Remain in fullscreen for the entire exam.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Camera Always On</p>
                      <p className="text-sm text-slate-300">Camera must stay active for identity verification.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Well‑Lit Environment</p>
                      <p className="text-sm text-slate-300">Make sure your face is clearly visible.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">No Tab Switching</p>
                      <p className="text-sm text-slate-300">Switching tabs/windows is recorded as a violation.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Quiet Environment</p>
                      <p className="text-sm text-slate-300">Minimize background noise and interruptions.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Single Person</p>
                      <p className="text-sm text-slate-300">No one else should be present in the room.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exam Details */}
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle>Exam Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-300">Total Questions</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {Object.values(examConfig?.questionCounts || {}).reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Duration</p>
                    <p className="text-2xl font-bold text-blue-400">{examConfig?.duration || 60} min</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-sm text-slate-200"><span className="font-semibold text-white">Industry:</span> {examConfig?.industry || "N/A"}</p>
                  <p className="text-sm text-slate-200"><span className="font-semibold text-white">Difficulty:</span> {examConfig?.difficulty || "Medium"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Agreement */}
            <Card className="border-blue-900/50 bg-blue-950/40 backdrop-blur">
              <CardContent className="pt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 rounded border-slate-600 bg-slate-900"
                  />
                  <span className="text-sm text-slate-200">
                    I understand and acknowledge the proctoring requirements. I confirm that I am in a suitable environment and will comply with all rules during this exam.
                  </span>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Right: Camera Preview */}
          <div className="space-y-4">
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-rose-400" />
                  Camera Preview
                </CardTitle>
                <CardDescription>
                  <span className="text-slate-300">{cameraReady ? "Camera is ready" : "Setting up camera..."}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera Stream */}
                <div className="bg-black rounded-lg overflow-hidden">
                  {isLoadingCamera && (
                    <div className="aspect-video flex items-center justify-center bg-gray-900">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                        <p className="text-white text-sm">Initializing camera...</p>
                      </div>
                    </div>
                  )}
                  {!isLoadingCamera && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full aspect-video object-cover"
                      style={{ transform: "scaleX(-1)" }} // Mirror the video
                    />
                  )}
                </div>

                {/* Camera Status */}
                {cameraError && (
                  <Card className="border-rose-900/50 bg-rose-950/40">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-white mb-2">Camera Access Denied</p>
                          <p className="text-sm text-slate-200 mb-3">{cameraError}</p>
                          <Button
                            size="sm"
                            onClick={handleRetryCamera}
                            className="w-full bg-rose-600 hover:bg-rose-700"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Retry Camera Access
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {cameraReady && (
                  <Card className="border-emerald-900/50 bg-emerald-950/40">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-emerald-200">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        <span>Camera is ready. Keep your face clearly visible.</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 space-y-2">
                  <p className="font-semibold text-sm text-white">Camera tips</p>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>- Center your face in the frame</li>
                    <li>- Ensure good lighting</li>
                    <li>- Remove sunglasses/obstructions</li>
                    <li>- Stay visible throughout</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Proceed Button */}
            <Button
              onClick={handleProceed}
              disabled={!cameraReady || !agreedToTerms || isLoadingCamera || isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating your exam...
                </>
              ) : isLoadingCamera ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : !cameraReady ? (
                "Waiting for Camera..."
              ) : !agreedToTerms ? (
                "Please Agree to Terms"
              ) : (
                "Start Exam Now →"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
