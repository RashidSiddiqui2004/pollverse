import { NextResponse } from 'next/server';
import { userStore } from '@/app/lib/user-store';

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const user = await userStore.getUserById(id);

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const allowedUpdates = ['name', 'header', 'bio', 'isPublic'];
        const updates: any = {};

        for (const key of allowedUpdates) {
            if (body[key] !== undefined) {
                updates[key] = body[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { success: false, error: 'No valid update fields provided.' },
                { status: 400 }
            );
        }

        const user = await userStore.updateUser(id, updates);
        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
