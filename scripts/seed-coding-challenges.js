// Seed data for coding challenges
// Run this with: npx ts-node scripts/seed-coding-challenges.ts
// Or add to your existing seed script

const codingChallenges = [
  {
    title: "Two Sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to the target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Constraints:**
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\``,
    difficulty: "easy",
    category: "Array",
    languages: ["python", "javascript", "java", "cpp"],
    codeTemplates: {
      python:
        "def twoSum(nums, target):\n    # Write your solution here\n    pass\n\n# Test\nresult = twoSum([2, 7, 11, 15], 9)\nprint(result)  # [0, 1]",
      javascript:
        "function twoSum(nums, target) {\n    // Write your solution here\n}\n\n// Test\nconst result = twoSum([2, 7, 11, 15], 9);\nconsole.log(result);  // [0, 1]",
      java:
        "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{0, 0};\n    }\n}",
      cpp:
        "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};",
    },
    testCases: [
      {
        id: "1",
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
        isVisible: true,
      },
      {
        id: "2",
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
        isVisible: true,
      },
      {
        id: "3",
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
        isVisible: false,
      },
    ],
    constraints: `- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**`,
    examples: [
      {
        input: "[2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation:
          "nums[0] + nums[1] == 9, so we return [0, 1]. You could also return [1, 0].",
      },
      {
        input: "[3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] == 6, so we return [1, 2].",
      },
    ],
    hints: [
      "A brute force approach would be to check all pairs, but that's O(n²). Can you do better?",
      "A hash map can help you store values you've seen and check if (target - current) exists.",
      "Try iterating through the array once and building a hash map at the same time.",
    ],
    tags: ["Array", "Hash Table", "Two Pointers"],
    acceptance: 48.5,
    submissionCount: 12500,
  },
  {
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: "easy",
    category: "String",
    languages: ["python", "javascript", "java", "cpp"],
    codeTemplates: {
      python:
        'def reverseString(s):\n    """\n    s: List[str] - list of characters\n    Modifies s in-place\n    """\n    # Write your solution here\n    pass',
      javascript:
        "function reverseString(s) {\n    // Write your solution here\n    // Note: You must modify s in-place\n}\n\nconst s = ['h','e','l','l','o'];\nreverseString(s);\nconsole.log(s);  // ['o','l','l','e','h']",
      java:
        "class Solution {\n    public void reverseString(char[] s) {\n        // Write your solution here\n    }\n}",
      cpp:
        "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Write your solution here\n    }\n};",
    },
    testCases: [
      {
        id: "1",
        input: "['h','e','l','l','o']",
        expectedOutput: "['o','l','l','e','h']",
        isVisible: true,
      },
      {
        id: "2",
        input: "['H','a','n','n','a','h']",
        expectedOutput: "['h','a','n','n','a','H']",
        isVisible: true,
      },
    ],
    constraints: `- \`1 <= s.length <= 10^5\`
- \`s[i]\` is a printable ascii character.
- Must solve with O(1) extra memory`,
    examples: [
      {
        input: "s = ['h','e','l','l','o']",
        output: "['o','l','l','e','h']",
        explanation: "The string is reversed in-place",
      },
    ],
    hints: [
      "Try using two pointers: one at the start and one at the end.",
      "Swap the characters and move the pointers towards each other.",
    ],
    tags: ["String", "Two Pointers"],
    acceptance: 75.2,
    submissionCount: 8900,
  },
  {
    title: "Palindrome Number",
    description: `Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

A palindrome is a number that reads the same forwards and backwards.

**Examples:**
- 121 is a palindrome
- 123 is not a palindrome
- -121 is not a palindrome (negative numbers are not palindromes)`,
    difficulty: "easy",
    category: "Math",
    languages: ["python", "javascript", "java", "cpp"],
    codeTemplates: {
      python:
        "def isPalindrome(x):\n    # Write your solution here\n    return True\n\n# Test\nprint(isPalindrome(121))    # True\nprint(isPalindrome(123))    # False",
      javascript:
        "function isPalindrome(x) {\n    // Write your solution here\n    return true;\n}\n\n// Test\nconsole.log(isPalindrome(121));  // true\nconsole.log(isPalindrome(123));  // false",
      java:
        "class Solution {\n    public boolean isPalindrome(int x) {\n        // Write your solution here\n        return true;\n    }\n}",
      cpp:
        "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Write your solution here\n        return true;\n    }\n};",
    },
    testCases: [
      {
        id: "1",
        input: "121",
        expectedOutput: "True",
        isVisible: true,
      },
      {
        id: "2",
        input: "-121",
        expectedOutput: "False",
        isVisible: true,
      },
      {
        id: "3",
        input: "10",
        expectedOutput: "False",
        isVisible: true,
      },
    ],
    constraints: `- \`-2^31 <= x <= 2^31 - 1\``,
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and right to left.",
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
      },
    ],
    hints: [
      "Negative numbers cannot be palindromes.",
      "Numbers ending in 0 cannot be palindromes (except 0 itself).",
      "Try reversing the number and comparing it with the original.",
    ],
    tags: ["Math"],
    acceptance: 52.1,
    submissionCount: 5600,
  },
  {
    title: "Valid Parentheses",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: "easy",
    category: "Stack",
    languages: ["python", "javascript", "java", "cpp"],
    codeTemplates: {
      python:
        'def isValid(s):\n    """\n    s: str - string with parentheses\n    return: bool - whether string is valid\n    """\n    # Write your solution here\n    return True',
      javascript:
        "function isValid(s) {\n    // Write your solution here\n    return true;\n}\n\nconsole.log(isValid('()'));       // true\nconsole.log(isValid('()[]{}')); // true",
      java:
        "class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return true;\n    }\n}",
      cpp:
        "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return true;\n    }\n};",
    },
    testCases: [
      {
        id: "1",
        input: "'()'",
        expectedOutput: "True",
        isVisible: true,
      },
      {
        id: "2",
        input: "'()[]{}'",
        expectedOutput: "True",
        isVisible: true,
      },
      {
        id: "3",
        input: "'(]'",
        expectedOutput: "False",
        isVisible: true,
      },
    ],
    constraints: `- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'\``,
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "Valid parentheses",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "All brackets are properly matched and closed",
      },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "Closing bracket does not match the opening bracket",
      },
    ],
    hints: [
      "Use a stack to keep track of opening brackets.",
      "When you encounter a closing bracket, check if it matches the most recent opening bracket.",
    ],
    tags: ["String", "Stack"],
    acceptance: 40.3,
    submissionCount: 9200,
  },
  {
    title: "Merge Sorted Array",
    description: `You are given two integer arrays \`nums1\` and \`nums2\`, sorted in non-decreasing order, and two integers \`m\` and \`n\`, representing the number of valid elements in \`nums1\` and \`nums2\` respectively.

Merge \`nums2\` into \`nums1\` as one sorted array.

**Note:** The number of elements initialized in \`nums1\` is \`m + n\`, where the first \`m\` elements denote the data to be merged, and the last \`n\` elements are set to 0 and should be ignored. \`nums2\` has a length of \`n\`.`,
    difficulty: "easy",
    category: "Array",
    languages: ["python", "javascript", "java", "cpp"],
    codeTemplates: {
      python:
        "def merge(nums1, m, nums2, n):\n    # Write your solution here\n    # Modify nums1 in-place\n    pass",
      javascript:
        "function merge(nums1, m, nums2, n) {\n    // Write your solution here\n    // Modify nums1 in-place\n}",
      java:
        "class Solution {\n    public void merge(int[] nums1, int m, int[] nums2, int n) {\n        // Write your solution here\n    }\n}",
      cpp:
        "class Solution {\npublic:\n    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n        // Write your solution here\n    }\n};",
    },
    testCases: [
      {
        id: "1",
        input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
        expectedOutput: "[1,2,2,3,5,6]",
        isVisible: true,
      },
      {
        id: "2",
        input: "nums1 = [1], m = 1, nums2 = [], n = 0",
        expectedOutput: "[1]",
        isVisible: true,
      },
    ],
    constraints: `- \`nums1.length == m + n\`
- \`nums2.length == n\`
- \`0 <= m, n <= 200\`
- \`1 <= m + n <= 200\`
- \`-10^9 <= nums1[i], nums2[j] <= 10^9\``,
    examples: [
      {
        input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
        output: "[1,2,2,3,5,6]",
        explanation: "The arrays we are merging are [1,2,3] and [2,5,6]",
      },
    ],
    hints: [
      "Try working backwards from the end of nums1.",
      "Since nums1 has extra space, you can fill it from the back.",
      "This avoids overwriting elements before they are copied.",
    ],
    tags: ["Array", "Two Pointers"],
    acceptance: 59.8,
    submissionCount: 7100,
  },
];

import { db } from "../lib/prisma.js";

export async function seedCodingChallenges() {
  for (const challenge of codingChallenges) {
    try {
      await db.codingChallenge.create({
        data: {
          title: challenge.title,
          description: challenge.description,
          difficulty: challenge.difficulty,
          category: challenge.category,
          languages: challenge.languages,
          codeTemplates: challenge.codeTemplates,
          testCases: challenge.testCases,
          constraints: challenge.constraints,
          examples: challenge.examples,
          hints: challenge.hints || [],
          tags: challenge.tags || [],
          acceptance: challenge.acceptance,
          submissionCount: challenge.submissionCount,
        },
      });
    } catch (error) {
      console.error(`Failed to create challenge "${challenge.title}":`, error);
    }
  }

  console.log("✅ Seeded coding challenges successfully!");
}

// If running this file directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedCodingChallenges().then(() => process.exit(0));
}

export { codingChallenges };

