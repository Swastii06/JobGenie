"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Preferred Gemini models in order; fall back to earlier variants if unavailable.
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash-exp",
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Use a current model that supports generateContent on v1beta
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

const USD_TO_INR = 83; // fixed conversion for now; adjust if env-based later

const normalizeSalaryRanges = (ranges, experience, location) => {
  const years = typeof experience === "number" ? experience : 0;
  // Global downscale to keep predictions conservative
  const globalScale = 0.6;
  // Base brackets in USD per year
  let bracket;
  if (years <= 1) {
    bracket = { minMin: 15000, minMax: 50000, medMin: 20000, medMax: 80000, maxMin: 30000, maxMax: 120000 };
  } else if (years <= 3) {
    bracket = { minMin: 30000, minMax: 70000, medMin: 50000, medMax: 100000, maxMin: 70000, maxMax: 150000 };
  } else if (years <= 7) {
    bracket = { minMin: 60000, minMax: 100000, medMin: 80000, medMax: 150000, maxMin: 120000, maxMax: 220000 };
  } else {
    bracket = { minMin: 90000, minMax: 150000, medMin: 120000, medMax: 220000, maxMin: 150000, maxMax: 350000 };
  }

  // Optional coarse adjustment by location
  const loc = String(location || "").toLowerCase();
  let multiplier = 1.0;
  if (/(india|bangalore|bengaluru|mumbai|delhi|kolkata|hyderabad|pune|chennai)/.test(loc)) {
    multiplier = 0.35; // general USD-equivalent band for India
  } else if (/(europe|germany|france|spain|italy|poland|netherlands|sweden|norway|denmark|finland|uk|united kingdom)/.test(loc)) {
    multiplier = 0.9;
  } else if (/(canada|australia|new zealand)/.test(loc)) {
    multiplier = 0.95;
  } else if (/(usa|united states|us|san francisco|new york|seattle|boston|austin)/.test(loc)) {
    multiplier = 1.1;
  } else {
    multiplier = 0.2;
  }

  const safeRanges = Array.isArray(ranges) ? ranges : [];
  const n = safeRanges.length || 1;
  // Rank roles by original median to preserve relative ordering
  const indices = safeRanges
    .map((r, i) => ({ i, med: Number(r.median ?? 0) }))
    .sort((a, b) => a.med - b.med)
    .map((x) => x.i);

  return safeRanges.map((r, idx) => {
    const originalMin = Number(r.min ?? 0);
    const originalMed = Number(r.median ?? 0);
    const originalMax = Number(r.max ?? 0);

    const rank = Math.max(0, indices.indexOf(idx));
    const t = n > 1 ? rank / (n - 1) : 0.5; // 0..1

    // Base median distributed across the bracket by rank
    const baseMedian = lerp(bracket.medMin, bracket.medMax, t);
    const clampedOriginalMedian = originalMed > 0 ? clamp(originalMed, bracket.medMin, bracket.medMax) : baseMedian;
    const preMultMedian = 0.6 * baseMedian + 0.4 * clampedOriginalMedian;

    // Derive min/max around median with spreads
    let preMultMin = clamp(preMultMedian * 0.72, bracket.minMin, bracket.minMax);
    let preMultMax = clamp(preMultMedian * 1.28, bracket.maxMin, bracket.maxMax);

    // Ensure ordering pre-multiplier
    if (preMultMin > preMultMedian) preMultMin = clamp(preMultMedian * 0.9, bracket.minMin, bracket.minMax);
    if (preMultMax < preMultMedian) preMultMax = clamp(preMultMedian * 1.1, bracket.maxMin, bracket.maxMax);

    // Small jitter per role to avoid identical bars (±3%)
    const jitterSeed = ((idx + 1) * 9301 + 49297) % 233280;
    const jitter = ((jitterSeed / 233280) - 0.5) * 0.06; // -3%..+3%

    // Convert to INR and apply final scaling; bias min down, allow max up more
    const minBias = 0.4;
    const medianBias = 0.95;
    const maxBoost = 1.5;

    let min = Math.round(
      preMultMin *
        multiplier *
        (1 + jitter) *
        globalScale *
        minBias *
        USD_TO_INR
    );
    let median = Math.round(
      preMultMedian *
        multiplier *
        (1 + jitter) *
        globalScale *
        medianBias *
        USD_TO_INR
    );
    let max = Math.round(
      preMultMax * multiplier * (1 + jitter) * globalScale * USD_TO_INR
    );

    // Boost the top of the range
    max = Math.round(max * maxBoost);

    // Final ordering guard
    if (median < min) median = min + 1000;
    if (max < median) max = median + 1000;

    return {
      role: r.role || "Role",
      location: r.location || location || "Global",
      min,
      median,
      max,
    };
  });
};

export const generateAIInsights = async (industry, location, experience) => {
  // Convert slug to a more readable industry name for the prompt, if needed
  const readableIndustry = String(industry)
    .replace(/-/g, " ")
    .trim();
  const readableLocation = String(location || "Global").trim();

  const fallback = () => ({
    salaryRanges: [
      { role: "Junior Developer", min: 50000, max: 90000, median: 70000, location: readableLocation },
      { role: "Mid-level Developer", min: 80000, max: 130000, median: 105000, location: readableLocation },
      { role: "Senior Developer", min: 110000, max: 170000, median: 140000, location: readableLocation },
      { role: "Product Manager", min: 100000, max: 160000, median: 130000, location: readableLocation },
      { role: "Data Scientist", min: 100000, max: 170000, median: 135000, location: readableLocation },
    ],
    growthRate: 6.5,
    demandLevel: "HIGH",
    topSkills: ["JavaScript", "React", "Node.js", "SQL", "Cloud"],
    marketOutlook: "POSITIVE",
    keyTrends: [
      "AI adoption",
      "Cloud migration",
      "Remote collaboration",
      "Cybersecurity focus",
      "Data-driven decisions",
    ],
    recommendedSkills: [
      "TypeScript",
      "AWS/GCP",
      "Kubernetes",
      "Prompt Engineering",
      "System Design",
    ],
  });

  const prompt = `
    Analyze the current state of the ${readableIndustry} industry in ${readableLocation} for a professional with approximately ${typeof experience === "number" ? experience : 0} years of experience, and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "HIGH" | "MEDIUM" | "LOW",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }
    
    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges. Salaries must be realistic for the given location and experience level (avoid unrealistic values like $300k+ for entry-level).
    Growth rate should be a percentage between 0 and 100.
    Include at least 5 skills and trends.
  `;

  // No API key? Skip remote call and use deterministic fallback.
  if (!process.env.GEMINI_API_KEY) {
    const fb = fallback();
    fb.salaryRanges = normalizeSalaryRanges(fb.salaryRanges, experience, location);
    return fb;
  }

  let lastError;
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      parsed.salaryRanges = normalizeSalaryRanges(parsed.salaryRanges, experience, location);
      return parsed;
    } catch (err) {
      lastError = err;
      // If the model is not found, try the next candidate; otherwise break early.
      const msg = err?.message || "";
      if (!/not found/i.test(msg)) break;
    }
  }

  console.error("AI insights generation failed, using fallback:", lastError?.message || lastError);
  const fb = fallback();
  fb.salaryRanges = normalizeSalaryRanges(fb.salaryRanges, experience, location);
  return fb;
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // If no insights exist OR existing is a placeholder/incomplete, generate or refresh them
  const needsRefreshAfterProfileUpdate =
    user.industryInsight?.lastUpdated &&
    user.updatedAt &&
    user.updatedAt > user.industryInsight.lastUpdated;

  const shouldGenerate =
    needsRefreshAfterProfileUpdate ||
    !user.industryInsight ||
    !Array.isArray(user.industryInsight.salaryRanges) ||
    user.industryInsight.salaryRanges.length === 0 ||
    typeof user.industryInsight.growthRate !== "number" ||
    user.industryInsight.growthRate <= 0;

  if (shouldGenerate) {
    const insights = await generateAIInsights(
      user.industry,
      user.location || "Global",
      user.experience ?? 0
    );

    // Upsert to handle both create and update cases
    const industryInsight = await db.industryInsight.upsert({
      where: { industry: user.industry },
      create: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      update: {
        ...insights,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}
