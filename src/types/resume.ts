export interface ResumeData {
    personalInfo: {
        name: string;
        location: string;
        phone: string;
        email: string;
        links: { label: string; url: string }[];
    };
    education: {
        institution: string;
        location: string;
        degree: string;
        gpa?: string;
        startDate: string;
        endDate: string;
        coursework?: string;
    }[];
    skills: {
        category: string;
        items: string[];
    }[];
    experience: {
        role: string;
        company: string;
        location: string;
        technologies: string[];
        startDate: string;
        endDate: string;
        achievements: string[];
    }[];
    projects: {
        name: string;
        technologies: string[];
        date: string;
        achievements: string[];
    }[];
    certifications: {
        name: string;
        issuer: string;
        link?: string;
    }[];
}
