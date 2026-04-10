# Quick Start Guide - Coding Challenges

## 🚀 Get Started in 3 Minutes

### Step 1: Update Database (1 minute)
```bash
# Run this command to create the new database tables
npx prisma migrate dev --name add_coding_challenges
```

When prompted, name the migration or just press Enter to use the suggested name.

### Step 2: Seed Sample Challenges (30 seconds)
```bash
# Add 5 sample coding challenges to your database
node scripts/seed-coding-challenges.js
```

You should see output like:
```
✅ Seeded coding challenges successfully!
```

### Step 3: Start Development Server (30 seconds)
```bash
# Start your Next.js dev server
npm run dev
```

Wait for it to compile. You should see:
```
▲ Next.js 15.5.7
- Local:        http://localhost:3000
```

## ✅ Access the Feature

Open your browser and navigate to:
```
http://localhost:3000/interview
```

You'll see three cards:
1. Mock Quizzes (existing)
2. **Coding Challenges** (NEW - Click this!)
3. Custom Exams (existing)

Click **"Start Coding"** button to access all challenges.

## 🎯 Try Your First Challenge

1. Click any challenge (e.g., "Two Sum")
2. You'll see the problem description on the left
3. Code editor is on the right
4. Write code in Python (or select another language)
5. Click "Run Code" to execute
6. Click "Run Test Cases" to test against sample inputs
7. Click "Submit Solution" to submit

## 📊 View Your Statistics

Go to: `http://localhost:3000/coding/stats` to see:
- Total problems solved
- Submission count
- Success rate
- Language distribution

## 🌐 Available Pages

- **All Challenges:** `http://localhost:3000/coding`
- **Specific Challenge:** `http://localhost:3000/coding/[challenge-id]`
- **Your Statistics:** `http://localhost:3000/coding/stats`
- **Interview Hub:** `http://localhost:3000/interview`

## 🛠️ Supported Languages

Python, JavaScript, Java, C++, C, C#, Go, Rust, TypeScript

Each language has prewritten code templates to get you started.

## 📝 Create Your Own Challenges

To add more challenges beyond the 5 sample ones:

1. Open `scripts/seed-coding-challenges.js`
2. Add a new challenge object to the `codingChallenges` array:

```javascript
{
  title: "Your Problem Title",
  description: "Problem description with **markdown** support",
  difficulty: "easy",  // or "medium", "hard"
  category: "Array",   // or "String", "Math", etc.
  languages: ["python", "javascript", "java"],
  codeTemplates: {
    python: "def solution():\n    pass",
    javascript: "function solution() { return null; }",
    java: "class Solution { public int solve() { return 0; } }"
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
      explanation: "why this output"
    }
  ],
  hints: ["hint 1", "hint 2"],
  tags: ["tag1", "tag2"],
  acceptance: 50.0,
  submissions: 100
}
```

3. Save the file
4. Run: `node scripts/seed-coding-challenges.js`
5. Refresh your browser

## 🐛 Troubleshooting

**Q: Database migration fails**
```bash
A: Try running: npx prisma migrate reset
   Then: npx prisma migrate dev
```

**Q: Code execution not working**
```bash
A: Check your internet connection (uses Piston API)
   Try running simple code first: print("hello")
```

**Q: Monaco Editor not showing**
```bash
A: Clear browser cache and reload the page
   Check browser console for errors (F12)
```

**Q: Challenges don't appear**
```bash
A: Make sure you ran: node scripts/seed-coding-challenges.js
   Check database is connected: npx prisma studio
```

## 📚 Next Steps

1. ✅ Complete the 3 setup steps above
2. ✅ Try solving "Two Sum" challenge
3. ✅ Check your stats page
4. ✅ Add more challenges if needed
5. ✅ Customize test cases for your use case
6. ✅ Deploy to production when ready

## 📖 Full Documentation

For detailed information, see:
- `CODING_CHALLENGES_SETUP.md` - Setup guide
- `IMPLEMENTATION_COMPLETE.md` - Feature overview

## 🎓 What Users Can Do

- **Code:** Write solutions in 9 programming languages
- **Execute:** Run code instantly with test input
- **Test:** Validate against multiple test cases
- **Submit:** Save solutions and track progress
- **Analyze:** View statistics and improvement areas
- **Learn:** Read problem descriptions and hints

## ⚡ Features at a Glance

✅ Professional Code Editor (Monaco)
✅ Real-time Code Execution
✅ Multi-Language Support
✅ Test Case Validation
✅ Submission Tracking
✅ User Statistics
✅ Problem Filtering
✅ Solution History
✅ Error Handling
✅ Progress Analytics

## 🚀 You're All Set!

Your LeetCode-style coding challenge feature is now ready to use. Start with the 3 setup steps above and you'll be good to go!

Any questions? Check the detailed documentation files included in the project.
