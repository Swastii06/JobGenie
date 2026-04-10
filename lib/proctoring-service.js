// lib/proctoring-service.js
// Service for communicating with the Django Proctoring API

const PROCTORING_API_BASE = process.env.NEXT_PUBLIC_PROCTORING_API_URL || "http://127.0.0.1:8000";

/**
 * Generic function to make API calls to the proctoring service
 */
export const proctoringApiCall = async (endpoint, method = "GET", data = null) => {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${PROCTORING_API_BASE}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "API request failed");
    }

    return result;
  } catch (error) {
    console.error(`Proctoring API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== STUDENT MANAGEMENT ====================

/**
 * Register a new student with face capture
 */
export const registerStudent = async (studentData) => {
  return proctoringApiCall("/api/register-student/", "POST", studentData);
};

/**
 * Verify student face during login
 */
export const verifyStudentFace = async (credentials) => {
  return proctoringApiCall("/api/verify-face/", "POST", credentials);
};

// ==================== EXAM MANAGEMENT ====================

/**
 * Start a new exam session
 */
export const startExam = async (examData) => {
  return proctoringApiCall("/api/start-exam/", "POST", examData);
};

/**
 * Submit exam with results
 */
export const submitExam = async (examData) => {
  return proctoringApiCall("/api/submit-exam/", "POST", examData);
};

/**
 * Get exam results and violations
 */
export const getExamResult = async (examId) => {
  return proctoringApiCall(`/api/exam-result/${examId}/`, "GET");
};

/**
 * Record a proctoring violation in real-time
 */
export const recordViolation = async (violationData) => {
  return proctoringApiCall("/api/record-violation/", "POST", violationData);
};

/**
 * Record tab switch events
 */
export const recordTabSwitch = async (tabSwitchData) => {
  return proctoringApiCall("/api/record-tab-switch/", "POST", tabSwitchData);
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert canvas to base64 image data
 */
export const canvasToBase64 = (canvas) => {
  return canvas.toDataURL("image/png");
};

/**
 * Get user's webcam stream
 */
export const getWebcamStream = async () => {
  try {
    console.log("Checking media access support...");
    console.log("navigator.mediaDevices:", !!navigator.mediaDevices);
    console.log("navigator.getUserMedia:", !!navigator.getUserMedia);
    console.log("isSecureContext:", window.isSecureContext);
    console.log("location.protocol:", location.protocol);

    let getUserMedia;

    // Check for modern MediaDevices API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("Using navigator.mediaDevices.getUserMedia");
      getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    }
    // Fallback to deprecated getUserMedia for older browsers
    else if (navigator.getUserMedia) {
      console.log("Using navigator.getUserMedia (deprecated)");
      getUserMedia = (constraints) => {
        return new Promise((resolve, reject) => {
          navigator.getUserMedia(constraints, resolve, reject);
        });
      };
    }
    // Not supported
    else {
      console.error("No getUserMedia API available");
      throw new Error("Camera access is not supported in this browser or context. Please use a modern browser and ensure the page is served over HTTPS.");
    }

    const stream = await getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false,
    });
    console.log("✓ Webcam stream obtained successfully");
    return stream;
  } catch (error) {
    console.error("Error accessing webcam:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    // Provide specific error messages based on error type
    let userFriendlyMessage = "Unable to access webcam. Please check camera permissions.";
    
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      userFriendlyMessage = "Camera access was denied. Please grant camera permission in your browser settings and try again.";
    } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      userFriendlyMessage = "No camera device found. Please ensure a camera is connected to your device.";
    } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      userFriendlyMessage = "Camera is already in use by another application. Please close it and try again.";
    } else if (error.name === "SecurityError") {
      userFriendlyMessage = "Camera access is not allowed in this context. Ensure the page is using HTTPS.";
    }
    
    throw new Error(userFriendlyMessage);
  }
};

/**
 * Capture audio stream for proctoring
 */
export const getAudioStream = async () => {
  try {
    let getUserMedia;

    // Check for modern MediaDevices API
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    }
    // Fallback to deprecated getUserMedia for older browsers
    else if (navigator.getUserMedia) {
      getUserMedia = (constraints) => {
        return new Promise((resolve, reject) => {
          navigator.getUserMedia(constraints, resolve, reject);
        });
      };
    }
    // Not supported
    else {
      throw new Error("Audio access is not supported in this browser or context. Please use a modern browser and ensure the page is served over HTTPS.");
    }

    const stream = await getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    return stream;
  } catch (error) {
    console.error("Error accessing microphone:", error);
    throw new Error("Unable to access microphone. Please check audio permissions.");
  }
};

/**
 * Check if proctoring service is available
 */
export const healthCheck = async () => {
  try {
    const result = await proctoringApiCall("/api/health/", "GET");
    return result.success;
  } catch (error) {
    console.error("Proctoring service health check failed:", error);
    return false;
  }
};

/**
 * Monitor screen for tab switches and suspicious activity
 */
export const startProctoringMonitoring = (onViolation) => {
  let tabSwitchCount = 0;

  // Monitor visibility changes (tab/window focus)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      tabSwitchCount++;
      onViolation("tab_switch", {
        type: "tab_switch",
        description: "User switched away from exam tab",
        tab_switches: tabSwitchCount,
      });
    }
  };

  // Monitor right-click
  const handleContextMenu = (e) => {
    e.preventDefault();
    onViolation("context_menu", {
      type: "context_menu",
      description: "Right-click attempt detected",
    });
  };

  // Monitor keyboard shortcuts
  const handleKeyDown = (e) => {
    // Disable common shortcuts
    if (
      (e.ctrlKey && e.key === "s") || // Ctrl+S
      (e.ctrlKey && e.key === "p") || // Ctrl+P
      (e.ctrlKey && e.shiftKey && e.key === "i") || // Ctrl+Shift+I
      e.key === "F12" // F12
    ) {
      e.preventDefault();
      onViolation("keyboard_shortcut", {
        type: "keyboard_shortcut",
        description: `Keyboard shortcut blocked: ${e.key}`,
      });
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  document.addEventListener("contextmenu", handleContextMenu);
  document.addEventListener("keydown", handleKeyDown);

  // Return cleanup function
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    document.removeEventListener("contextmenu", handleContextMenu);
    document.removeEventListener("keydown", handleKeyDown);
  };
};
