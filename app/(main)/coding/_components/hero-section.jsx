"use client";

import { Button } from "@/components/ui/button";
import { Code2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HeroSection() {
  const handleStartCoding = () => {
    const element = document.getElementById('challenges-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-bold gradient-title">
            Coding Challenges
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Master programming with LeetCode-style challenges. Practice with real-time code execution, multiple languages, and instant feedback. Built for interview preparation.
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            size="lg"
            onClick={handleStartCoding}
          >
            <Code2 className="w-5 h-5 mr-2" />
            Start Coding
          </Button>
          <Link href="/coding/stats">
            <Button variant="outline" size="lg">
              View Stats
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">🚀 Real-Time Execution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Execute your code instantly with support for multiple programming languages including Python, JavaScript, Java, C++, and more.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">✨ Comprehensive Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Run against multiple test cases, see detailed feedback, and understand your mistakes instantly. Track your progress with detailed analytics.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">📚 Interview Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Solve curated problems by difficulty level and category. Get hints, editorial solutions, and learn best practices from the community.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
