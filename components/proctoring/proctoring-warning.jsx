// components/proctoring/proctoring-warning.jsx
"use client";

import React from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProctoringWarning({ violation, onDismiss, onAction }) {
  if (!violation) return null;

  const isHighSeverity = violation.severity === "high";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className={`w-full max-w-md ${isHighSeverity ? "border-destructive bg-destructive/5" : "border-secondary"}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isHighSeverity ? (
              <>
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-destructive">Warning</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5" />
                <span>Notice</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isHighSeverity ? "Your behavior may violate exam rules" : "Please follow exam guidelines"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-background p-4 rounded-lg border border-border space-y-2">
            <p className="font-medium">{violation.violationType.replace(/_/g, " ").toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">{violation.description}</p>
          </div>

          {isHighSeverity && (
            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">
                Multiple violations may result in exam termination or invalidation of results.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onDismiss}
              className="flex-1"
            >
              Dismiss
            </Button>
            {onAction && (
              <Button
                onClick={onAction}
                className="flex-1"
                variant={isHighSeverity ? "destructive" : "default"}
              >
                Understand
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
