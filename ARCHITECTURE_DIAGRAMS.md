# 🏗️ JobGenie Proctoring Integration - Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                               │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  http://localhost:3000                                       │   │
│  │                                                              │   │
│  │  JobGenie Application (Next.js + React)                     │   │
│  │                                                              │   │
│  │  ┌───────────────────────────────────────────────────────┐ │   │
│  │  │  Interview Page                                       │ │   │
│  │  │  └─ Mock Quiz Section                                 │ │   │
│  │  │     └─ ProctoredQuiz Component (NEW)                  │ │   │
│  │  │        ├─ Shows: "Start with Proctoring" button      │ │   │
│  │  │        ├─ Shows: "Continue without Proctoring"       │ │   │
│  │  │        └─ If proctoring selected:                    │ │   │
│  │  │           ├─ WebcamCapture                            │ │   │
│  │  │           ├─ ExamProctoring                           │ │   │
│  │  │           │  ├─ Quiz Component                        │ │   │
│  │  │           │  ├─ ProctoringMonitor (sidebar)          │ │   │
│  │  │           │  └─ ProctoringWarning (alerts)           │ │   │
│  │  │           └─ Real-time monitoring                     │ │   │
│  │  │                                                        │ │   │
│  │  └─────────────┬──────────────────────────────────────────┘ │   │
│  │                │                                              │   │
│  │  ┌─────────────▼──────────────────────────────────────────┐ │   │
│  │  │  lib/proctoring-service.js                            │ │   │
│  │  │  ─ API Communication Layer                            │ │   │
│  │  │  ─ Webcam/Audio Stream Management                     │ │   │
│  │  │  ─ Monitoring Functions                              │ │   │
│  │  │  ─ Helper Utilities                                  │ │   │
│  │  └────────────┬─────────────────────────────────────────┘ │   │
│  │               │                                             │   │
│  │  ┌────────────▼──────────────────────────────────────────┐ │   │
│  │  │  Browser Features                                     │ │   │
│  │  │  ├─ Webcam API (getUserMedia)                         │ │   │
│  │  │  ├─ Audio API                                         │ │   │
│  │  │  ├─ Visibility API (tab focus)                        │ │   │
│  │  │  └─ All monitoring on client-side                     │ │   │
│  │  └────────────┬──────────────────────────────────────────┘ │   │
│  │               │                                             │   │
│  └───────────────┼────────────────────────────────────────────┘   │
│                  │                                                 │
│                  ├─ REST API Calls (AJAX/Fetch)                   │
│                  │ • startExam                                    │
│                  │ • recordViolation                              │
│                  │ • submitExam                                   │
│                  │ • getExamResult                                │
│                  │                                                 │
│                  │ ↓↓↓  JSON over HTTP  ↓↓↓                       │
│                  ▼                                                 │
└─────────────────────────────────────────────────────────────────────┘
                          Network
              ═══════════════════════════
                          ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  PROCTORING SERVICE                                 │
│             http://127.0.0.1:8000 (Django)                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  proctoring/api.py (REST API Endpoints)                    │   │
│  │                                                              │   │
│  │  ├─ /api/health/                     (Health Check)        │   │
│  │  ├─ /api/register-student/           (Registration)        │   │
│  │  ├─ /api/verify-face/                (Authentication)      │   │
│  │  ├─ /api/start-exam/                 (Init Exam)           │   │
│  │  ├─ /api/submit-exam/                (Submit Results)      │   │
│  │  ├─ /api/exam-result/{id}/           (Get Results)         │   │
│  │  ├─ /api/record-violation/           (Log Violation)       │   │
│  │  └─ /api/record-tab-switch/          (Log Tab Switch)      │   │
│  │                                                              │   │
│  │  ┌─ JSON Request ─────────────────────────────────────┐   │   │
│  │  │  {                                                 │   │   │
│  │  │    "student_id": 123,                             │   │   │
│  │  │    "event_type": "tab_switch",                    │   │   │
│  │  │    "detected_objects": [],                        │   │   │
│  │  │    "image_data": "base64..."                      │   │   │
│  │  │  }                                                 │   │   │
│  │  └─ JSON Response ────────────────────────────────────┘   │   │
│  │     {                                                      │   │
│  │       "success": true,                                    │   │
│  │       "message": "Violation recorded",                    │   │
│  │       "event_id": 456                                     │   │
│  │     }                                                      │   │
│  │                                                              │   │
│  └─────────────────┬──────────────────────────────────────────┘   │
│                    │                                               │
│  ┌─────────────────▼──────────────────────────────────────────┐   │
│  │  Django ORM Models                                         │   │
│  │  (proctoring/models.py)                                    │   │
│  │                                                              │   │
│  │  ├─ Student (ID, name, email, face_encoding, photo)       │   │
│  │  ├─ Exam (student_id, exam_name, score, timestamp)        │   │
│  │  ├─ CheatingEvent (student_id, event_type, timestamp)     │   │
│  │  ├─ CheatingImage (event_id, image_url)                   │   │
│  │  └─ CheatingAudio (event_id, audio_url)                   │   │
│  │                                                              │   │
│  └─────────────────┬──────────────────────────────────────────┘   │
│                    │                                               │
│  ┌─────────────────▼──────────────────────────────────────────┐   │
│  │  PostgreSQL Database: jobgenie_proctoring                 │   │
│  │                                                              │   │
│  │  Tables:                                                    │   │
│  │  ├─ proctoring_student                                     │   │
│  │  ├─ proctoring_exam                                        │   │
│  │  ├─ proctoring_cheatingevent                               │   │
│  │  ├─ proctoring_cheatingimage                               │   │
│  │  └─ proctoring_cheatingaudio                               │   │
│  │                                                              │   │
│  └─────────────┬────────────────────────────────────────────┘   │
│                │                                                │
│   File Storage (Media)                                         │
│   └─ media/student_photos/                                     │
│   └─ media/cheating_images/                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### **Scenario: User Takes Proctored Quiz**

```
START
  │
  ├─► User opens Interview page
  │     └─► ProctoredQuiz renders
  │         └─► healthCheck() calls /api/health/
  │             ├─► Success ──► Show "Start with Proctoring" button
  │             └─► Fail ────► Show "Service unavailable" message
  │
  ├─► User clicks "Start with Proctoring"
  │     └─► setProctoringEnabled(true)
  │         └─► WebcamCapture component loads
  │
  ├─► User captures face
  │     └─► Canvas converts to Base64
  │         └─► handleFaceCapture() called with image data
  │             └─► setFaceVerified(true)
  │
  ├─► ExamProctoring component mounts
  │     ├─► startExam() API call
  │     │    POST /api/start-exam/
  │     │    Body: { student_id, exam_name, total_questions }
  │     │    Response: { exam_id, student_id }
  │     │    └─► setExamId(response.exam_id)
  │     │
  │     ├─► startProctoringMonitoring() starts
  │     │    ├─► Monitors visibilitychange (tab switches)
  │     │    ├─► Monitors contextmenu (right-click)
  │     │    ├─► Monitors keydown (developer tools, etc.)
  │     │    └─► On violation: recordViolation() API call
  │     │        POST /api/record-violation/
  │     │        Body: { student_id, event_type, detected_objects }
  │     │        └─► violation added to state
  │     │            └─► ProctoringMonitor updates
  │     │                └─► ProctoringWarning shows modal
  │     │
  │     └─► sessionTime incremented every second
  │         └─► formatTime() displays in monitor
  │
  ├─► User answers quiz questions
  │     └─► Answers stored in component state
  │         └─► Quiz component handles UI
  │
  ├─► Tab Switch Event (Example Violation)
  │     ├─► Document becomes hidden (user leaves tab)
  │     │    └─► handleVisibilityChange() triggered
  │     │        └─► tabSwitchCount++ 
  │     │            └─► recordViolation({ type: 'tab_switch', ... })
  │     │                POST /api/record-tab-switch/
  │     │                └─► Django logs event
  │     │                    └─► CheatingEvent created in DB
  │     │
  │     └─► Violation appears in monitor
  │         ├─► Added to violations array
  │         ├─► ProctoringMonitor re-renders
  │         └─► ProctoringWarning shows alert
  │
  ├─► User clicks Submit Quiz
  │     ├─► Calculate quiz score
  │     ├─► finishQuiz() called
  │     │    └─► saveQuizResultFn() (to JobGenie backend)
  │     │        Server saves to Prisma
  │     │
  │     └─► submitExam() API call
  │         POST /api/submit-exam/
  │         Body: { 
  │           exam_id, 
  │           correct_answers, 
  │           violations: [...]
  │         }
  │         └─► Django processes:
  │             ├─► Updates Exam record
  │             ├─► Calculates percentage_score
  │             ├─► Creates CheatingEvent records
  │             └─► Returns results
  │                 Response: { score, total_questions, correct_answers }
  │
  ├─► Results page displays
  │     ├─► Shows quiz score from JobGenie
  │     ├─► Shows violations from proctoring service
  │     │    ├─► High severity violations in red
  │     │    ├─► Medium severity in yellow
  │     │    └─► Low severity in gray
  │     │
  │     └─► Optional: getExamResult() shows details
  │         GET /api/exam-result/{exam_id}/
  │         └─► Shows full violation list with timestamps
  │
  └─► END

Parallel/Background Processes:
  ├─► Monitoring continues during quiz
  │    └─► recordViolation() can be called anytime
  │
  ├─► Session timer increments
  │    └─► formatTime() updates monitoring panel
  │
  └─► UI updates in real-time
       └─► No page reloads needed
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────┐
│       MockInterviewPage             │
│   (app/.../interview/mock/page.jsx) │
└────────────────┬────────────────────┘
                 │
                 ├─► Import ProctoredQuiz
                 │
                 └─► Render:
                     │
                     ▼
┌─────────────────────────────────────┐
│      ProctoredQuiz Component        │
│  (Interactive decision page)         │
└────────────────┬────────────────────┘
                 │
        ╔════════╩════════╗
        │                 │
      NO                 YES
    Proctoring        Proctoring
    Available?        Enabled?
        │                 │
        │                 ├─► healthCheck()
        │                 │   calls: /api/health/
        │                 │
        │                 ▼
        │    ┌─────────────────────────────┐
        │    │   WebcamCapture            │
        │    │ (Face Verification)         │
        │    └────┬────────────────────────┘
        │         │
        │         ├─► getWebcamStream()
        │         │   (navigator.mediaDevices)
        │         │
        │         └─► onCapture(imageData)
        │             (base64 image)
        │
        │                 │
        │                 ▼
        │    ┌─────────────────────────────┐
        │    │  ExamProctoring             │
        │    │  (Main exam wrapper)        │
        │    └────┬────────────────────────┘
        │         │
        │         ├─► startExam()
        │         │   calls: /api/start-exam/
        │         │   ├─► exam_id returned
        │         │   └─► onExamStarted(exam_id)
        │         │
        │         ├─► startProctoringMonitoring()
        │         │   (Client-side browser monitoring)
        │         │
        │         └─► Layout:
        │             │
        │             ├─► Quiz Component
        │             │   (Child content)
        │             │
        │             └─► ProctoringMonitor
        │                 (Sidebar - Right)
        │                 ├─► Status indicator
        │                 ├─► Violation stats
        │                 └─► Recent activity
        │
        │                 Plus:
        │                 ProctoringWarning
        │                 (Popup - On violation)
        │                 ├─► Alert message
        │                 └─► Acknowledge button
        │
        └──► Quiz Component (No Proctoring)
            │
            └─► Quiz rendered without monitoring
```

---

## Request/Response Cycle

### **Example 1: Start Exam**

```
Browser (Next.js)                          Django Server (8000)
       │                                           │
       ├──────────────────────────────────────────►│
       │ POST /api/start-exam/                     │
       │ Content-Type: application/json             │
       │                                             │
       │ {                                          │
       │   "student_id": 123,                       │
       │   "exam_name": "Mock Quiz",                │
       │   "total_questions": 5                     │
       │ }                                          │
       │                                             │
       │                        ▼                   │
       │                  Process request           │
       │                  - Get Student             │
       │                  - Create Exam             │
       │                  - Save to DB              │
       │                        ▼                   │
       │◄──────────────────────────────────────────┤
       │ HTTP 201 Created                           │
       │ {                                          │
       │   "success": true,                         │
       │   "message": "Exam started",               │
       │   "exam_id": 456,                          │
       │   "student_id": 123                        │
       │ }                                          │
       │                                             │
       ▼ handleResponse()
       ├─► setExamId(456)
       ├─► setState('monitoring')
       └─► onExamStarted(456) callback
```

### **Example 2: Record Violation**

```
Browser (Next.js)                          Django Server (8000)
       │                                           │
       ├──────────────────────────────────────────►│
       │ POST /api/record-violation/                │
       │                                            │
       │ {                                          │
       │   "student_id": 123,                       │
       │   "event_type": "tab_switch",              │
       │   "detected_objects": [],                  │
       │   "image_data": "data:image/png;base64..." │
       │ }                                          │
       │                                            │
       │                        ▼                   │
       │                  Process violation        │
       │                  - Create CheatingEvent   │
       │                  - Save image (if any)    │
       │                  - Update event count     │
       │                        ▼                   │
       │◄──────────────────────────────────────────┤
       │ HTTP 201 Created                           │
       │ {                                          │
       │   "success": true,                         │
       │   "message": "Violation recorded",         │
       │   "event_id": 789                          │
       │ }                                          │
       │                                            │
       ▼ handleResponse()
       ├─► Add to violations array
       ├─► Update ProctoringMonitor
       ├─► Show ProctoringWarning modal
       └─► Update UI in real-time
```

---

## State Management Flow

### **ProctoredQuiz Component State**

```
const [proctoringEnabled, setProctoringEnabled] = false/true
                         ▲
                         │
         User clicks "Start with Proctoring"
                         │
                         ▼
const [proctoringSetup, setProctoringSetup] = "checking/disabled/ready"
                         ▲
                         │
         healthCheck() → /api/health/ → Available?
                         │
                         ▼
const [faceVerified, setFaceVerified] = false/true
                         ▲
                         │
         User captures face & verifies
                         │
                         ▼
const [studentData, setStudentData] = { id, name, email, photo_data }
                         ▲
                         │
         Face capture successful
                         │
                         ▼
const [examState, setExamState] = "initializing/monitoring/completed"
                         ▨
                         │ startExam() → /api/start-exam/
                         ▼
const [examId, setExamId] = null/456
                         ▨
                         │ User takes quiz & monitoring active
                         ▼
const [violations, setViolations] = [array of violation objects]
                         ▨
                         │ recordViolation() → /api/record-violation/
                         ▼
const [currentWarning, setCurrentWarning] = null/violation
                         ▨
                         │ Display alert modal
                         │ User dismisses
                         ▼
const [sessionTime, setSessionTime] = 0/increments
                         ▨
                         │ Timer increments every second
                         ▼
const [error, setError] = null/"error message"
```

---

## Database Sync Flow

```
┌───────────────────────────────────┐
│   JobGenie Database (Prisma)      │
│   (PostgreSQL - jobgenie)          │
└───────────┬───────────────────────┘
            │
            ├─ User account
            │  └─ (from Clerk auth)
            │
            ├─ ProctoringSession
            │  ├─ exam_name
            │  ├─ status
            │  ├─ startedAt
            │  └─ completedAt
            │
            ├─ ProctoringViolation
            │  ├─ violationType
            │  ├─ severity
            │  └─ timestamp
            │
            └─ ProctoringReport
               ├─ totalViolations
               ├─ highSeverity count
               ├─ mediumSeverity count
               └─ lowSeverity count

        ↕↕↕ API Calls ↕↕↕

┌───────────────────────────────────┐
│ Proctoring Database (Django ORM)  │
│ (PostgreSQL - jobgenie_proctoring)│
└───────────┬───────────────────────┘
            │
            ├─ Student
            │  ├─ user_id
            │  ├─ name
            │  ├─ email
            │  ├─ face_encoding
            │  └─ photo
            │
            ├─ Exam
            │  ├─ student_id
            │  ├─ exam_name
            │  ├─ score
            │  └─ timestamp
            │
            ├─ CheatingEvent
            │  ├─ student_id
            │  ├─ event_type
            │  └─ timestamp
            │
            ├─ CheatingImage
            │  ├─ event_id
            │  └─ image_file
            │
            └─ CheatingAudio
               ├─ event_id
               └─ audio_file
```

---

## Monitoring Timeline

```
Quiz Starts (T=0s)
│
├─► T=0s: startProctoringMonitoring() activated
│   ├─ Document visibility listener active
│   ├─ Context menu listener active
│   ├─ Keyboard shortcuts listener active
│   └─ Timer starts incrementing
│
├─► T=5s: User looks away from quiz
│   └─ Gaze tracking would detect (if implemented)
│
├─► T=12s: User attempts right-click
│   └─► handleContextMenu()
│       └─ e.preventDefault()
│           └─ recordViolation("context_menu")
│               └─ /api/record-violation/
│                   └─ DB: CheatingEvent created
│
├─► T=24s: User switches to another tab
│   └─► handleVisibilityChange()
│       └─ document.hidden = true
│           └─ tabSwitchCount++
│               └─ recordViolation("tab_switch")
│                   └─ /api/record-violation/
│                       └─ DB: CheatingEvent created
│           └─ Show warning modal
│
├─► T=45s: User returns to quiz tab
│   └─► handleVisibilityChange()
│       └─ document.hidden = false
│           └─ Monitoring continues
│
├─► T=120s: User presses F12 (Dev Tools)
│   └─► handleKeyDown()
│       └─ if (e.key === 'F12')
│           └─ e.preventDefault()
│               └─ recordViolation("keyboard_shortcut")
│                   └─ /api/record-violation/
│
└─► T=180s: User clicks Submit
    ├─ stopProctoringMonitoring() cleanup
    ├─ Collect all violations
    ├─ submitExam()
    │   └─ /api/submit-exam/
    │       ├─ Save final score
    │       ├─ Update Exam status to 'completed'
    │       └─ Return results
    │
    └─ Display results page with violations report

Timeline: 0:00 ────────── 1:00 ────────── 2:00 ────── 3:00 (End)
Events:   [Start]     [Tab Out]     [F12]      [Submit]
          monitoring  violation     violation  results saved
```

---

## Error Handling Flow

```
API Call
    │
    ├─► try {
    │    fetch(endpoint)
    │      │
    │      └─ Success
    │         │
    │         ├─ .json()
    │         │
    │         ├─✓ { success: true, data: {...} }
    │         │   └─ Update UI
    │         │       └─ Show success message
    │         │
    │         └─✗ { success: false, error: "..." }
    │            └─ Dispatch error
    │                └─ toast.error(error)
    │                   └─ Update 'error' state
    │
    └─► catch (error) {
        Error occurred
        │
        ├─► Network error
        │   └─ "API request failed"
        │
        ├─► JSON parse error
        │   └─ "Invalid JSON response"
        │
        └─► Log to console
            console.error(`Proctoring API Error [${endpoint}]:`, error)
```

---

## Summary

This architecture provides:

✅ **Separation of Concerns** - Frontend and backend independent  
✅ **Real-time Monitoring** - Client-side for instant feedback  
✅ **Persistent Storage** - Server-side for evidence  
✅ **Scalability** - Each service can scale independently  
✅ **Maintainability** - Clear data flow and responsibilities  
✅ **Security** - API validation, CORS, secure storage  

---

**Version:** 1.0  
**Generated:** February 5, 2026
