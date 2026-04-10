"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Target, Code2, TrendingUp } from "lucide-react";

export default function CodingStats({ stats }) {
  if (!stats) {
    return (
      <Card className="bg-slate-50">
        <CardContent className="pt-6 text-center text-gray-500">
          <p>No stats available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Coding Statistics</h3>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Solved */}
        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Total Solved</p>
                <p className="text-2xl font-bold text-green-700">
                  {stats.totalAccepted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Attempted */}
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Attempted</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.totalAttempted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Submissions */}
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Code2 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Submissions</p>
                <p className="text-2xl font-bold text-purple-700">
                  {stats.totalSubmissions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance Rate */}
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-orange-700">
                  {stats.acceptanceRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Distribution */}
      {Object.keys(stats.languageDistribution || {}).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Language Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.languageDistribution).map(([lang, count]) => (
                <div key={lang}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{lang}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (count / stats.totalSubmissions) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
