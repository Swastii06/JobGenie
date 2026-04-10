// Test Piston API connectivity
export async function GET() {
  try {
    const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

    console.log("[Piston Test] Testing connectivity to:", PISTON_API_URL);

    const testPayload = {
      language: "python",
      version: "3.10.0",
      files: [
        {
          name: "test.py",
          content: "print('Hello from Piston')",
        },
      ],
      stdin: "",
    };

    const response = await fetch(PISTON_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    });

    console.log("[Piston Test] Response status:", response.status);

    if (!response.ok) {
      return Response.json({
        success: false,
        message: `Piston API returned ${response.status}`,
        status: response.status,
      });
    }

    const result = await response.json();
    console.log("[Piston Test] Success! Output:", result.run?.stdout);

    return Response.json({
      success: true,
      message: "Piston API is working",
      output: result.run?.stdout,
    });
  } catch (error) {
    console.error("[Piston Test] Error:", error.message);
    return Response.json({
      success: false,
      message: error.message,
      error: error.name,
    });
  }
}
