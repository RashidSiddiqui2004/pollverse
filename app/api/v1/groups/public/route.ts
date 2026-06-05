import { userGroupStore } from '@/app/lib';
import { NextResponse } from 'next/server';

// Fetch all the public user groups
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '6', 10);

        const data = await userGroupStore.getPublicUserGroups(page, limit);
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching public user groups:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
