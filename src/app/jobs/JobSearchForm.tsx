"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

interface JobSearchFormProps {
    initialQuery?: string;
    initialLocation?: string;
}

export function JobSearchForm({ initialQuery = "", initialLocation = "" }: JobSearchFormProps) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [location, setLocation] = useState(initialLocation);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (location.trim()) params.set("location", location.trim());

        router.push(`/jobs?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl flex flex-col sm:flex-row items-center gap-3 mt-8">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Job titles, required skills, or companies..."
                    className="pl-12 py-6 text-base md:text-lg rounded-xl shadow-sm bg-white"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <div className="relative flex-1 w-full">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="City, state, or 'Remote'"
                    className="pl-12 py-6 text-base md:text-lg rounded-xl shadow-sm bg-white"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto rounded-xl px-8 py-6 text-lg tracking-wide shrink-0 font-semibold shadow-md">
                Find Jobs
            </Button>
        </form>
    );
}
