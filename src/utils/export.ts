import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { ResumeData } from "@/types/resume";

export const exportToDOCX = async (markdownText: string, filename: string) => {
    const lines = markdownText.split("\n");
    const children: Paragraph[] = [];

    lines.forEach(line => {
        if (!line.trim()) return;

        let cleanText = line.trim().replace(/\*\*/g, ""); // strip bold markers for now

        if (cleanText.startsWith("# ")) {
            children.push(new Paragraph({
                text: cleanText.replace("# ", "").trim(),
                heading: HeadingLevel.HEADING_1,
            }));
        } else if (cleanText.startsWith("## ")) {
            children.push(new Paragraph({
                text: cleanText.replace("## ", "").trim(),
                heading: HeadingLevel.HEADING_2,
            }));
        } else if (cleanText.startsWith("### ")) {
            children.push(new Paragraph({
                text: cleanText.replace("### ", "").trim(),
                heading: HeadingLevel.HEADING_3,
            }));
        } else if (cleanText.startsWith("- ")) {
            children.push(new Paragraph({
                text: cleanText.replace("- ", "").trim(),
                bullet: { level: 0 }
            }));
        } else {
            children.push(new Paragraph({
                children: [new TextRun(cleanText)],
            }));
        }
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: children,
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
};

export const exportTemplateToDOCX = async (data: ResumeData, filename: string) => {
    const children: Paragraph[] = [];

    const createHeader = (title: string) => {
        children.push(new Paragraph({
            children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 24, font: "Calibri" })],
            heading: HeadingLevel.HEADING_2,
            border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } },
            spacing: { before: 160, after: 80 }
        }));
    };

    const createSplitLine = (leftText: string, rightText: string, boldLeft: boolean = false) => {
        children.push(new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
                new TextRun({ text: leftText, bold: boldLeft, size: 22, font: "Calibri" }),
                new TextRun({ text: `\t${rightText}`, size: 20, font: "Calibri" }),
            ],
            spacing: { after: 30 }
        }));
    };

    // Personal Info
    children.push(new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: data.personalInfo.name.toUpperCase(), bold: true, size: 36, font: "Calibri" })],
        spacing: { after: 60 }
    }));

    const contactParts = [
        data.personalInfo.location,
        data.personalInfo.phone,
        data.personalInfo.email,
        ...data.personalInfo.links.map(l => l.url.replace(/^https?:\/\/(www\.)?/, ''))
    ].filter(Boolean);

    children.push(new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: contactParts.join(" | "), size: 20, font: "Calibri" })],
        spacing: { after: 120 }
    }));

    // Education
    if (data.education && data.education.length > 0) {
        createHeader("EDUCATION");
        data.education.forEach(edu => {
            const eduLine1 = `${edu.degree}`;
            const dates = `${edu.startDate} – ${edu.endDate}`;
            createSplitLine(eduLine1, dates, true);
            
            const eduLine2 = `${edu.institution}${edu.location ? ", " + edu.location : ""}`;
            children.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: eduLine2, size: 21, font: "Calibri" }),
                    new TextRun({ text: edu.gpa ? `\tGPA: ${edu.gpa}` : "", size: 21, font: "Calibri" }),
                ],
                spacing: { after: 30 }
            }));

            if (edu.coursework) {
                children.push(new Paragraph({
                    children: [new TextRun({ text: `Relevant Coursework: ${edu.coursework}`, size: 20, font: "Calibri" })],
                    spacing: { after: 60 }
                }));
            }
        });
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
        createHeader("SKILLS");
        data.skills.forEach(skill => {
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: `${skill.category}: `, bold: true, size: 21, font: "Calibri" }),
                    new TextRun({ text: skill.items.join(", "), size: 21, font: "Calibri" })
                ],
                spacing: { after: 30 }
            }));
        });
    }

    // Professional Experience
    if (data.experience && data.experience.length > 0) {
        createHeader("PROFESSIONAL EXPERIENCE");
        data.experience.forEach(exp => {
            let roleLine = exp.role;
            if (exp.technologies && exp.technologies.length > 0) {
                roleLine += ` | `;
            }
            
            // Build the left side of the split line manually to set normal font for technologies
            children.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: exp.role, bold: true, size: 22, font: "Calibri" }),
                    ...(exp.technologies && exp.technologies.length > 0 ? [new TextRun({ text: ` | ${exp.technologies.join(", ")}`, size: 22, font: "Calibri" })] : []),
                    new TextRun({ text: `\t${exp.startDate} – ${exp.endDate}`, size: 20, font: "Calibri" }),
                ],
                spacing: { after: 30 }
            }));
            
            const companyLine = `${exp.company}${exp.location ? ", " + exp.location : ""}`;
            children.push(new Paragraph({ 
                children: [new TextRun({ text: companyLine, size: 21, font: "Calibri" })], 
                spacing: { after: 40 } 
            }));
            
            exp.achievements.forEach(ach => {
                children.push(new Paragraph({
                    children: [new TextRun({ text: ach, size: 21, font: "Calibri" })],
                    bullet: { level: 0 },
                    spacing: { after: 30 }
                }));
            });
        });
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
        createHeader("PROJECTS");
        data.projects.forEach(proj => {
            children.push(new Paragraph({
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: proj.name, bold: true, size: 22, font: "Calibri" }),
                    ...(proj.technologies && proj.technologies.length > 0 ? [new TextRun({ text: ` | ${proj.technologies.join(", ")}`, size: 22, font: "Calibri" })] : []),
                    new TextRun({ text: `\t${proj.date}`, size: 20, font: "Calibri" }),
                ],
                spacing: { after: 40 }
            }));
            
            proj.achievements.forEach(ach => {
                children.push(new Paragraph({
                    children: [new TextRun({ text: ach, size: 21, font: "Calibri" })],
                    bullet: { level: 0 },
                    spacing: { after: 30 }
                }));
            });
        });
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
        createHeader("CERTIFICATIONS");
        data.certifications.forEach(cert => {
            let certLine = cert.name;
            if (cert.issuer) certLine = `${cert.issuer} - ${certLine}`;
            if (cert.link) certLine += ` [Link: ${cert.link}]`;
            children.push(new Paragraph({
                children: [new TextRun({ text: certLine, size: 21, font: "Calibri" })],
                spacing: { after: 30 }
            }));
        });
    }

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: { font: "Calibri", size: 21 },
                    paragraph: { spacing: { line: 276 } } // ~1.15 line spacing (240 is single)
                }
            }
        },
        sections: [{
            properties: {
                page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } // 0.5 inch margins (1440 twips = 1 inch)
            },
            children: children,
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
};


export const exportToPDF = (markdownText: string, filename: string) => {
    const doc = new jsPDF({
        unit: 'pt',
        format: 'a4'
    });

    let yOffset = 50;
    const margin = 50;
    const maxWidth = doc.internal.pageSize.getWidth() - margin * 2;
    
    const lines = markdownText.split("\n");
    
    lines.forEach(line => {
        if (!line.trim()) {
            yOffset += 10;
            return;
        }

        let text = line.trim();
        let isBold = false;
        let fontSize = 11;

        if (text.startsWith("# ")) {
            text = text.replace("# ", "");
            fontSize = 18;
            isBold = true;
            yOffset += 15;
        } else if (text.startsWith("## ")) {
            text = text.replace("## ", "");
            fontSize = 14;
            isBold = true;
            yOffset += 10;
        } else if (text.startsWith("### ")) {
            text = text.replace("### ", "");
            fontSize = 12;
            isBold = true;
            yOffset += 5;
        } else if (text.startsWith("- ")) {
            text = "• " + text.replace("- ", "");
        }
        
        text = text.replace(/\*\*/g, "");

        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setFontSize(fontSize);

        const splitText = doc.splitTextToSize(text, maxWidth);
        
        splitText.forEach((scLine: string) => {
            if (yOffset > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yOffset = margin;
            }
            doc.text(scLine, margin, yOffset);
            yOffset += fontSize * 1.5;
        });
    });

    doc.save(filename);
};

export const exportTemplateToPDF = async (elementId: string, filename: string) => {
    if (typeof window === "undefined") return;
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById(elementId);
    if (!element) return;

    const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
};
