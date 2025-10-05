// app/vehicles/[id]/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center'>
        <div className='text-gray-500 mb-4'>
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
              d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-gray-800 mb-2'>
          Vehicle Not Found
        </h1>

        <p className='text-gray-600 mb-6'>
          The vehicle youre looking for doesnt exist or may have been removed.
        </p>

        <div className='flex justify-center'>
          <Link
            href='/home'
            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Back To Home
          </Link>
        </div>
      </div>
    </div>
  );
}
