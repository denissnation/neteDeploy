"use server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { decrypt, encrypt } from "@/lib/crypto";
import { createClient } from "./supabase/server";
// import { pool } from "@/lib/db";

export async function checkAuthStatus() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // 1. Try access token first
  if (accessToken) {
    try {
      const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
      return { isAuthenticated: true, user };
    } catch {
      // Token expired, continue to refresh
    }
  }

  // 2. Try refresh token
  if (refreshToken) {
    try {
      return { isAuthenticated: true, user: { name: "name" } };
    } catch (error) {
      console.error("Refresh token failed:", error);
    }
  }

  return { isAuthenticated: false, user: null };
}

export async function refreshTokensAction(oldRefreshToken: string) {
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
      { expiresIn: "15m" }
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
      maxAge: 60 * 15, // 15 minutes
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

// Server action to validate request
export async function validateRequestAction() {
  try {
    const cookieStore = await cookies();
    const encryptedAccessToken = cookieStore.get("accessToken")?.value;
    const accessToken = encryptedAccessToken
      ? decrypt(encryptedAccessToken)
      : null;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    // 1. Verify access token
    if (accessToken) {
      try {
        const user = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET!
        ) as {
          userId: string;
          email: string;
          role: string;
        };
        return { user };
      } catch {
        // Token expired, continue to refresh
      }
    }

    // 2. Try refresh token
    if (refreshToken) {
      const result = await refreshTokensAction(refreshToken);
      if (result.success && result.accessToken) {
        const user = jwt.verify(
          result.accessToken,
          process.env.ACCESS_TOKEN_SECRET!
        ) as {
          userId: string;
          email: string;
          role: string;
        };
        return { user };
      }
    }

    return { user: null };
  } catch (error) {
    console.error("Auth validation failed:", error);
    return { user: null };
  }
}
