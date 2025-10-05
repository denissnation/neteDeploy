// app/api/auth/check/route.ts
import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth-utils";

export async function GET() {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export const dynamic = "force-dynamic";
