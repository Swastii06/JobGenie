"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { industries as industriesData } from "@/data/industries";

// This is the corrected updateUser function without location.
// It ONLY updates the user's profile.
export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Compose combined industry key: e.g., "tech-software-development"
    const slugify = (value) =>
      String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const combinedIndustry = [
      data?.industry,
      data?.subIndustry ? slugify(data.subIndustry) : null,
      data?.location ? slugify(data.location) : null,
    ]
      .filter(Boolean)
      .join("-");

    // Ensure an IndustryInsight exists for the selected industry to satisfy FK constraint
    const existingInsight = await db.industryInsight.findUnique({
      where: { industry: combinedIndustry },
      select: { industry: true },
    });

    if (!existingInsight) {
      // Create a placeholder insight so the FK update succeeds.
      // Dashboard can later update/refresh this record as needed.
      await db.industryInsight.create({
        data: {
          industry: combinedIndustry,
          salaryRanges: [],
          growthRate: 0,
          demandLevel: "MEDIUM",
          topSkills: [],
          marketOutlook: "NEUTRAL",
          keyTrends: [],
          recommendedSkills: [],
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    const updatedUser = await db.user.update({
      where: {
        clerkUserId: userId,
      },
      data: {
        industry: combinedIndustry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
        location: data.location,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error.message);
    throw new Error("Failed to update profile");
  }
}

// This is the corrected and efficient getUserOnboardingStatus function.
export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    select: {
      industry: true,
    },
  });

  if (!user) throw new Error("User not found");

  return {
    isOnboarded: !!user.industry,
  };
}

// Fetch current user's profile with parsed industry and subIndustry for editing
export async function getUserProfile() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      location: true,
      experience: true,
      bio: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const slugify = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  let industryId = "";
  let subIndustry = "";

  if (user.industry) {
    const segments = String(user.industry).split("-");
    industryId = segments[0] || "";

    // Derive subIndustry by removing trailing location slug if present
    const locationSlug = slugify(user.location || "");
    const locationTokens = locationSlug ? locationSlug.split("-") : [];
    let subSegments = segments.slice(1);
    if (
      locationTokens.length > 0 &&
      subSegments.length >= locationTokens.length &&
      subSegments.slice(-locationTokens.length).join("-") === locationSlug
    ) {
      subSegments = subSegments.slice(0, -locationTokens.length);
    }
    const subSlug = subSegments.join("-");

    // Map slug back to label from industries data
    const selectedIndustry = industriesData.find((i) => i.id === industryId);
    if (selectedIndustry && subSlug) {
      const found = selectedIndustry.subIndustries.find(
        (name) => slugify(name) === subSlug
      );
      subIndustry = found || "";
    }
  }

  return {
    industryId,
    subIndustry,
    location: user.location || "",
    experience: user.experience ?? 0,
    bio: user.bio || "",
    skillsString: Array.isArray(user.skills) ? user.skills.join(", ") : "",
  };
}