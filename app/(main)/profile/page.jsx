import { redirect } from "next/navigation";
import { industries } from "@/data/industries";
import { getUserOnboardingStatus, getUserProfile, updateUser } from "@/actions/user";
import ProfileForm from "./_components/profile-form";

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

