import { NextResponse } from 'next/server';
import { pollStore } from '@/app/lib';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '6', 10);

        const data = await pollStore.getTrendingPolls(page, limit);
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching polls:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}