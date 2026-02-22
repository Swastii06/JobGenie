import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { frameData, examId } = await req.json();

    if (!frameData) {
      return Response.json({ error: "Frame data required" }, { status: 400 });
    }

    // Send frame to Django proctoring service for analysis
    const pythonServiceUrl = process.env.NEXT_PUBLIC_PROCTORING_API_URL || "http://127.0.0.1:8000";
    
    try {
      const response = await fetch(
        `${pythonServiceUrl}/api/proctoring/analyze-frame/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            frame_data: frameData,
            exam_id: examId,
            user_id: userId,
          }),
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) {
        throw new Error(`Django service error: ${response.status}`);
      }

      const data = await response.json();

      // Extract violations from response
      const violations = [];

      // Check for multiple faces
      if (data.multiple_faces_detected) {
        violations.push({
          type: "MULTIPLE_FACES",
          message: "Multiple faces detected in frame",
          severity: "high",
          confidence: data.multiple_faces_confidence || 85,
        });
      }

      // Check for no face detected
      if (data.no_face_detected) {
        violations.push({
          type: "NO_FACE",
          message: "Face not detected. Please ensure your face is visible",
          severity: "medium",
          confidence: data.no_face_confidence || 90,
        });
      }

      // Check for suspicious objects (phone, documents, etc.)
      if (data.suspicious_objects && Array.isArray(data.suspicious_objects)) {
        data.suspicious_objects.forEach(obj => {
          violations.push({
            type: "SUSPICIOUS_OBJECT",
            message: `Suspicious object detected: ${obj}`,
            severity: "high",
            confidence: data.object_confidence || 75,
          });
        });
      }

      // Check for head pose (looking away)
      if (data.head_pose_angle && data.head_pose_angle > 30) {
        violations.push({
          type: "HEAD_POSE",
          message: "Your head is turned too far. Look at the screen",
          severity: "medium",
          confidence: 80,
        });
      }

      // Check for blocked face (hand covering face, etc.)
      if (data.face_blocked) {
        violations.push({
          type: "FACE_BLOCKED",
          message: "Your face is partially blocked. Keep it clear",
          severity: "high",
          confidence: data.face_blocked_confidence || 85,
        });
      }

      // Check for eyes closed or looking away
      if (data.eyes_closed) {
        violations.push({
          type: "EYES_CLOSED",
          message: "Eyes detected as closed",
          severity: "medium",
          confidence: data.eyes_closed_confidence || 75,
        });
      }

      return Response.json({
        success: true,
        violations: violations,
        faceDetected: !data.no_face_detected,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Django proctoring service error:", error.message);
      
      // If Django service is unavailable, return empty violations
      // but log for monitoring
      return Response.json({
        success: true,
        violations: [],
        faceDetected: true,
        serviceAvailable: false,
        message: "Proctoring service temporarily unavailable. Continuing with local checks."
      });
    }
  } catch (error) {
    console.error("Error analyzing frame:", error);
    return Response.json(
      { error: "Failed to analyze frame" },
      { status: 500 }
    );
  }
}
