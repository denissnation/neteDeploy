// app/vehicles/[id]/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Vehicle Page Error:", error);
  }, [error]);

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center'>
        <div className='text-red-500 mb-6'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-16 w-16 mx-auto'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-gray-800 mb-2'>
          {error.message === "Unauthorized"
            ? "Access Denied"
            : "Something Went Wrong"}
        </h1>

        <p className='text-gray-600 mb-6'>
          {error.message === "Unauthorized"
            ? "You need admin privileges to view this vehicle."
            : "We encountered an error while loading this vehicle."}
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          {error.message === "Unauthorized" ? (
            <Link
              href='/auth/login'
              className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              Go to Login
            </Link>
          ) : (
            <button
              onClick={reset}
              className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              Try Again
            </button>
          )}

          <Link
            href='/home'
            className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
          >
            Back To Home
          </Link>
        </div>
      </div>
    </div>
  );
}
