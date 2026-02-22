# JobGenie - Proctoring System Integration Setup Guide

## 🎯 Overview

JobGenie now includes an **AI-powered online proctoring system** that monitors exam integrity during mock quiz assessments. This guide walks you through setting up and running both services.

## 📋 Prerequisites

### Required Software
- **Node.js** (v16+) for JobGenie
- **Python** (v3.8+) for the proctoring service
- **PostgreSQL** (v12+) for both databases
- **Git** for version control

### System Requirements
- Webcam for face capture and monitoring
- Microphone (optional, for audio detection)
- 4GB+ RAM for running both services

## 🚀 Installation & Setup

### Step 1: Project Structure
```
Desktop/
├── JobGenie/                    (Main project - Next.js)
│   ├── app/
│   ├── components/
│   │   └── proctoring/         (NEW: Proctoring components)
│   ├── lib/
│   │   └── proctoring-service.js  (NEW: API service)
│   ├── prisma/
│   │   └── schema.prisma       (UPDATED: With proctoring models)
│   └── ...
│
└── An-Inbrowser-Proctoring-System/  (Proctoring service - Django)
    └── futurproctor/
        ├── proctoring/
        │   ├── api.py          (NEW: REST API endpoints)
        │   └── urls.py         (UPDATED: New API routes)
        └── ...
```

### Step 2: Setup Django Proctoring Service

#### 2.1 Navigate to proctoring project
```bash
cd An-Inbrowser-Proctoring-System/futurproctor
```

#### 2.2 Create virtual environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

#### 2.3 Install dependencies
```bash
pip install -r requirements.txt
```

#### 2.4 Configure PostgreSQL Database
Create a `.env.local` file in the `futurproctor` directory:

```env
# Database Configuration
DB_ENGINE=postgresql
DB_NAME=jobgenie_proctoring
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# Django Secret Key
DJANGO_SECRET_KEY=your-secret-key-here

# Environment
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,*.jobgenie.local
```

#### 2.5 Update Django settings.py
Update `futurproctor/futurproctor/settings.py`:

```python
# Add environment variables
import os
from dotenv import load_dotenv

load_dotenv()

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'jobgenie_proctoring'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Ensure CORS is configured for Next.js
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com",
]
```

#### 2.6 Run database migrations
```bash
python manage.py migrate
```

#### 2.7 Create superuser (optional, for admin panel)
```bash
python manage.py createsuperuser
```

#### 2.8 Start the proctoring service
```bash
python manage.py runserver 0.0.0.0:8000
```

**The Django service should now be running at:** `http://127.0.0.1:8000`

### Step 3: Setup Next.js JobGenie Application

#### 3.1 Install dependencies
```bash
cd JobGenie
npm install
```

#### 3.2 Create `.env.local` file
```env
# Proctoring Service
NEXT_PUBLIC_PROCTORING_API_URL=http://127.0.0.1:8000

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/jobgenie

# Other existing keys...
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

#### 3.3 Run database migrations (if needed)
```bash
npx prisma migrate dev --name add_proctoring
```

#### 3.4 Generate Prisma Client
```bash
npx prisma generate
```

#### 3.5 Start JobGenie development server
```bash
npm run dev
```

**JobGenie should now be running at:** `http://localhost:3000`

## 🔌 API Endpoints Reference

### Health Check
```
GET http://127.0.0.1:8000/api/health/
```

### Student Registration
```
POST http://127.0.0.1:8000/api/register-student/
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure_password",
  "address": "123 Main St",
  "photo_data": "data:image/png;base64,..."
}
```

### Face Verification
```
POST http://127.0.0.1:8000/api/verify-face/
Body: {
  "email": "john@example.com",
  "password": "secure_password",
  "photo_data": "data:image/png;base64,..."
}
```

### Start Exam
```
POST http://127.0.0.1:8000/api/start-exam/
Body: {
  "student_id": 1,
  "exam_name": "Mock Quiz",
  "total_questions": 5
}
```

### Submit Exam
```
POST http://127.0.0.1:8000/api/submit-exam/
Body: {
  "exam_id": 1,
  "correct_answers": 4,
  "violations": [...]
}
```

### Record Violation
```
POST http://127.0.0.1:8000/api/record-violation/
Body: {
  "student_id": 1,
  "event_type": "tab_switch",
  "detected_objects": [],
  "image_data": "data:image/png;base64,..."
}
```

### Get Exam Results
```
GET http://127.0.0.1:8000/api/exam-result/{exam_id}/
```

## 🎨 UI Components

### ProctoredQuiz
Main component for the proctored quiz experience. Features:
- Proctoring service health check
- Optional proctoring activation
- Face verification
- Real-time violation monitoring
- Standard quiz fallback

**Usage:**
```jsx
import ProctoredQuiz from '@/app/(main)/interview/mock/_components/proctored-quiz';

export default function Page() {
  return <ProctoredQuiz />;
}
```

### ExamProctoring
Wrapper component for exam sessions with monitoring.

**Props:**
- `studentId` (string): Unique student identifier
- `examName` (string): Name of the exam
- `totalQuestions` (number): Total questions in exam
- `onExamStarted` (function): Callback when exam starts
- `onExamEnded` (function): Callback when exam ends
- `children` (ReactNode): Quiz content

**Usage:**
```jsx
<ExamProctoring 
  studentId="123"
  examName="Mock Quiz"
  totalQuestions={5}
  onExamStarted={(examId) => console.log('Started:', examId)}
>
  <Quiz />
</ExamProctoring>
```

### ProctoringMonitor
Real-time violation monitoring panel.

**Props:**
- `violations` (array): Array of violation objects
- `isMonitoring` (boolean): Monitoring status
- `sessionTime` (number): Elapsed time in seconds

**Usage:**
```jsx
<ProctoringMonitor 
  violations={violations}
  isMonitoring={true}
  sessionTime={1234}
/>
```

### WebcamCapture
Face capture component for identity verification.

**Props:**
- `onCapture` (function): Callback with base64 image
- `isLoading` (boolean): Loading state

**Usage:**
```jsx
<WebcamCapture 
  onCapture={(imageData) => handleFaceVerification(imageData)}
  isLoading={false}
/>
```

## 🔒 Security Features

### Implemented Proctoring Features
1. **Face Detection & Verification**
   - Facial recognition on registration and login
   - Real-time face presence monitoring during exam

2. **Object Detection**
   - Detects unauthorized objects (phones, books, etc.)
   - Uses YOLO models for object recognition

3. **Gaze Tracking**
   - Monitors eye movements
   - Detects suspicious looking away patterns

4. **Tab Switch Monitoring**
   - Records when user leaves exam tab
   - Counts total tab switches

5. **Audio Detection**
   - Detects external conversations
   - Flags unusual background noise

6. **Browser Activity Monitoring**
   - Blocks right-click
   - Blocks developer tools (F12, Ctrl+Shift+I)
   - Blocks print (Ctrl+P) and save (Ctrl+S)

## 🐛 Troubleshooting

### Issue: "Proctoring Service Unavailable"
**Solution:** Ensure Django service is running on port 8000
```bash
python manage.py runserver 0.0.0.0:8000
```

### Issue: "No camera detected"
**Solution:** Check browser camera permissions
- Allow camera access when prompted
- Check System Settings > Privacy & Security > Camera

### Issue: Database connection error
**Solution:** Verify PostgreSQL is running and credentials are correct
```bash
# Windows
pg_isready.exe

# macOS/Linux
pg_isready
```

### Issue: CORS errors
**Solution:** Update CORS settings in Django `settings.py`
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```

### Issue: Prism migration fails
**Solution:** Reset the database and re-run migrations
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## 🚀 Running Both Services Together

### Terminal 1 - Django Proctoring Service
```bash
cd An-Inbrowser-Proctoring-System/futurproctor
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver 0.0.0.0:8000
```

### Terminal 2 - Next.js Application
```bash
cd JobGenie
npm run dev
```

Both services should now be running:
- **JobGenie:** http://localhost:3000
- **Proctoring API:** http://127.0.0.1:8000

## 📊 Database Schema

### New Prisma Models (in JobGenie)
- **ProctoringSession**: Tracks exam sessions with proctoring
- **ProctoringViolation**: Records detected violations
- **ProctoringReport**: Generates violation summaries

### Django Models (in Proctoring Service)
- **Student**: Student profile with face encoding
- **Exam**: Exam session data
- **CheatingEvent**: Recorded violation events
- **CheatingImage**: Evidence images
- **CheatingAudio**: Evidence audio

## 🔄 Data Flow

```
1. User starts proctored quiz
   ↓
2. Webcam capture for face verification
   ↓
3. Call /api/start-exam/ → Create Django Exam record
   ↓
4. Start monitoring (face, objects, tabs, audio, gaze)
   ↓
5. On violation detected → Call /api/record-violation/
   ↓
6. On exam submit → Call /api/submit-exam/
   ↓
7. Retrieve results → Call /api/exam-result/{exam_id}/
   ↓
8. Save to Prisma ProctoringSession & ProctoringViolation
```

## 📝 Development Notes

### Adding New Violations
To add a new violation type:

1. Update `startProctoringMonitoring()` in `lib/proctoring-service.js`
2. Add handler in `ExamProctoring` component
3. Create corresponding UI in `ProctoringMonitor`
4. Add violation type to Django API

### Customizing Monitoring
Edit `lib/proctoring-service.js` to customize:
- Monitoring intensity
- Violation thresholds
- Recording behavior

### API Error Handling
All API endpoints return JSON with structure:
```json
{
  "success": true/false,
  "message": "...",
  "data": {...},
  "error": "..."
}
```

## 🎓 Use Cases

1. **Technical Interviews**: Monitor candidate during assessment
2. **Certification Exams**: Ensure exam integrity
3. **Employee Training**: Track compliance during training assessments
4. **Recruitment Platforms**: Fair testing environment

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check Django and Next.js logs for errors
4. Verify both services are running (`localhost:3000` and `127.0.0.1:8000`)

## 🔐 Production Considerations

Before deploying to production:

1. **Change SECRET_KEY** in Django settings
2. **Enable HTTPS** for secure data transmission
3. **Configure CORS properly** for your domain
4. **Enable rate limiting** on API endpoints
5. **Setup logging** and monitoring
6. **Use environment variables** for all secrets
7. **Implement authentication** between services
8. **Enable SSL/TLS** for database connections
9. **Setup backup** strategy for exam records
10. **Monitor proctoring service** performance

## 📄 License

This integration maintains the original licenses of both projects:
- **JobGenie**: [Your License]
- **Proctoring System**: MIT License

---

**Version**: 1.0  
**Last Updated**: February 5, 2026  
**Maintained By**: JobGenie Team
