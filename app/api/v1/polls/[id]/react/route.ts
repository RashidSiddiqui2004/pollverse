import { NextResponse } from 'next/server';
import { pollStore } from '@/app/lib';
type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id: pollId } = await params;
        const { reaction } = await request.json();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const hasReacted = await pollStore.reactToPoll(userId, pollId, reaction);
        if (hasReacted) {
            return NextResponse.json({ success: true, data: hasReacted }, { status: 200 });
        }
        else {
            return NextResponse.json({ success: false }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, data: {} }, { status: 500 });
    }
};

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id: pollId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId || !pollId) {
            return NextResponse.json({ success: false, message: "User or Poll not found" });
        }

        const existingReaction = await pollStore.getUserReactionOnPoll(userId, pollId);
        return NextResponse.json({ success: true, data: existingReaction }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, data: {} }, { status: 500 });
    }
}