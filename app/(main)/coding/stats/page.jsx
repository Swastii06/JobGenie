"use client";

import React, { useState, useEffect } from "react";
import { getUserCodingStats } from "@/actions/coding";
import CodingStats from "@/components/coding-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Force dynamic rendering - prevent static generation with Clerk headers
export const dynamic = 'force-dynamic';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setIsLoading(true);
    try {
      const data = await getUserCodingStats();
      setStats(data);
    } catch (error) {
      toast.error("Failed to load statistics");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold gradient-title">
            Coding Statistics
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your progress and improve your coding skills
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadStats}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/coding">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenges
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full"></div>
          </div>
        </div>
      ) : stats ? (
        <>
          <CodingStats stats={stats} />

          {/* Recent Submissions */}
          {stats.recentSubmissions && stats.recentSubmissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">
                          {submission.language.charAt(0).toUpperCase() +
                            submission.language.slice(1)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Challenge #{submission.challengeId.slice(0, 8)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            submission.verdict === "accepted"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {submission.verdict.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="bg-slate-50">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              No statistics yet. Start solving challenges to see your stats!
            </p>
            <Link href="/coding">
              <Button>Start Coding</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
