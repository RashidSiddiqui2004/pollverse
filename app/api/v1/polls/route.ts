import { NextResponse } from 'next/server';
import { pollStore } from '@/app/lib/poll-store';
import { userStore } from '@/app/lib/user-store';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '6', 10);

        const data = await pollStore.getPolls(page, limit);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching polls:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, question, mediaUrl, groupId } = body;

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ success: false, error: 'userId is required.' }, { status: 400 });
        }
        if (!question || typeof question !== 'string' || !question.trim()) {
            return NextResponse.json({ success: false, error: 'question is required.' }, { status: 400 });
        }

        const userExists = await userStore.getUserById(userId);
        if (!userExists) {
            return NextResponse.json({ success: false, error: 'User does not exist.' }, { status: 404 });
        }

        const poll = await pollStore.createPoll(
            userId,
            question.trim(),
            mediaUrl || null,
            groupId || null
        );

        return NextResponse.json({ success: true, data: poll }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating poll:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
