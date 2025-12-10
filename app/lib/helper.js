// Helper function to format date range for ATS-friendly format
function formatDateRange(startDate, endDate, current, location) {
  const dateStr = current
    ? `${startDate} - Present`
    : `${startDate} - ${endDate}`;
  return location ? `${dateStr} | ${location}` : dateStr;
}

// Helper function to format education entries (ATS-friendly)
export function formatEducationMarkdown(entries) {
  if (!entries?.length) return "";

  return (
    `## EDUCATION\n\n` +
    entries
      .map((entry) => {
        const dateRange = formatDateRange(
          entry.startDate,
          entry.endDate,
          entry.current,
          entry.location
        );
        const lines = [
          `**${entry.organization}**`,
          `${entry.title}`,
        ];
        // Add right-aligned date/location info
        lines.push(`<div align="right">${dateRange}</div>`);
        if (entry.description) {
          // Split description by newlines for bullet points
          const bullets = entry.description
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => `*   ${line.trim()}`);
          lines.push(...bullets);
        }
        return lines.join("\n");
      })
      .join("\n\n")
  );
}

// Helper function to format experience entries (ATS-friendly)
export function formatExperienceMarkdown(entries) {
  if (!entries?.length) return "";

  return (
    `## EXPERIENCE\n\n` +
    entries
      .map((entry) => {
        const dateRange = formatDateRange(
          entry.startDate,
          entry.endDate,
          entry.current,
          entry.location
        );
        const lines = [
          `**${entry.organization}**`,
          `${entry.title}`,
        ];
        // Add right-aligned date/location info
        lines.push(`<div align="right">${dateRange}</div>`);
        // Split description by newlines for bullet points
        const bullets = entry.description
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => `*   ${line.trim()}`);
        lines.push(...bullets);
        return lines.join("\n");
      })
      .join("\n\n")
  );
}

// Helper function to format projects entries (ATS-friendly)
export function formatProjectsMarkdown(entries) {
  if (!entries?.length) return "";

  return (
    `## PROJECTS AND HACKATHONS\n\n` +
    entries
      .map((entry) => {
        const lines = [`**${entry.title}**`];
        if (entry.technologies) {
          lines.push(`Technologies: \`${entry.technologies}\``);
        }
        if (entry.link) {
          lines.push(`<div align="right">[Link](${entry.link})</div>`);
        }
        // Split description by newlines for bullet points
        const bullets = entry.description
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => `*   ${line.trim()}`);
        lines.push(...bullets);
        return lines.join("\n");
      })
      .join("\n\n")
  );
}

// Legacy function for backward compatibility
export function entriesToMarkdown(entries, type) {
  if (!entries?.length) return "";
  if (type === "Education") return formatEducationMarkdown(entries);
  if (type === "Work Experience" || type === "Experience") return formatExperienceMarkdown(entries);
  if (type === "Projects" || type === "Projects and Hackathons") return formatProjectsMarkdown(entries);
  
  // Fallback for other types
  return (
    `## ${type}\n\n` +
    entries
      .map((entry) => {
        const dateRange = entry.current
          ? `${entry.startDate} - Present`
          : `${entry.startDate} - ${entry.endDate}`;
        return `### ${entry.title} @ ${entry.organization}\n${dateRange}\n\n${entry.description}`;
      })
      .join("\n\n")
  );
}