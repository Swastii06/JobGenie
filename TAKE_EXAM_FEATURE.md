# 📝 Take Custom Exam Feature

## Overview

The "Take Custom Exam" feature allows students to create and take personalized exams tailored to their skill level, industry, and learning objectives. This feature supports multiple question types and includes optional AI-powered proctoring.

## Features

### 1. **Question Types Supported**

#### MCQ (Multiple Choice Questions)
- Select one correct answer from multiple options
- Instant grading and immediate feedback
- Ideal for knowledge assessment

#### Coding Questions
- Write code to solve algorithmic problems
- Supports multiple programming languages (Python, Java, C++, JavaScript)
- Built-in test case validation
- Code editor with syntax highlighting

#### Subjective Questions
- Essay-type answers
- Free-form text response
- Requires manual review by instructors/AI
- Guidelines and examples provided

#### Fill in the Blanks
- Complete the sentence or statement
- Single or multiple word answers
- Useful for vocabulary and concept testing

### 2. **Customization Options**

#### Industry Selection
- Technology - Software Development
- Technology - Web Development
- Technology - Data Science
- Finance - Banking
- Finance - Accounting
- Marketing
- Sales
- Human Resources

#### Difficulty Levels
- **Easy**: Basic concepts and fundamentals
- **Medium**: Mixed concepts and applications (default)
- **Hard**: Advanced concepts and complex scenarios

#### Question Configuration
- Choose question types based on your needs
- Set the number of questions for each type (1-20)
- Total questions shown in real-time
- Minimum 1 question required, maximum 50 questions

#### Exam Duration
- Set custom duration (15 minutes - 8 hours)
- Estimated time calculator based on question count
- Flexible time management

#### Proctoring
- Optional AI-powered monitoring
- Face detection
- Tab switch detection
- Keyboard shortcut blocking
- Context menu prevention
- Violation recording

## User Flow

### Step 1: Configuration
1. Navigate to "Interview → Take Custom Exam"
2. Select your industry
3. Choose difficulty level
4. Select question types and set counts
5. Set exam duration
6. Enable/disable proctoring
7. Review summary
8. Click "Start Exam"

### Step 2: Taking the Exam
1. Answer questions one by one
2. Navigate between questions using Previous/Next buttons
3. Jump to specific questions using the question navigator
4. Monitor time remaining in top-right corner
5. View number of answered vs. total questions
6. Submit exam when complete or time runs out

### Step 3: Results
1. View overall score and percentage
2. See accuracy statistics
3. Review detailed answer analysis
4. Check which questions were correct/incorrect
5. View pending review items (coding, subjective questions)
6. Option to retake exam, download report, or view solutions

## Database Schema

### New Models

#### Question
```prisma
model Question {
  id              String    @id @default(cuid())
  questionText    String    @db.Text
  questionType    String    // "MCQ", "CODING", "SUBJECTIVE", "FILL_BLANK"
  industry        String?
  difficulty      String    @default("medium")
  options         String[]  // For MCQ
  correctAnswer   String?
  codeTemplate    String?   @db.Text  // For coding
  expectedOutput  String?   @db.Text
  testCases       Json?
  tags            String[]
  explanation     String?   @db.Text
  timeEstimate    Int?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### ProctoredExam
```prisma
model ProctoredExam {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation("UserProctoredExams")
  examTitle       String
  industry        String
  mcqCount        Int       @default(0)
  codingCount     Int       @default(0)
  subjectiveCount Int       @default(0)
  fillBlankCount  Int       @default(0)
  totalDuration   Int
  passingScore    Float     @default(60.0)
  proctor         String    @default("enabled")
  status          String    @default("draft")
  attempts        ExamAttempt[]
}
```

#### ExamAttempt
```prisma
model ExamAttempt {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation("UserExamAttempts")
  proctoredExam   ProctoredExam
  examId          String
  startTime       DateTime
  endTime         DateTime?
  timeSpent       Int?
  status          String    @default("in_progress")
  totalScore      Float?
  percentageScore Float?
  isPassing       Boolean   @default(false)
  answers         Json[]
  violations      Json[]
  flaggedForReview Boolean  @default(false)
  reviewNotes     String?
}
```

## API Endpoints

### Get Questions
```
GET /api/exams/questions?industry=tech-software&type=MCQ&difficulty=medium&count=5
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": "q1",
      "questionText": "...",
      "questionType": "MCQ",
      "options": [...],
      "correctAnswer": "..."
    }
  ],
  "isMock": false
}
```

### Submit Exam
```
POST /api/exams/submit
```

**Payload:**
```json
{
  "examTitle": "Custom Exam 1",
  "industry": "tech-software",
  "answers": {
    "q1": "O(log n)",
    "q2": "def is_prime(n):..."
  },
  "totalScore": 15,
  "percentageScore": 75,
  "timeSpent": 1800
}
```

### Get Exam History
```
GET /api/exams/history
```

**Response:**
```json
{
  "success": true,
  "attempts": [...],
  "totalAttempts": 5,
  "averageScore": 72.5
}
```

## Scoring System

### MCQ & Fill in the Blanks
- Each correct answer: 2 points (MCQ), 1 point (Fill Blank)
- Incorrect answer: 0 points
- No partial credit

### Coding Questions
- Automated test case evaluation
- Points based on passing test cases
- Partial credit for partial solutions

### Subjective Questions
- Manual review by instructors or AI
- Flexible grading guidelines
- Points assigned based on rubric

### Final Score
```
Final Score = (Total Points Scored / Total Available Points) * 100
Passing Score = 60% (configurable)
```

## Components

### ExamConfiguration.jsx
- Industry selection dropdown
- Difficulty level radio buttons
- Question type selection with count inputs
- Duration setting
- Proctoring toggle
- Summary sidebar

### ExamTaker.jsx
- Question display (dynamic based on type)
- Answer input fields (varies by type)
- Timer with warning at 5 minutes
- Progress bar
- Question navigator
- Previous/Next navigation

### ExamResults.jsx
- Score card (pass/fail indicator)
- Score breakdown (total, percentage, accuracy)
- Time analysis
- Detailed answer review
- Action buttons (retake, download, view solutions)

## Files Created

```
app/
├── (main)/
│   └── interview/
│       ├── take-exam/
│       │   ├── page.jsx                 # Main take exam page
│       │   └── _components/
│       │       ├── exam-configuration.jsx
│       │       ├── exam-taker.jsx
│       │       └── exam-results.jsx
│       └── page.jsx                     # Updated with tabs
api/
└── exams/
    ├── questions/
    │   └── route.js                     # Get questions endpoint
    ├── submit/
    │   └── route.js                     # Submit exam endpoint
    └── history/
        └── route.js                     # Get exam history endpoint

prisma/
└── schema.prisma                        # Updated with new models
```

## Future Enhancements

1. **Question Bank Management**
   - Admin panel to create/edit questions
   - Bulk import questions
   - AI-powered question generation

2. **Advanced Analytics**
   - Performance tracking over time
   - Strengths and weaknesses analysis
   - Recommended study areas

3. **Adaptive Exams**
   - Dynamic difficulty based on performance
   - Personalized question selection
   - ML-based question sequencing

4. **Collaboration Features**
   - Create exams for groups
   - Share exam links with peers
   - Compare results with classmates

5. **Integration**
   - Integration with learning management systems
   - Certificate generation
   - Resume building based on performance

## Usage Example

### Starting an Exam

```javascript
// User selects:
const examConfig = {
  industry: "tech-software",
  difficulty: "medium",
  questionCounts: {
    mcq: 5,
    coding: 2,
    subjective: 1,
    fillBlank: 2
  },
  duration: 60, // minutes
  enableProctoring: true
};

// Component calls:
onStartExam(examConfig);
```

### Submitting Results

```javascript
const results = {
  questions: [...],
  answers: {...},
  totalScore: 16,
  percentageScore: 80,
  correctAnswers: 8,
  totalQuestions: 10,
  timeSpent: 3240 // seconds
};

// Component calls:
onSubmit(results);
```

## Notes

- Questions are initially populated with mock data. Integrate with your question bank database for real questions.
- Proctoring integration requires the existing proctoring service setup.
- All timestamps are stored in UTC and converted to local time in frontend.
- Exam attempts are permanently recorded in the database for future reference.
- No data is lost if a user accidentally closes the browser (implement session recovery if needed).

## Support

For issues or questions regarding the Take Custom Exam feature, refer to:
- Component files for UI/UX adjustments
- API routes for backend logic
- QUICK_START.md for overall setup
- DATABASE_SCHEMA.md for more details on models
