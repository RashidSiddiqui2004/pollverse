import { NextResponse } from 'next/server';
import { pollStore } from '@/app/lib/poll-store';

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id: pollId } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json(
                { success: false, error: 'userId query parameter is required to view this poll.' },
                { status: 400 }
            );
        }

        const poll = await pollStore.getPollById(userId, pollId);
        return NextResponse.json({ success: true, data: poll });
    } catch (error: any) {
        console.error('Error fetching poll:', error);

        if (error.message === 'You are not authorized to view this poll') {
            return NextResponse.json({ success: false, error: error.message }, { status: 403 });
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

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id: pollId } = await params;
        const { searchParams } = new URL(request.url);
        let userId = searchParams.get('userId');

        if (!userId) {
            try {
                const body = await request.json();
                userId = body.userId;
            } catch (e) {
                // Body might not exist or not be JSON, ignore and rely on validation below
            }
        }

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json(
                { success: false, error: 'userId is required (via query param or JSON body) to delete this poll.' },
                { status: 400 }
            );
        }

        await pollStore.deletePoll(userId, pollId);
        return NextResponse.json({ success: true, message: 'Poll deleted successfully.' });
    } catch (error: any) {
        console.error('Error deleting poll:', error);

        if (error.message === 'You are not authorized to delete this poll') {
            return NextResponse.json({ success: false, error: error.message }, { status: 403 });
        }
        if (error.message === 'Poll not found') {
            return NextResponse.json({ success: false, error: error.message }, { status: 404 });
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
