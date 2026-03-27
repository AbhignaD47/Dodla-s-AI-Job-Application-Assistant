import { ResumeData } from "@/types/resume";

export function formatResumeToText(data: ResumeData): string {
    const lines: string[] = [];

    // Header
    lines.push(data.personalInfo.name.toUpperCase());
    const contactParts = [
        data.personalInfo.location,
        data.personalInfo.phone,
        data.personalInfo.email,
        ...data.personalInfo.links.map(l => l.label || l.url)
    ].filter(Boolean);
    
    lines.push(contactParts.join(" | "));
    lines.push("");

    // Education
    if (data.education && data.education.length > 0) {
        lines.push("EDUCATION");
        data.education.forEach(edu => {
            const eduLine1 = `${edu.institution}${edu.location ? ", " + edu.location : ""}`;
            const dates = `${edu.startDate} – ${edu.endDate}`;
            lines.push(`${eduLine1}    ${dates}`);
            
            const eduLine2 = edu.degree;
            if (edu.gpa) {
                lines.push(`${eduLine2}    GPA: ${edu.gpa}`);
            } else {
                lines.push(eduLine2);
            }

            if (edu.coursework) {
                lines.push(`Relevant Coursework: ${edu.coursework}`);
            }
            lines.push("");
        });
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
        lines.push("SKILLS");
        data.skills.forEach(skill => {
            lines.push(`${skill.category}: ${skill.items.join(", ")}`);
        });
        lines.push("");
    }

    // Professional Experience
    if (data.experience && data.experience.length > 0) {
        lines.push("PROFESSIONAL EXPERIENCE");
        data.experience.forEach(exp => {
            let roleLine = exp.role;
            if (exp.technologies && exp.technologies.length > 0) {
                roleLine += ` | ${exp.technologies.join(", ")}`;
            }
            const dates = `${exp.startDate} – ${exp.endDate}`;
            lines.push(`${roleLine}    ${dates}`);
            lines.push(`${exp.company}${exp.location ? ", " + exp.location : ""}`);
            
            exp.achievements.forEach(ach => {
                lines.push(`● ${ach}`);
            });
            lines.push("");
        });
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
        lines.push("PROJECTS");
        data.projects.forEach(proj => {
            let projLine = proj.name;
            if (proj.technologies && proj.technologies.length > 0) {
                projLine += ` | ${proj.technologies.join(", ")}`;
            }
            const date = proj.date;
            lines.push(`${projLine}    ${date}`);
            
            proj.achievements.forEach(ach => {
                lines.push(`● ${ach}`);
            });
            lines.push("");
        });
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
        lines.push("CERTIFICATIONS");
        data.certifications.forEach(cert => {
            let certLine = cert.name;
            if (cert.link) certLine += ` [${cert.link}]`;
            if (cert.issuer) certLine = `${cert.issuer}: ${certLine}`;
            lines.push(certLine);
        });
        lines.push("");
    }

    return lines.join("\n").trim();
}
