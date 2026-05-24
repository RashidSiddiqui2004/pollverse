// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// /**
//  * Get the full NextAuth session on the server side.
//  * Works in Server Components, API routes, and Server Actions.
//  *
//  * @example
//  * ```ts
//  * const session = await getAuthSession();
//  * if (!session) redirect("/login");
//  * ```
//  */
// export async function getAuthSession() {
//     return await getServerSession(authOptions);
// }

// /**
//  * Get just the current user's UUID, or null if not authenticated.
//  * Shorthand for common auth checks.
//  *
//  * @example
//  * ```ts
//  * const userId = await getCurrentUserId();
//  * if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//  * ```
//  */
// export async function getCurrentUserId(): Promise<string | null> {
//     const session = await getAuthSession();
//     return session?.user?.id ?? null;
// }
