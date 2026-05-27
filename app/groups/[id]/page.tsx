"use client";

import { useParams } from "next/navigation";
import { Users, Globe } from "lucide-react";

export default function GroupPage() {
    const groupId = useParams().id;

    return (
        <div className="flex flex-col gap-6 text-foreground">
            <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground border border-border">
                    <Users className="h-6 w-6 stroke-[1.8px]" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold tracking-tight">Group Space</h1>
                    <span className="text-xs text-muted-foreground mt-0.5">ID: {groupId}</span>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
                <Globe className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2 stroke-[1.5px]" />
                <p className="text-sm font-semibold">Welcome to Group {groupId}</p>
                <p className="text-xs mt-1">This group space is active. Share ideas and start polls inside this group.</p>
            </div>
        </div>
    );
}