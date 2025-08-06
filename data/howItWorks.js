import { UserPlus, FileEdit, Users, LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Create Your Career Profile",
    description: "Tell us about your professional background to receive AI-powered guidance tailored just for you",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Build a Winning Application",
    description: "Craft recruiter-ready resume and cover letter with our AI tools",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    title: "Master the Interview",
    description:
      "Hone your skills with an AI coach that provides instant feedback on role-specific questions",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Track Your Progress",
    description: "Visualize your growth with detailed performance analytics interview scores and application success",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];
