import { NextResponse } from 'next/server';
import { userStore } from '@/app/lib/user-store';

export async function POST(request: Request) {
    try {
        const { name, userName, email, header, bio, isPublic } = await request.json();

        if (!name || typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
        }
        if (!userName || typeof userName !== 'string' || !userName.trim()) {
            return NextResponse.json({ success: false, error: 'Username is required.' }, { status: 400 });
        }
        if (!email || typeof email !== 'string' || !email.trim() || !email.includes('@')) {
            return NextResponse.json({ success: false, error: 'A valid email is required.' }, { status: 400 });
        }

        // Check if the username is already taken.
        const isUsernameTaken = await userStore.checkIfExistsByUsername(userName);
        if (isUsernameTaken) {
            return NextResponse.json({ success: false, error: 'Username is already taken.' }, { status: 409 });
        }

        // Check if the email already exists in the database.
        const existingEmail = await userStore.checkIfExistsByEmail(email);
        if (existingEmail) {
            return NextResponse.json({ success: false, error: 'A user with this email already exists.' }, { status: 409 });
        }

        const user = await userStore.createUser({
            name,
            userName,
            email,
            header: header || '',
            bio: bio || '',
            isPublic: isPublic !== false,
        });

        return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
