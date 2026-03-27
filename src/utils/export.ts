import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

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
