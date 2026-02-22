# 🚀 Quick Start Guide - JobGenie with Proctoring

## 5-Minute Setup

### Prerequisites Check
```bash
# Check Node.js
node --version  # Should be v16+

# Check Python
python --version  # Should be 3.8+

# Check PostgreSQL
psql --version  # Should be 12+
```

### Step 1️⃣: Prepare Databases (2 min)

```bash
# Create databases
createdb jobgenie
createdb jobgenie_proctoring

# Verify creation
psql -l | grep jobgenie
```

### Step 2️⃣: Setup Proctoring Service (2 min)

**Terminal 1:**
```bash
cd An-Inbrowser-Proctoring-System/futurproctor

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from ENV_CONFIGURATION.md)
# Update database credentials if needed

# Run migrations
python manage.py migrate

# Start service
python manage.py runserver 0.0.0.0:8000
```

**✅ Proctoring service running at:** `http://127.0.0.1:8000`

### Step 3️⃣: Setup JobGenie Application (1 min)

**Terminal 2:**
```bash
cd JobGenie

# Install dependencies (if not already done)
npm install

# Create .env.local (copy from ENV_CONFIGURATION.md)
# Update API keys as needed

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

**✅ JobGenie running at:** `http://localhost:3000`

## ✨ What's New?

### 🎯 Interview Page Enhanced
Navigate to: **Interview → Mock Quiz**

**New Features Added:**
- ✅ Optional proctoring activation
- ✅ Face verification before exam
- ✅ Real-time violation monitoring
- ✅ Proctoring status panel
- ✅ Toggle between proctored/regular quiz

### 🔍 Proctoring Monitors
1. **Face Detection** - Ensures student is present
2. **Tab Switch Detection** - Flags exam tab switching
3. **Object Detection** - Detects unauthorized materials
4. **Keyboard Shortcuts** - Blocks developer tools
5. **Context Menu** - Prevents right-click

## 🧪 Testing the Integration

### Test 1: Health Check
```bash
curl http://127.0.0.1:8000/api/health/
```

Expected response:
```json
{
  "success": true,
  "message": "Proctoring API is running",
  "service": "JobGenie Proctoring System"
}
```

### Test 2: Visit Interview Page
1. Go to `http://localhost:3000/interview`
2. Click "Start with Proctoring" button
3. You should see webcam capture prompt
4. Capture your face
5. Quiz starts with monitoring panel visible

### Test 3: Trigger Violations
1. During proctored quiz, press `Tab` key
2. You should see "Tab switch" violation appear
3. Try right-click (should be blocked)
4. Try `F12` or `Ctrl+Shift+I` (should be blocked)

## 📊 Database Verification

### Check JobGenie Database
```bash
psql jobgenie

# List tables
\dt

# Check proctoring tables
SELECT * FROM "ProctoringSession";
SELECT * FROM "ProctoringViolation";
SELECT * FROM "ProctoringReport";
```

### Check Proctoring Database
```bash
psql jobgenie_proctoring

# List proctoring tables
\dt

# Sample queries
SELECT * FROM proctoring_student;
SELECT * FROM proctoring_exam;
SELECT * FROM proctoring_cheatingevent;
```

## 🔧 Configuration Files Created

| File | Purpose |
|------|---------|
| `lib/proctoring-service.js` | API communication layer |
| `components/proctoring/*` | React components |
| `app/(main)/interview/mock/_components/proctored-quiz.jsx` | Main proctored exam UI |
| `prisma/schema.prisma` | Updated with proctoring models |
| `An-Inbrowser-Proctoring-System/futurproctor/proctoring/api.py` | Django REST API |
| `PROCTORING_SETUP.md` | Comprehensive setup guide |
| `ENV_CONFIGURATION.md` | Environment configuration guide |

## 🤝 Component Integration Map

```
App (JobGenie)
├── Interview Page
│   └── Mock Interview
│       └── ProctoredQuiz  ← NEW
│           ├── WebcamCapture
│           │   └── Face verification via /api/verify-face/
│           ├── ExamProctoring
│           │   ├── Quiz (child)
│           │   ├── ProctoringMonitor
│           │   │   └── Real-time violations
│           │   └── ProctoringWarning
│           │       └── Alert on violation
│           └── API Calls
│               ├── /api/start-exam/
│               ├── /api/record-violation/
│               ├── /api/submit-exam/
│               └── /api/exam-result/
```

## 📱 User Flow

```
1. User clicks "Start with Proctoring"
   ↓
2. System checks proctoring service health
   ↓
3. If available → Face capture
   If unavailable → Standard quiz
   ↓
4. User captures face
   ↓
5. Face verified → Exam starts
   ↓
6. Monitoring begins
   ↓
7. User completes quiz
   ↓
8. Results saved with violation report
```

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Proctoring Service Unavailable" | Check if Django running: `python manage.py runserver 0.0.0.0:8000` |
| "No camera detected" | Allow camera permissions in browser settings |
| "Database connection error" | Ensure PostgreSQL running: `psql --version` |
| "CORS error in console" | Check DJANGO `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` |
| "Webcam won't load" | Check site settings → Camera → Allow access |

## 📚 Documentation Files

- **PROCTORING_SETUP.md** - Comprehensive setup guide with all details
- **ENV_CONFIGURATION.md** - Environment variables and configuration
- **This file** - Quick start reference

## 🎓 Next Steps

1. ✅ Try the proctored quiz
2. ✅ Test violation detection
3. ✅ Review violation reports
4. ✅ Customize violation types
5. ✅ Configure production deployment
6. ✅ Setup monitoring and logging

## 💡 Pro Tips

- **Keep both terminals running** for development
- **Check browser console** for API errors
- **Use browser DevTools** (Network tab) to monitor API calls
- **Restart services** if issues occur
- **Check `.env` files** first when debugging database issues

## 🚨 Emergency Restart

If something goes wrong and you need a clean start:

```bash
# Terminal 1 (Ctrl+C to stop)
# Restart Django
python manage.py runserver 0.0.0.0:8000

# Terminal 2 (Ctrl+C to stop)
# Restart Next.js
npm run dev

# If database issues:
npx prisma db push --force-reset
```

## 📞 Support Resources

- Django Docs: https://docs.djangoproject.com/
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs/
- Clerk Docs: https://clerk.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Ready to test?** 🎉 Open `http://localhost:3000/interview` and click the proctoring button!

**Version:** 1.0  
**Last Updated:** February 5, 2026
