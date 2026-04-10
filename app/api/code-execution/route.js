// Code Execution API - Routes to Django Backend
// Primary: Django backend at jobgenie-proctoring (your own server)
// Fallback: Demo Mode

const DJANGO_API = "http://localhost:8000/api/execute-code/";

export async function POST(req) {
  try {
    const { code, language, testInput = "", stdin = "", testCases = [] } = await req.json();

    if (!code || !language) {
      return Response.json(
        { success: false, error: "Missing code or language" },
        { status: 400 }
      );
    }

    console.log(`[Code Execution] Attempting to execute ${language} code (${code.length} chars)`);
    if (testCases.length > 0) {
      console.log(`[Code Execution] With ${testCases.length} test cases`);
    }

    // Try Django backend first (your own server)
    const djangoResult = await tryDjangoExecution({
      code,
      language,
      stdin: stdin || testInput,
      testCases,
    });

    if (djangoResult.success) {
      console.log("[Code Execution] ✅ Django backend execution succeeded");
      return Response.json(djangoResult);
    }

    console.warn("[Code Execution] Django backend failed, using demo mode");

    // Use demo mode as final fallback - but mark it as demo
    return getDemoResponse(language, code);

  } catch (error) {
    console.error("[Code Execution] Fatal error:", error.message);
    return Response.json({
      success: false,
      output: "[DEMO MODE] Error executing code. Please ensure your code is syntactically correct.",
      error: error.message || "Code execution service is unavailable",
      exitCode: -1,
      isDemoMode: true,
    });
  }
}

async function tryDjangoExecution({ code, language, stdin, testCases }) {
  try {
    const payload = {
      code,
      language: language.toLowerCase(),
      stdin: stdin || "",
      testCases: testCases || [],
      timeout: 10,
    };

    console.log("[Django Backend] Submitting code to localhost:8000...");
    const response = await fetch(DJANGO_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!response.ok) {
      console.warn(`[Django Backend] HTTP ${response.status}`);
      const errorText = await response.text();
      console.warn(`[Django Backend] Response: ${errorText}`);
      return { success: false };
    }

    const result = await response.json();
    console.log("[Django Backend] Execution complete");

    return {
      success: result.success || false,
      output: result.output || "",
      error: result.error || "",
      exitCode: result.exitCode || 0,
      language,
      executionTime: result.executionTime || 0,
      testResults: result.testResults || [],
    };
  } catch (error) {
    console.warn("[Django Backend] Error:", error.message);
    return { success: false };
  }
}

function getDemoResponse(language, code) {
  const DEMO_OUTPUTS = {
    python: {
      "lengthOfLongestSubstring": "3",
      "twoSum": "[0, 1]",
      "isValid": "True",
      "reverseString": "Reversed successfully",
      default: "Demo mode - Code output would appear here"
    },
    java: {
      "lengthOfLongestSubstring": "3",
      "twoSum": "[0, 1]",
      "isValid": "true",
      default: "Demo mode - Code output would appear here"
    },
    javascript: {
      "lengthOfLongestSubstring": "3",
      "twoSum": "[0, 1]",
      "isValid": "true",
      default: "Demo mode - Code output would appear here"
    },
    cpp: { default: "Demo mode - C++ execution available" },
    c: { default: "Demo mode - C execution available" },
    csharp: { default: "Demo mode - C# execution available" },
    go: { default: "Demo mode - Go execution available" },
    rust: { default: "Demo mode - Rust execution available" },
    typescript: { default: "Demo mode - TypeScript execution available" },
  };

  const outputs = DEMO_OUTPUTS[language.toLowerCase()] || DEMO_OUTPUTS.javascript;
  const output = outputs.default || Object.values(outputs)[0] || "DEMO MODE - Backend unavailable";

  return Response.json({
    success: false,
    output: `📋 DEMO MODE - Expected output:\n${output}\n\n⚠️ Note: Django backend at localhost:8000 is not running.\nTo enable full code execution, start the proctoring server.`,
    error: "Django backend is not running. Code execution is in demo mode.",
    exitCode: -1,
    language,
    isDemoMode: true,
    testResults: [],
  });
}
