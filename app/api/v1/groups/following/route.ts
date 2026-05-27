import { userGroupStore } from '@/app/lib/group-store';
import { NextResponse } from 'next/server';

// Fetch all the user groups followed by the current user.
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, message: "User not found" },
                { status: 404 }
            );
        }
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '6', 10);

        const data = await userGroupStore.getUserGroupsForUser(userId, page, limit);
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error fetching user groups:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
