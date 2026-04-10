# Coding Challenges Implementation Guide

## Overview
A complete LeetCode-style coding challenge system has been implemented for JobGenie. This includes:

- ✅ Real-time code editor with Monaco Editor
- ✅ Multi-language support (Python, JavaScript, Java, C++, C, C#, Go, Rust, TypeScript)
- ✅ Automatic code execution and testing
- ✅ Multiple test case validation
- ✅ Submission tracking and history
- ✅ User statistics and progress tracking
- ✅ Problems categorized by difficulty and topic

## Setup Instructions

### 1. Database Migration
First, update your Prisma schema (already done) and run migrations:

```bash
npx prisma migrate dev --name add_coding_challenges
```

### 2. Seed Sample Challenges
Add sample coding challenges to your database:

```bash
# Option A: Using the seed script
node scripts/seed-coding-challenges.js

# Option B: Add to your existing seed script and run
npx prisma db seed
```

### 3. Environment Variables
Ensure your `.env.local` has:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# If using a custom code execution service
PISTON_API_URL=https://emkc.org/api/v2/piston/execute
```

### 4. Install Dependencies
All required dependencies are already in `package.json`:
- `@monaco-editor/react` - Code editor
- `@uiw/react-md-editor` - Problem statement markdown
- Others are standard

### 5. Run Your App
```bash
npm run dev
```

## File Structure

```
app/
  (main)/
    coding/
      page.jsx                    # Main coding challenges list
      layout.jsx                  # Layout wrapper
      [id]/
        page.jsx                  # Individual challenge solver
      stats/
        page.jsx                  # User statistics
      _components/
        challenges-list.jsx       # Challenge listing with filters

components/
  code-editor.jsx                 # Main code editor component
  problem-statement.jsx           # Problem description display
  submission-history.jsx          # Submission history viewer
  coding-stats.jsx                # Statistics dashboard

actions/
  coding.js                       # Server actions for coding

app/api/
  code-execution/
    route.js                      # Code execution API endpoint

scripts/
  seed-coding-challenges.js       # Seed script with sample challenges

prisma/
  schema.prisma                   # Updated with CodingChallenge, CodeSubmission models
```

## Features

### 1. Code Editor
- **Monaco Editor Integration**: Professional coding experience
- **Syntax Highlighting**: Automatic highlighting for all supported languages
- **Real-time Execution**: Run code instantly
- **Multiple Languages**: Python, JavaScript, Java, C++, C, C#, Go, Rust, TypeScript
- **Code Templates**: Pre-filled templates for each language

### 2. Test Cases
- **Multiple Test Cases**: Run against preset test cases
- **Visual Feedback**: See which tests pass/fail
- **Detailed Output**: Expected vs actual output comparison
- **Error Messages**: Clear error messages for failures

### 3. Submissions
- **Submission History**: Track all submissions for a challenge
- **Detailed Results**: See test results, execution time, memory usage
- **Code Storage**: Store and view past submissions
- **Verdict Types**: Accepted, Partially Correct, Wrong Answer, Runtime Error, Compilation Error

### 4. Statistics
- **User Stats Page**: View overall coding statistics
- **Language Distribution**: See which languages you use most
- **Progress Tracking**: Monitor your improvement over time
- **Challenge Difficulty**: Filter and practice by difficulty

## API Endpoints

### `POST /api/code-execution`
Execute code and get results.

**Request:**
```json
{
  "code": "print('Hello World')",
  "language": "python",
  "stdin": "optional input"
}
```

**Response:**
```json
{
  "success": true,
  "output": "Hello World",
  "error": null,
  "verdict": "success",
  "exitCode": 0,
  "language": "python"
}
```

## Server Actions

### `getCodingChallenges(filters)`
Fetch all coding challenges with optional filters.

### `getCodingChallenge(challengeId)`
Get a specific challenge with user's submission history.

### `runTestCases(challengeId, code, language)`
Execute code against all test cases and return results.

### `submitCodeSolution(challengeId, code, language, testResults)`
Submit a solution and save it to the database.

### `getSubmissionHistory(challengeId)`
Get user's submission history for a challenge.

### `getUserCodingStats()`
Get user's overall coding statistics.

## Sample Challenge Data

The seed script includes 5 sample challenges:
1. **Two Sum** (Easy) - Array manipulation
2. **Reverse String** (Easy) - String operations
3. **Palindrome Number** (Easy) - Math
4. **Valid Parentheses** (Easy) - Stack
5. **Merge Sorted Array** (Easy) - Array

Each challenge includes:
- Problem description with examples
- Constraints
- Multiple test cases
- Hints for problem-solving
- Code templates for each language
- Expected acceptance rates

## Adding More Challenges

To add more challenges, add them to the `codingChallenges` array in `scripts/seed-coding-challenges.js`:

```javascript
{
  title: "Your Challenge Title",
  description: "Detailed description with markdown support",
  difficulty: "easy|medium|hard",
  category: "Array|String|Math|etc",
  languages: ["python", "javascript", "java", "cpp"],
  codeTemplates: {
    python: "def solution():\n    pass",
    javascript: "function solution() {\n    return null;\n}",
    // ... other languages
  },
  testCases: [
    {
      id: "1",
      input: "test input",
      expectedOutput: "expected output",
      isVisible: true
    }
  ],
  constraints: "Problem constraints",
  examples: [
    {
      input: "example input",
      output: "example output",
      explanation: "explanation"
    }
  ],
  hints: ["hint 1", "hint 2"],
  tags: ["tag1", "tag2"],
  acceptance: 50.5,
  submissions: 1000
}
```

## Code Execution Engine

The system uses the **Piston API** for code execution:
- **URL**: https://emkc.org/api/v2/piston/execute
- **Features**: Free, no authentication required, supports 70+ languages
- **Limitations**: Rate-limited (reasonable for learning)
- **Alternative**: Could be replaced with Judge0 API with commercial tier

### Supported Languages in Piston
- Python 3.10.0
- JavaScript 18.13.0
- Java 15.0.2
- C++ 10.2.0
- C 10.2.0
- C# 6.12.0
- Go 1.16.2
- Rust 1.54.0
- TypeScript 4.5.4

## Troubleshooting

### Code Execution Fails
1. Check if Piston API is accessible: `curl https://emkc.org/api/v2/piston/execute`
2. Ensure code syntax is correct for the selected language
3. Check browser console for error messages

### Database Errors
1. Run migrations: `npx prisma migrate dev`
2. Reseed challenges: `node scripts/seed-coding-challenges.js`
3. Check database connection in `.env.local`

### Monaco Editor Not Loading
1. Ensure `@monaco-editor/react` is installed: `npm list @monaco-editor/react`
2. Check for console errors in browser
3. Verify the component is wrapped in a client component (`"use client"`)

## Integration with Interview Module

The coding section integrates with the existing interview module:
1. Navigate to `/coding` to access coding challenges
2. View stats at `/coding/stats`
3. Solve individual challenges at `/coding/[id]`

To add a link in the interview page, add:
```jsx
<Link href="/coding">
  <Button>Start Coding Challenges</Button>
</Link>
```

## Performance Considerations

- **Code Execution Timeout**: 5 seconds max runtime
- **Memory Limit**: Unlimited (depends on Piston)
- **Test Case Limit**: ~50 test cases recommended
- **Submission Storage**: All submissions stored in database

## Future Enhancements

Potential improvements:
1. Custom judge/sandbox for self-hosted execution
2. AI-powered hints and explanations
3. Discussion forum for solutions
4. Leaderboard and competitive features
5. Problem difficulty estimation
6. Solution explanations with video tutorials
7. Code optimization suggestions
8. Live collaboration features
9. Problem recommendations based on user performance
10. Syntax and style checker
