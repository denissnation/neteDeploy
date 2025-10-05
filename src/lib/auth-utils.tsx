"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { decrypt, encrypt } from "./crypto";
import { createClient } from "./supabase/server";

// Generate both tokens
// Token generation
export interface User {
  userId: string;
  email: string;
  role: string;
}
export async function generateTokens(user: {
  userId: string;
  email: string;
  role: string;
}) {
  console.log(user);
  const accessToken = jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "1d" } // Short-lived
  );

  const refreshToken = jwt.sign(
    { userId: user.userId },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" } // Long-lived
  );

  return { accessToken, refreshToken };
}
// Verify access token
export async function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export async function validateRequest(
  allowExpired = false
): Promise<{ user: User | null }> {
  try {
    const cookieStore = await cookies();
    const encryptedAccessToken = cookieStore.get("accessToken")?.value;
    const accessToken = encryptedAccessToken
      ? decrypt(encryptedAccessToken)
      : null;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // 1. Check access token first
    let user;
    if (accessToken) {
      user = await verifyAccessToken(accessToken);
      return { user };
    }

    // 2. If access token expired, try refresh
    if (!user && refreshToken) {
      if (allowExpired) {
        // For login page, don't refresh - just return null
        return { user: null };
      }
    } else if (refreshToken) {
      const newTokens = await refreshTokens(refreshToken);
      if (newTokens?.accessToken) {
        const user = await verifyAccessToken(newTokens.accessToken);
        return { user };
      }
    }

    return { user: null };
  } catch (error) {
    console.error("Auth validation error:", error);
    return { user: null };
  }
}

export async function hasActiveSession() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) return false;

    const user = verifyAccessToken(accessToken);
    return !!user; // Return true only if token is valid and not expired
  } catch {
    return false;
  }
}

// Refresh token flow
async function refreshTokens(oldRefreshToken: string) {
  try {
    // 1. Verify against database
    const supabase = await createClient();
    const { data: userData, error } = await supabase
      .from("tb_user")
      .select("id, user_email, user_role")
      .eq("refresh_token", oldRefreshToken)
      .single();

    if (error || !userData) {
      return { success: false, error: "Invalid refresh token" };
    }

    // 2. Generate new tokens
    const accessToken = jwt.sign(
      {
        userId: userData.id,
        email: userData.user_email,
        role: userData.user_role,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { userId: userData.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    // 3. Update database
    const { error: updateError } = await supabase
      .from("tb_user")
      .update({ refresh_token: refreshToken })
      .eq("refresh_token", oldRefreshToken);

    if (updateError) {
      return { success: false, error: "Failed to update token" };
    }

    // 4. Set cookies (allowed in Server Action)
    const cookieStore = await cookies();
    cookieStore.set("accessToken", encrypt(accessToken), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 15, // 15 minutes
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, accessToken };
  } catch (error) {
    console.error("Token refresh failed:", error);
    return { success: false, error: "Token refresh failed" };
  }
}
