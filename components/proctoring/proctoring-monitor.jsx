// components/proctoring/proctoring-monitor.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, AlertTriangle, Eye, Mic, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProctoringMonitor({ violations = [], isMonitoring = false, sessionTime = null }) {
  const violationStats = {
    high: violations.filter((v) => v.severity === "high").length,
    medium: violations.filter((v) => v.severity === "medium").length,
    low: violations.filter((v) => v.severity === "low").length,
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getViolationIcon = (violationType) => {
    switch (violationType) {
      case "face_not_detected":
        return <Eye className="h-4 w-4" />;
      case "object_detected":
        return <AlertTriangle className="h-4 w-4" />;
      case "tab_switch":
        return <Maximize2 className="h-4 w-4" />;
      case "audio_detected":
        return <Mic className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Status Section */}
      <Card className={isMonitoring ? "border-green-500/50 bg-green-500/5" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isMonitoring ? (
                <>
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                  <span>Proctoring Active</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span>Monitoring Standby</span>
                </>
              )}
            </CardTitle>
            {sessionTime !== null && (
              <div className="text-sm font-mono bg-background px-3 py-1 rounded">
                {formatTime(sessionTime)}
              </div>
            )}
          </div>
          <CardDescription>
            {isMonitoring
              ? "Your exam session is being monitored for integrity"
              : "Proctoring will monitor your behavior during the exam"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Violations Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Violations Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="text-2xl font-bold text-destructive">{violationStats.high}</div>
              <div className="text-xs text-muted-foreground">High Severity</div>
            </div>
            <div className="text-center p-3 rounded-lg border border-secondary/20 bg-secondary/5">
              <div className="text-2xl font-bold text-secondary">{violationStats.medium}</div>
              <div className="text-xs text-muted-foreground">Medium Severity</div>
            </div>
            <div className="text-center p-3 rounded-lg border border-border bg-background">
              <div className="text-2xl font-bold">{violationStats.low}</div>
              <div className="text-xs text-muted-foreground">Low Severity</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {violations.slice(-10).reverse().map((violation, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background/50"
                >
                  <Badge variant={getSeverityColor(violation.severity)} className="mt-1 shrink-0">
                    {violation.severity[0].toUpperCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getViolationIcon(violation.violationType)}
                      <span className="text-sm font-medium truncate">
                        {violation.violationType.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {violation.description || "Suspicious activity detected"}
                    </p>
                    <div className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(violation.detectedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Violations */}
      {violations.length === 0 && isMonitoring && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Good! No violations detected so far.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
