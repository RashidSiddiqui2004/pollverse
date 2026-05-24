import { NextResponse } from 'next/server';
import { pollStore } from '@/app/lib/poll-store';

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id: pollId } = await params;
        const { optionId } = await request.json();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not found" }, 
                { status: 404 }
            );
        }

        const hasVoted = await pollStore.votePollOption(userId, pollId, optionId);

        if(hasVoted){
            return NextResponse.json({ success: true, data: hasVoted }, { status: 200 });
        }
        else{
            return NextResponse.json({ success: false}, { status: 500 });
        }

    } catch (error) {
        return NextResponse.json({ success: false, data: {} }, { status: 500 });
    }
};

//This will be used to disable voting buttons on the frontend.
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id: pollId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId || !pollId) {
            return NextResponse.json({ success: false, message: "User or Poll not found" });
        }

        const hasVoted = await pollStore.checkIfUserVoted(userId, pollId);
        return NextResponse.json({ success: true, data: { hasVoted } });
    } catch (error) {
        return NextResponse.json({ success: false, data: {} });
    }
}