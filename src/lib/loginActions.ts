"use server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { encrypt } from "./crypto";
import { createClient } from "./supabase/server";

type LoginResponse = {
  success?: boolean;
  accessToken?: string;
  user?: {
    userId: number;
    email: string;
    role: string;
  };
  error?: string;
};
export async function loginAction(formData: FormData): Promise<LoginResponse> {
  try {
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI1LCJpYXQiOjE3NTcyMzcwOTAsImV4cCI6MTc1Nzg0MTg5MH0.IDGg38rId4dFDuVzQoBohHGpVyLTXxAPmWlkYmshsoY
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();
    const { data: userData } = await supabase
      .from("tb_user")
      .select("id, user_email, user_password, user_role")
      .eq("user_email", email);

    let user;
    if (userData) {
      user = userData[0];
    }
    if (!user) {
      return { error: "Invalid credentials" };
    }
    console.log(user);
    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.user_password);
    if (!isPasswordValid) {
      return { error: "Invalid credentials" };
    }

    // 3. Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.user_email, role: user.user_role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    // 5. Set HTTP-only cookie

    const cookieStore = await cookies();
    cookieStore.set("accessToken", encrypt(accessToken), {
      httpOnly: false, // Allow server component reading
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 15, // 15 minutes
    });
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true, // Critical security
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // 4. Store refresh token in database

    await supabase
      .from("tb_user")
      .update({
        refresh_token: refreshToken,
      })
      .eq("id", user.id);

    return {
      success: true,
      accessToken,
      user: {
        userId: user.id,
        email: user.user_email,
        role: user.user_role,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Internal server error" };
  }
}

type SignupData = {
  name: string;
  email: string;
  password: string;
};

type SignupResponse = {
  success?: boolean;
  error?: string;
  userId?: number;
  accessToken?: string;
};

export async function signupAction(
  formData: SignupData
): Promise<SignupResponse> {
  try {
    const { name, email, password } = formData;

    // Check if user already exists
    const supabase = await createClient();
    const { data: existingUsers } = await supabase
      .from("tb_user")
      .select("id")
      .eq("user_email", email);

    if (existingUsers && existingUsers.length > 0) {
      return { error: "Email already in use" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data } = await supabase
      .from("tb_user")
      .insert({
        user_name: name,
        user_email: email,
        user_password: hashedPassword,
        user_role: "user",
      })
      .select("id");

    // const userId = result.insertId;
    let userId;
    if (data) {
      userId = data[0].id;
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId, email, role: "user" },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    // Store refresh token in database

    await supabase
      .from("tb_user")
      .update({
        refresh_token: refreshToken,
      })
      .eq("id", userId);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      userId,
      accessToken, // Now we're returning the access token
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const deleteRefresh = "";

  // 1. Revoke refresh token
  if (refreshToken) {
    const supabase = await createClient();
    await supabase
      .from("tb_user")
      .update({
        refresh_token: deleteRefresh,
      })
      .eq("refresh_token", refreshToken);
  }

  // 2. Clear cookies
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return { successLogout: true };
}
