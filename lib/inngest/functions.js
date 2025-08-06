import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" },
  async ({ step }) => {
    const industries = await step.run("Fetch all industries", async () => {
      return db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
        Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
        {
          "salaryRanges": [{ "role": "string", "min": number, "max": number, "median": number, "location": "string" }],
          "growthRate": number,
          "demandLevel": "High" | "Medium" | "Low",
          "topSkills": ["skill1", "skill2"],
          "marketOutlook": "Positive" | "Neutral" | "Negative",
          "keyTrends": ["trend1", "trend2"],
          "recommendedSkills": ["skill1", "skill2"]
        }
        
        IMPORTANT: You must return ONLY the JSON object. All fields are required and must be populated with realistic data.
     Do not leave any arrays like 'topSkills' or 'salaryRanges' empty. 
     If you cannot find exact data for a field, provide a reasonable and realistic estimate based on your knowledge. 
     The 'salaryRanges' array MUST contain at least 5 different job roles.
     The 'topSkills' and 'keyTrends' arrays MUST contain at least 5 items each.
      `;

      const insightsJSON = await step.run(`Generate insights for ${industry}`, async () => {
        const result = await model.generateContent(prompt);
        const responseText = result.response.candidates[0].content.parts[0].text || "";
        return responseText.replace(/```(?:json)?\n?/g, "").trim();
      });

      console.log(">>>>>> RAW AI STRING FOR:", industry, "\n", insightsJSON);

      let insights;
      try {
        insights = JSON.parse(insightsJSON);
        console.log(">>>>>> SUCCESSFULLY PARSED INSIGHTS:", industry, insights);
      } catch (error) {
        console.error("Failed to parse JSON from AI for industry:", industry, error);
        await step.skip(`Skipping update for ${industry} due to invalid JSON response.`);
        continue;
      }

      await step.run(`Update database for ${industry}`, async () => {
        const dataToUpdate = {
          salaryRanges: insights.salaryRanges,
          growthRate: insights.growthRate,
          // Fix #1
          demandLevel: insights.demandLevel.toUpperCase(),
          topSkills: insights.topSkills,
          // Fix #2 - The new fix
          marketOutlook: insights.marketOutlook.toUpperCase(),
          keyTrends: insights.keyTrends,
          recommendedSkills: insights.recommendedSkills,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        await db.industryInsight.update({
          where: { industry },
          data: dataToUpdate,
        });
      });
    }

    return { message: `Successfully processed ${industries.length} industries.` };
  }
);