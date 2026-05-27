import { userGroupStore } from '@/app/lib/group-store';
import { userStore } from '@/app/lib/user-store';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, groupName, description, isPublic } = body;

        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ success: false, error: 'userId is required.' }, { status: 400 });
        }
        if (!groupName || typeof groupName !== 'string' || !groupName.trim()) {
            return NextResponse.json({ success: false, error: 'groupName is required.' }, { status: 400 });
        }

        const userExists = await userStore.getUserById(userId);
        if (!userExists) {
            return NextResponse.json({ success: false, error: 'User does not exist.' }, { status: 404 });
        }

        const userGroup = await userGroupStore.createUserGroup({
            groupName,
            description,
            adminId: userId,
            isPublic,
        });

        return NextResponse.json({ success: true, data: userGroup }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating user group:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}