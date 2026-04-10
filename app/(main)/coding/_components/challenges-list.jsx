"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function ChallengesList({ challenges = [] }) {
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Filter challenges
  const filteredChallenges = challenges.filter((challenge) => {
    const matchesDifficulty = difficulty === "all" || challenge.difficulty === difficulty;
    const matchesCategory = category === "all" || challenge.category === category;
    const matchesSearch =
      !search ||
      challenge.title.toLowerCase().includes(search.toLowerCase()) ||
      challenge.category.toLowerCase().includes(search.toLowerCase());

    return matchesDifficulty && matchesCategory && matchesSearch;
  });

  // Get unique categories
  const categories = [...new Set(challenges.map((c) => c.category))];
  const difficulties = ["easy", "medium", "hard"];

  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search challenges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:flex-1"
        />
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {difficulties.map((d) => (
              <SelectItem key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="text-sm text-gray-600 mb-4">
        {filteredChallenges.length} challenge{filteredChallenges.length !== 1 ? "s" : ""} found
      </div>

      {/* Challenges Grid */}
      {filteredChallenges.length > 0 ? (
        <div className="space-y-3">
          {filteredChallenges.map((challenge) => (
            <Link key={challenge.id} href={`/coding/${challenge.id}`}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-400">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {challenge.title}
                        {challenge.acceptance > 50 && (
                          <span className="text-xs">✨</span>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        {challenge.category}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mt-1" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge
                        className={difficultyColors[challenge.difficulty]}
                      >
                        {challenge.difficulty.charAt(0).toUpperCase() +
                          challenge.difficulty.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {challenge.languages.length} languages
                      </Badge>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold">
                        {challenge.acceptance.toFixed(1)}% Acceptance
                      </p>
                      <p className="text-gray-600">
                        {challenge.submissionCount} submissions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed text-center py-12">
          <CardContent>
            <p className="text-gray-600">No challenges match your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
