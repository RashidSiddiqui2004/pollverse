import { NextResponse } from 'next/server';
import { pollStore } from '@/app/lib/poll-store';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text, mediaUrl, pollId, userId } = body;

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ success: false, error: 'userId is required.' }, { status: 400 });
        }
        if (!pollId || typeof pollId !== 'string') {
            return NextResponse.json({ success: false, error: 'pollId is required.' }, { status: 400 });
        }
        if (!text || typeof text !== 'string' || !text.trim()) {
            return NextResponse.json({ success: false, error: 'text is required.' }, { status: 400 });
        }

        const pollExists = await pollStore.getPollById(userId, pollId);
        if (!pollExists) {
            return NextResponse.json({ success: false, error: 'Poll does not exist.' }, { status: 404 });
        }

        if (pollExists.userId !== userId) {
            return NextResponse.json({ success: false, error: 'Only the creator of the poll can add options.' }, { status: 403 });
        }

        const pollOption = await pollStore.createPollOption(
            pollId,
            text.trim(),
            mediaUrl || null,
        );

        return NextResponse.json({ success: true, data: pollOption }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating poll option:', error);

        if (error.message === 'You are not authorized to view this poll') {
            return NextResponse.json({ success: false, error: 'You are not authorized to access this poll' }, { status: 403 });
        }
        if (error.message === 'Poll not found') {
            return NextResponse.json({ success: false, error: 'Poll not found.' }, { status: 404 });
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
