"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Copy } from "lucide-react";
import { BarLoader } from "react-spinners";

function extractHintsFromTemplate(template) {
  if (typeof template !== "string" || !template.trim()) {
    return { code: template || "", hints: [] };
  }

  const lines = template.split("\n");
  const hints = [];
  const kept = [];

  const isInstructionalComment = (trimmedLine) => {
    if (/^#\s*(include|define|ifn?def|endif|pragma|import)\b/i.test(trimmedLine)) {
      return false;
    }
    if (!/^(#|\/\/|\*|\/\*)\s*/.test(trimmedLine)) return false;
    return /\b(TODO|HINT|implement|return|calculate|check|iterate|loop|use|write|solve|create|find|determine|if\s|otherwise)\b/i.test(
      trimmedLine
    );
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const isTodo = isInstructionalComment(trimmed);

    if (isTodo) {
      hints.push(trimmed.replace(/^(\#|\/\/)\s*/, "").trim());
      continue;
    }

    kept.push(line);
  }

  while (kept.length > 0 && kept[0].trim() === "") kept.shift();
  while (kept.length > 0 && kept[kept.length - 1].trim() === "") kept.pop();

  return { code: kept.join("\n") + "\n", hints };
}

export default function CodeEditor({
  challenge,
  onSubmit,
  initialCode = "",
  onRunTests,
  isRunning = false,
  testResults = null,
}) {
  // Ensure codeTemplates is parsed if it's a string
  const getCodeTemplates = () => {
    if (!challenge?.codeTemplates) return {};
    
    let templates = challenge.codeTemplates;
    
    // If it's a string, try to parse it as JSON
    if (typeof templates === "string") {
      try {
        templates = JSON.parse(templates);
      } catch (e) {
        console.warn("Failed to parse codeTemplates as JSON:", e);
        return {};
      }
    }
    
    return templates || {};
  };

  const templates = getCodeTemplates();
  
  console.log("CodeEditor props - challenge:", challenge);
  console.log("CodeEditor props - initialCode:", initialCode);
  console.log("CodeEditor props - codeTemplates (parsed):", templates);

  const [showHints, setShowHints] = useState(false);

  const getTemplateForLanguage = (lang) => {
    const fromDb = templates?.[lang];
    if (fromDb) return fromDb;

    const fallbackTemplates = {
      python: "# Write your code here\n",
      javascript: "// Write your solution here\n",
      java: "public class Solution {\n    // Write your solution here\n}\n",
      cpp: "#include <bits/stdc++.h>\nusing namespace std;\n// Write your solution here\n",
      c: "#include <stdio.h>\n// Write your solution here\n",
      csharp: "using System;\nclass Solution {\n    // Write your solution here\n}\n",
      go: "package main\nfunc main() {\n    // Write your solution here\n}\n",
      rust: "fn main() {\n    // Write your solution here\n}\n",
      typescript: "// Write your solution here\n",
    };

    return fallbackTemplates[lang] || `// ${lang} template not available\n`;
  };
  const templateMeta = extractHintsFromTemplate(getTemplateForLanguage(language));
  
  const [code, setCode] = useState(
    initialCode || extractHintsFromTemplate(getTemplateForLanguage("python")).code
  );
  const [language, setLanguage] = useState("python");

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setShowHints(false);
    // Update code template when language changes
    setCode(extractHintsFromTemplate(getTemplateForLanguage(newLanguage)).code);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `solution.${getFileExtension(language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Code downloaded!");
  };

  return (
    <div className="space-y-4">

      {/* Editor Header */}
      <Card className="border-0 bg-slate-900 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Code Editor</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-44 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="c">C</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                title="Copy code"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                title="Download code"
                className="bg-slate-800 border-slate-700 hover:bg-slate-700"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Editor */}
      <Card className="border-0 overflow-hidden">
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Courier New', monospace",
            padding: { top: 16, bottom: 16 },
            bracketPairColorization: true,
            "bracketPairColorization.independentColorPoolPerBracketType": true,
            smoothScrolling: true,
            cursorBlinking: "blink",
            formatOnPaste: true,
            formatOnType: true,
            suggest: {
              maxVisibleSuggestions: 12,
            },
          }}
        />
      </Card>

      {templateMeta.hints.length > 0 && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowHints((v) => !v)}
            className="w-full"
          >
            {showHints ? "Hide hints" : "Show hints"}
          </Button>

          {showHints && (
            <div className="p-3 bg-slate-50 border rounded-lg text-sm text-slate-800 space-y-2">
              <div className="font-medium">Hints</div>
              <ul className="list-disc ml-5 space-y-1">
                {templateMeta.hints.map((h, idx) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      {challenge && (
        <Button
          onClick={() => onSubmit(code, language)}
          disabled={isRunning || !code.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="lg"
        >
          {isRunning ? "Submitting..." : "Submit Solution"}
        </Button>
      )}

      {isRunning && <BarLoader color="gray" width="100%" />}
    </div>
  );
}

function getFileExtension(language) {
  const extensions = {
    python: "py",
    javascript: "js",
    typescript: "ts",
    java: "java",
    cpp: "cpp",
    c: "c",
    csharp: "cs",
    go: "go",
    rust: "rs",
  };
  return extensions[language] || "txt";
}
