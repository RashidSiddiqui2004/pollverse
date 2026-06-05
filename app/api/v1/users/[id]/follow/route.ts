import { userStore } from '@/app/lib';
import { NextResponse } from 'next/server';

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { id: followingId } = await params;
        const body = await request.json();
        const { followerId, action } = body;

        if (!followerId || typeof followerId !== 'string') {
            return NextResponse.json({ success: false, error: 'followerId is required.' }, { status: 400 });
        }

        if (action !== 'follow' && action !== 'unfollow') {
            return NextResponse.json({ success: false, error: 'Valid action ("follow" or "unfollow") is required.' }, { status: 400 });
        }

        if (followerId === followingId) {
            return NextResponse.json({ success: false, error: 'Users cannot follow themselves.' }, { status: 400 });
        }

        const [followerExists, followingExists] = await Promise.all([
            userStore.getUserById(followerId),
            userStore.getUserById(followingId)
        ]);

        if (!followerExists) {
            return NextResponse.json({ success: false, error: 'Follower user not found.' }, { status: 404 });
        }
        if (!followingExists) {
            return NextResponse.json({ success: false, error: 'User to follow/unfollow not found.' }, { status: 404 });
        }

        if (action === 'follow') {
            await userStore.followUser(followerId, followingId);
            return NextResponse.json({ success: true, message: 'Successfully followed user.' });
        } else {
            await userStore.unfollowUser(followerId, followingId);
            return NextResponse.json({ success: true, message: 'Successfully unfollowed user.' });
        }
    } catch (error: any) {
        console.error('Error in follow route:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
