# JobGenie - Environment Configuration Template

## ========================================
## PROCTORING SERVICE (.env)
## File: An-Inbrowser-Proctoring-System/futurproctor/.env
## ========================================

# Database Configuration
DB_ENGINE=postgresql
DB_NAME=jobgenie_proctoring
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
DJANGO_SECRET_KEY=django-insecure-your-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,*.local

# CORS Configuration (for Next.js communication)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ML Models Configuration
YOLO_MODEL_PATH=yolo11s.pt
FACE_RECOGNITION_MODEL=face_recognition_models

# Proctoring Settings
FACE_DETECTION_THRESHOLD=0.6
OBJECT_DETECTION_THRESHOLD=0.5
GAZE_THRESHOLD=30  # seconds of looking away
MAX_TAB_SWITCHES=3
AUDIO_SENSITIVITY=0.7

# File Upload Settings
MAX_UPLOAD_SIZE=52428800  # 50MB
UPLOAD_TEMP_DIR=tmp/
MEDIA_ROOT=media/
MEDIA_URL=/media/

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/proctoring.log

# Session Configuration
SESSION_TIMEOUT=3600  # 1 hour in seconds
SESSION_SAVE_EVERY_REQUEST=True

# Security
USE_HTTPS=False  # Set to True in production
SECURE_SSL_REDIRECT=False  # Set to True in production
SESSION_COOKIE_SECURE=False  # Set to True in production

## ========================================
## JOBGENIE APPLICATION (.env.local)
## File: JobGenie/.env.local
## ========================================

# Proctoring Service
NEXT_PUBLIC_PROCTORING_API_URL=http://127.0.0.1:8000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobgenie

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# AI/ML Services
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
GOOGLE_API_KEY=your-google-api-key

# File Storage (Optional - for future enhancements)
NEXT_PUBLIC_AWS_S3_BUCKET=jobgenie-bucket
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Application Settings
NEXT_PUBLIC_APP_NAME=JobGenie
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Logging
LOG_LEVEL=debug
DEBUG=true

## ========================================
## QUICK START COMMANDS
## ========================================

# 1. Start PostgreSQL (if not running as service)
#    On Windows:
#    pg_ctl -D "C:\Program Files\PostgreSQL\15\data" -l logfile start
#    
#    On macOS:
#    brew services start postgresql
#    
#    On Linux:
#    sudo systemctl start postgresql

# 2. Create databases
#    createdb jobgenie
#    createdb jobgenie_proctoring

# 3. Terminal 1 - Start Proctoring Service
#    cd An-Inbrowser-Proctoring-System/futurproctor
#    python -m venv venv
#    # Windows: venv\Scripts\activate
#    # macOS/Linux: source venv/bin/activate
#    pip install -r requirements.txt
#    python manage.py migrate
#    python manage.py runserver 0.0.0.0:8000

# 4. Terminal 2 - Start JobGenie
#    cd JobGenie
#    npm install
#    npm run dev
#    # App will be at http://localhost:3000

## ========================================
## TESTING THE INTEGRATION
## ========================================

# Test proctoring service is running:
# curl http://127.0.0.1:8000/api/health/

# Expected response:
# {
#   "success": true,
#   "message": "Proctoring API is running",
#   "service": "JobGenie Proctoring System"
# }

# Test from JobGenie (browser console):
# fetch('http://127.0.0.1:8000/api/health/')
#   .then(r => r.json())
#   .then(d => console.log(d))

## ========================================
## PRODUCTION CHECKLIST
## ========================================

# Before deploying to production:
# [ ] Change DJANGO_SECRET_KEY to a new random value
# [ ] Set DEBUG=False in proctoring service
# [ ] Update DATABASE_URL to production database
# [ ] Set USE_HTTPS=True in proctoring service
# [ ] Update ALLOWED_HOSTS with production domain
# [ ] Configure CORS_ALLOWED_ORIGINS with production URL
# [ ] Setup SSL/TLS certificates
# [ ] Move secrets to secure vault (AWS Secrets Manager, etc.)
# [ ] Setup logging to centralized service
# [ ] Test all API endpoints with HTTPS
# [ ] Configure backup strategy for databases
# [ ] Setup monitoring and alerts
# [ ] Test CORS with production domain
# [ ] Verify database connections are encrypted
# [ ] Setup rate limiting on API endpoints
# [ ] Test proctoring components in production environment

