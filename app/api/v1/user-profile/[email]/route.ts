import { userStore } from '@/app/lib';
import { NextResponse } from 'next/server';

type RouteContext = {
    params: Promise<{ email: string }>;
};

export async function GET( request: Request, { params }: RouteContext) {
    try {
        const { email } = await params;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required.' },
                { status: 400 }
            );
        }

        const user = await userStore.getUserByEmail(email);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user,
        });

    } catch (error) {
        console.error('Error fetching user profile', error);

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}