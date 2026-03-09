"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Target, X, Plus } from "lucide-react";

export interface JobPreferences {
    keywords: string;
    location: string;
    skills: string[];
    experience_years: number;
}

interface JobPreferencesFormProps {
    initialPreferences: JobPreferences;
    onSubmit: (preferences: JobPreferences) => void;
    isLoading: boolean;
}

export function JobPreferencesForm({ initialPreferences, onSubmit, isLoading }: JobPreferencesFormProps) {
    const [keywords, setKeywords] = useState(initialPreferences.keywords);
    const [location, setLocation] = useState(initialPreferences.location || "");
    const [experience, setExperience] = useState(initialPreferences.experience_years.toString());
    const [skills, setSkills] = useState<string[]>(initialPreferences.skills || []);
    const [newSkill, setNewSkill] = useState("");

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            keywords: keywords.trim(),
            location: location.trim(),
            skills: skills,
            experience_years: parseInt(experience) || 0
        });
    };

    return (
        <Card className="border-brand/30 shadow-md bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="pb-4 border-b bg-white/50">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="w-5 h-5 text-brand" />
                    Customize Job Matches
                </CardTitle>
                <CardDescription>
                    We've pre-filled this with data from your resume. Adjust it to exactly what you're looking for!
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="keywords">Desired Role / Keywords</Label>
                            <Input
                                id="keywords"
                                placeholder="e.g. React Developer"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="bg-white"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Used to search the live job boards.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location (Optional)</Label>
                            <Input
                                id="location"
                                placeholder="e.g. Remote, New York, London"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-white"
                            />
                            <p className="text-xs text-muted-foreground">Filter jobs by city, state, or 'Remote'.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input
                                id="experience"
                                type="number"
                                min="0"
                                max="50"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="bg-white"
                                required
                            />
                            <p className="text-xs text-muted-foreground">Used by the AI to filter senior vs junior roles.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Core Skills (Used for AI Scoring)</Label>
                        <div className="flex flex-wrap gap-2 mb-2 p-3 bg-white border rounded-md min-h-[60px]">
                            {skills.length === 0 && <span className="text-sm text-muted-foreground italic">No skills added yet.</span>}
                            {skills.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 pr-1 py-1">
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(skill)}
                                        className="rounded-full hover:bg-blue-200 p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2 max-w-sm">
                            <Input
                                placeholder="Add a skill..."
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddSkill();
                                    }
                                }}
                                className="bg-white"
                            />
                            <Button type="button" variant="outline" onClick={handleAddSkill}>
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" className="bg-brand text-white hover:bg-brand/90" disabled={isLoading || !keywords.trim()}>
                            {isLoading ? "Analyzing Jobs..." : "Find Best Matches"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
