"use client";

import { useParams } from "next/navigation";

export default function GroupPage(){
    const groupId = useParams().id;

    return (
        <div className="mx-3 my-2">
            Group page for group id: {groupId}
        </div>
    );
}