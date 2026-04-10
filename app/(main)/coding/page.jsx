import { getCodingChallenges } from "@/actions/coding";
import ChallengesList from "./_components/challenges-list";
import HeroSection from "./_components/hero-section";
import { Code2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Coding Challenges",
  description: "Solve coding problems and improve your programming skills",
};

export default async function CodingPage() {
  const challenges = await getCodingChallenges();

  return (
    <div className="space-y-8">
      <HeroSection />

      {/* Challenges List */}
      <div id="challenges-section">
        <h2 className="text-3xl font-bold mb-6">All Challenges</h2>
        <ChallengesList challenges={challenges} />
      </div>

      {/* Call to Action */}
      {challenges.length === 0 && (
        <Card className="border-2 border-dashed text-center py-12">
          <CardContent>
            <Code2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Challenges Yet</h3>
            <p className="text-gray-600 mb-6">
              Check back soon for new coding challenges!
            </p>
            <Link href="/interview">
              <Button variant="outline">
                Explore Other Features
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
