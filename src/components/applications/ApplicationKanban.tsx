"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Application {
    status: string;
    created_at: string;
    jobs: {
        id: string;
        title: string;
        company: string;
        applies_link?: string;
    };
}

interface ApplicationKanbanProps {
    initialApplications: Application[];
}

const KANBAN_COLUMNS = [
    { id: "saved", title: "Saved", color: "border-slate-200 bg-slate-50/50" },
    { id: "in_progress", title: "In Progress", color: "border-blue-200 bg-blue-50/50" },
    { id: "applied", title: "Applied", color: "border-yellow-200 bg-yellow-50/50" },
    { id: "interview", title: "Interviewing", color: "border-purple-200 bg-purple-50/50" },
    { id: "offer", title: "Offer", color: "border-emerald-200 bg-emerald-50/50" },
    { id: "rejected", title: "Rejected", color: "border-red-200 bg-red-50/50" },
];

export function ApplicationKanban({ initialApplications }: ApplicationKanbanProps) {
    const [applications, setApplications] = useState<Application[]>(initialApplications);

    // Group applications by status
    const groupedApps = KANBAN_COLUMNS.reduce((acc, col) => {
        acc[col.id] = applications.filter((app) => app.status === col.id);
        return acc;
    }, {} as Record<string, Application[]>);

    return (
        <div className="flex-1 w-full overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max h-full items-stretch">
                {KANBAN_COLUMNS.map((column) => (
                    <div key={column.id} className="w-80 flex flex-col gap-4">
                        <div className={`rounded-xl border ${column.color} p-4 pb-2 shadow-sm flex flex-col h-full bg-white`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-700">{column.title}</h3>
                                <Badge variant="secondary" className="bg-white/60">
                                    {groupedApps[column.id]?.length || 0}
                                </Badge>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 min-h-[500px]">
                                {groupedApps[column.id]?.length === 0 ? (
                                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-muted-foreground italic bg-slate-50/50">
                                        No applications
                                    </div>
                                ) : (
                                    groupedApps[column.id]?.map((app, idx) => (
                                        <Card key={`${app.jobs.id}-${idx}`} className="cursor-grab hover:border-brand/40 shadow-sm active:cursor-grabbing transition-colors">
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-base line-clamp-2 leading-tight">
                                                    {app.jobs.title}
                                                </CardTitle>
                                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                    <Building2 className="w-3.5 h-3.5 mr-1" />
                                                    <span className="truncate">{app.jobs.company}</span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {new Date(app.created_at).toLocaleDateString()}
                                                    </span>
                                                    {app.jobs.applies_link && (
                                                        <Link href={app.jobs.applies_link} target="_blank" prefetch={false} className="text-brand hover:text-brand/80 transition-colors">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
