"use client";

import React from "react";
import { ResumeData } from "@/types/resume";

interface ResumeTemplateProps {
    data: ResumeData;
    className?: string;
    id?: string;
}

export const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ data, className = "", id = "resume-template-root" }) => {
    // Blue color used in the template
    const primaryColor = "#0047AB"; // A standard darker blue similar to the image

    return (
        <div 
            className={`w-[816px] min-h-[1056px] bg-white text-black p-[0.75in] mx-auto shadow-2xl ${className}`}
            style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: "11pt", lineHeight: "1.15" }}
            id={id}
        >
            {/* AWS Badge placeholder. We'll skip the actual absolute logo if not provided, but here is where it would be */}
            {/* Header */}
            <div className="text-center mb-2">
                <h1 className="text-[20pt] font-bold" style={{ color: primaryColor }}>{data.personalInfo.name}</h1>
                <div className="text-[10pt] mt-1 font-bold">
                    [{data.personalInfo.location}] | [{data.personalInfo.phone}] | [{data.personalInfo.email}]{" "}
                    {data.personalInfo.links.map((link, i) => (
                        <span key={i}> | [<a href={link.url} className="underline text-black">{link.label}</a>]</span>
                    ))}
                </div>
            </div>

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <div className="mb-2">
                    <h2 className="text-[12pt] font-bold text-center uppercase border-t border-b border-solid mb-1" style={{ color: primaryColor, borderColor: primaryColor }}>
                        Education
                    </h2>
                    {data.education.map((edu, idx) => (
                        <div key={idx} className="mb-1">
                            <div className="flex justify-between font-bold">
                                <span style={{ color: primaryColor }}>
                                    {edu.institution}{edu.location ? `, ${edu.location}` : ""}
                                </span>
                                <span style={{ color: primaryColor }}>{edu.startDate} - {edu.endDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{edu.degree}</span>
                                {edu.gpa && <span className="font-bold">GPA: {edu.gpa}</span>}
                            </div>
                            {edu.coursework && (
                                <div className="italic text-[10pt]">
                                    Relevant Coursework: {edu.coursework}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
                <div className="mb-2">
                    <h2 className="text-[12pt] font-bold text-center uppercase border-t border-b border-solid mb-1" style={{ color: primaryColor, borderColor: primaryColor }}>
                        Skills
                    </h2>
                    <ul className="list-none p-0 m-0">
                        {data.skills.map((skillGroup, idx) => (
                            <li key={idx} className="mb-0.5">
                                <span className="font-bold" style={{ color: primaryColor }}>{skillGroup.category}: </span>
                                <span>{skillGroup.items.join(", ")}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Professional Experience */}
            {data.experience && data.experience.length > 0 && (
                <div className="mb-2">
                    <h2 className="text-[12pt] font-bold text-center uppercase border-t border-b border-solid mb-1" style={{ color: primaryColor, borderColor: primaryColor }}>
                        Professional Experience
                    </h2>
                    {data.experience.map((exp, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="flex justify-between font-bold">
                                <span>
                                    <span style={{ color: primaryColor }}>{exp.role}</span>
                                    {exp.technologies && exp.technologies.length > 0 && (
                                        <span className="italic font-normal" style={{ color: primaryColor }}> | {exp.technologies.join(", ")}</span>
                                    )}
                                </span>
                                <span style={{ color: primaryColor }}>{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div className="flex justify-between italic text-[10.5pt] mb-1">
                                <span>{exp.company}</span>
                                <span>{exp.location}</span>
                            </div>
                            <ul className="list-disc leading-snug ml-5 mt-0 mb-0">
                                {exp.achievements.map((ach, i) => (
                                    <li key={i} className="pl-1 mb-0.5 text-[10.5pt]">{ach}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <div className="mb-2">
                    <h2 className="text-[12pt] font-bold text-center uppercase border-t border-b border-solid mb-1" style={{ color: primaryColor, borderColor: primaryColor }}>
                        Projects
                    </h2>
                    {data.projects.map((proj, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="flex justify-between font-bold">
                                <span>
                                    <span style={{ color: primaryColor }}>{proj.name}</span>
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <span className="italic font-normal" style={{ color: primaryColor }}> | {proj.technologies.join(", ")}</span>
                                    )}
                                </span>
                                <span style={{ color: primaryColor }}>{proj.date}</span>
                            </div>
                            <ul className="list-disc leading-snug ml-5 mt-0.5 mb-0">
                                {proj.achievements.map((ach, i) => (
                                    <li key={i} className="pl-1 mb-0.5 text-[10.5pt]">{ach}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
                <div className="mb-2">
                    <h2 className="text-[12pt] font-bold text-center uppercase border-t border-b border-solid mb-1" style={{ color: primaryColor, borderColor: primaryColor }}>
                        Certifications
                    </h2>
                    <ul className="list-none p-0 m-0">
                        {data.certifications.map((cert, idx) => (
                            <li key={idx} className="mb-0.5">
                                <span className="font-bold" style={{ color: primaryColor }}>{cert.issuer}: </span>
                                <span>{cert.name} {cert.link && <span className="text-blue-600 font-bold">[<a href={cert.link}>Link</a>]</span>}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
