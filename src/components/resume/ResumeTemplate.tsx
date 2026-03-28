"use client";

import React from "react";
import { ResumeData } from "@/types/resume";

interface ResumeTemplateProps {
    data: ResumeData;
    className?: string;
    id?: string;
}

export const ResumeTemplate: React.FC<ResumeTemplateProps> = ({ data, className = "", id = "resume-template-root" }) => {
    return (
        <div 
            className={`w-[816px] min-h-[1056px] bg-white text-black p-[0.6in] mx-auto shadow-2xl ${className}`}
            style={{ fontFamily: "'Calibri', 'Arial', 'Helvetica', sans-serif", fontSize: "10.5pt", lineHeight: "1.3" }}
            id={id}
        >
            {/* Header */}
            <div className="mb-[12px]">
                <h1 className="text-[18pt] font-bold uppercase tracking-wide m-0 p-0 leading-tight">
                    {data.personalInfo.name}
                </h1>
                <div className="text-[10pt] mt-[4px] leading-tight text-black">
                    {[
                        data.personalInfo.location,
                        data.personalInfo.phone,
                        data.personalInfo.email
                    ].filter(Boolean).join(" | ")}
                    {data.personalInfo.links.length > 0 && " | "}
                    {data.personalInfo.links.map((link, i) => (
                        <span key={i}>
                            <a href={link.url} className="text-black no-underline hover:underline">
                                {link.label || link.url.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                            {i < data.personalInfo.links.length - 1 ? " | " : ""}
                        </span>
                    ))}
                </div>
            </div>

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <div className="mb-[12px]">
                    <h2 className="text-[12pt] font-bold uppercase border-b-[1px] border-black pb-[4px] mt-[12px] mb-[6px] tracking-wide">
                        Education
                    </h2>
                    {data.education.map((edu, idx) => (
                        <div key={idx} className="mb-[8px]">
                            <div className="flex justify-between font-bold text-[11pt] leading-tight mb-[2px]">
                                <span>{edu.degree}</span>
                                <span>{edu.startDate} – {edu.endDate}</span>
                            </div>
                            <div className="flex justify-between text-[10.5pt] leading-tight">
                                <span>{edu.institution}{edu.location ? `, ${edu.location}` : ""}</span>
                                {edu.gpa && <span>GPA: {edu.gpa}</span>}
                            </div>
                            {edu.coursework && (
                                <div className="text-[10pt] mt-[4px] leading-tight">
                                    Relevant Coursework: {edu.coursework}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
                <div className="mb-[12px]">
                    <h2 className="text-[12pt] font-bold uppercase border-b-[1px] border-black pb-[4px] mt-[12px] mb-[6px] tracking-wide">
                        Skills
                    </h2>
                    <div className="text-[10.5pt] leading-[1.4]">
                        {data.skills.map((skillGroup, idx) => (
                            <div key={idx}>
                                <span className="font-bold">{skillGroup.category}: </span>
                                <span>{skillGroup.items.join(", ")}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Professional Experience */}
            {data.experience && data.experience.length > 0 && (
                <div className="mb-[12px]">
                    <h2 className="text-[12pt] font-bold uppercase border-b-[1px] border-black pb-[4px] mt-[12px] mb-[6px] tracking-wide">
                        Professional Experience
                    </h2>
                    {data.experience.map((exp, idx) => (
                        <div key={idx} className="mb-[10px]">
                            <div className="flex justify-between font-bold text-[11pt] leading-tight mb-[2px]">
                                <span>
                                    {exp.role}
                                    {exp.technologies && exp.technologies.length > 0 && (
                                        <span className="font-normal"> | {exp.technologies.join(", ")}</span>
                                    )}
                                </span>
                                <span>{exp.startDate} – {exp.endDate}</span>
                            </div>
                            <div className="text-[10.5pt] leading-tight mb-[4px]">
                                {exp.company}{exp.location ? `, ${exp.location}` : ""}
                            </div>
                            <ul className="list-none m-0 p-0 text-[10.5pt]">
                                {exp.achievements.map((ach, i) => (
                                    <li key={i} className="leading-[1.4] mb-[3px] pl-[14px] relative">
                                        <span className="absolute left-[0px] top-[0px] font-bold">●</span>
                                        {ach}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <div className="mb-[12px]">
                    <h2 className="text-[12pt] font-bold uppercase border-b-[1px] border-black pb-[4px] mt-[12px] mb-[6px] tracking-wide">
                        Projects
                    </h2>
                    {data.projects.map((proj, idx) => (
                        <div key={idx} className="mb-[10px]">
                            <div className="flex justify-between font-bold text-[11pt] leading-tight mb-[4px]">
                                <span>
                                    {proj.name}
                                    {proj.technologies && proj.technologies.length > 0 && (
                                        <span className="font-normal"> | {proj.technologies.join(", ")}</span>
                                    )}
                                </span>
                                <span>{proj.date}</span>
                            </div>
                            <ul className="list-none m-0 p-0 text-[10.5pt]">
                                {proj.achievements.map((ach, i) => (
                                    <li key={i} className="leading-[1.4] mb-[3px] pl-[14px] relative">
                                        <span className="absolute left-[0px] top-[0px] font-bold">●</span>
                                        {ach}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
                <div className="mb-[12px]">
                    <h2 className="text-[12pt] font-bold uppercase border-b-[1px] border-black pb-[4px] mt-[12px] mb-[6px] tracking-wide">
                        Certifications
                    </h2>
                    <div className="text-[10.5pt] leading-[1.4]">
                        {data.certifications.map((cert, idx) => (
                            <div key={idx} className="mb-[2px]">
                                {cert.name}
                                {cert.issuer && ` - ${cert.issuer}`}
                                {cert.link && (
                                    <>
                                        {" "}
                                        [<a href={cert.link} className="text-black no-underline hover:underline">Link</a>]
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
