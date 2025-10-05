// import { redirect } from "next/navigation";
"use client";
import {
  useEffect,
  // useState
} from "react";
import { useRouter, usePathname } from "next/navigation";

// app/admin/cars/layout.tsx
export default function CarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth-check");

        if (!response.ok) {
          // Not authenticated, redirect to login
          router.push(
            `/auth/login?message=unauthorized&redirect=${encodeURIComponent(
              pathname
            )}`
          );
          return;
        }

        const { user } = await response.json();

        // Optional: Check if user has user role
        if (user.role !== "user") {
          router.push(
            `/auth/login?message=insufficient_permissions&redirect=${encodeURIComponent(
              pathname
            )}`
          );
          return;
        }

        // setIsLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push(
          `/auth/login?message=auth_error&redirect=${encodeURIComponent(
            pathname
          )}`
        );
      }
    };

    checkAuth();
  }, [router, pathname]);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Checking authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }
  return <>{children}</>;
}
