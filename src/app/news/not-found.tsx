// app/news/[slug]/not-found.tsx
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News Article Not Found | GWM Motor",
  description:
    "The news article you are looking for does not exist or may have been removed.",
};

export default function NewsNotFound() {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12'>
      <div className='max-w-md w-full text-center'>
        {/* Icon */}
        <div className='mb-6'>
          <svg
            className='mx-auto h-16 w-16 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M9 3v4m0 6v6'
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Article Not Found
        </h1>

        {/* Message */}
        <p className='text-gray-600 mb-6'>
          The news article youre looking for might have been removed, had its
          name changed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className='flex flex-col gap-4 mb-8'>
          <Link
            href='/news'
            className='px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors text-center'
          >
            View All News Articles
          </Link>

          <Link
            href='/vehicles'
            className='px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors text-center'
          >
            Browse Our Vehicles
          </Link>
        </div>

        {/* Search Suggestion */}
        {/* <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h3 className='font-medium text-blue-800 mb-2'>
            Looking for something specific?
          </h3>
          <p className='text-blue-700 text-sm'>
            Use the search feature to find news articles, vehicle information,
            or promotions.
          </p>
        </div> */}
      </div>
    </div>
  );
}
