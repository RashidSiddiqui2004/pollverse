import { userStore } from '@/app/lib';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username || typeof username !== 'string' || !username.trim()) {
            return NextResponse.json({ success: false, error: 'Username query parameter is required.' }, { status: 400 });
        }

        const isUsernameTaken = await userStore.checkIfExistsByUsername(username);
        return NextResponse.json({ success: true, isUnique: !isUsernameTaken });

    } catch (error) {
        console.error("Error checking username uniqueness", error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
};