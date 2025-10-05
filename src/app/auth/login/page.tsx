import { hasActiveSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import LoginForm from "./loginForm";

export default async function LoginPage() {
  // const { user } = await validateRequest(true);
  const hasSession = await hasActiveSession();

  // Redirect if already authenticated
  // if (user) {
  //   const redirectPath = user.role === "admin" ? "/admin/cars" : "/";
  //   redirect(redirectPath);
  // }
  if (hasSession) {
    redirect("/"); // Redirect if user has valid access token
  }

  return <LoginForm />;
}
