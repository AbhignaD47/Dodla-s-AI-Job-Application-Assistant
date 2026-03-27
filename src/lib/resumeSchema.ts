export const resumeJsonSchema = {
    name: "resume_optimization",
    strict: true,
    schema: {
        type: "object",
        properties: {
            personalInfo: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    location: { type: "string" },
                    phone: { type: "string" },
                    email: { type: "string" },
                    links: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                label: { type: "string" },
                                url: { type: "string" }
                            },
                            required: ["label", "url"],
                            additionalProperties: false
                        }
                    }
                },
                required: ["name", "location", "phone", "email", "links"],
                additionalProperties: false
            },
            education: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        institution: { type: "string" },
                        location: { type: "string" },
                        degree: { type: "string" },
                        gpa: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        coursework: { type: "string" }
                    },
                    required: ["institution", "location", "degree", "gpa", "startDate", "endDate", "coursework"],
                    additionalProperties: false
                }
            },
            skills: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        category: { type: "string" },
                        items: { type: "array", items: { type: "string" } }
                    },
                    required: ["category", "items"],
                    additionalProperties: false
                }
            },
            experience: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        role: { type: "string" },
                        company: { type: "string" },
                        location: { type: "string" },
                        technologies: { type: "array", items: { type: "string" } },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        achievements: { type: "array", items: { type: "string" } }
                    },
                    required: ["role", "company", "location", "technologies", "startDate", "endDate", "achievements"],
                    additionalProperties: false
                }
            },
            projects: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        technologies: { type: "array", items: { type: "string" } },
                        date: { type: "string" },
                        achievements: { type: "array", items: { type: "string" } }
                    },
                    required: ["name", "technologies", "date", "achievements"],
                    additionalProperties: false
                }
            },
            certifications: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        issuer: { type: "string" },
                        link: { type: "string" },
                    },
                    required: ["name", "issuer", "link"],
                    additionalProperties: false
                }
            }
        },
        required: ["personalInfo", "education", "skills", "experience", "projects", "certifications"],
        additionalProperties: false
    }
};
