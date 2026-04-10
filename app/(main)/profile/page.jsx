import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import { getUserOnboardingStatus, getUserProfile, updateUser } from "@/actions/user";
import ProfileForm from "./_components/profile-form";

// Force dynamic rendering - don't attempt static generation at build time
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const profile = await getUserProfile();

  return (
    <main>
      <ProfileForm industries={industries} profile={profile} />
    </main>
  );
}

