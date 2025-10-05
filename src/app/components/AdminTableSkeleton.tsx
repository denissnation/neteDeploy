import React from "react";
export default function AdminTableSkeleton() {
  return (
    <div className='bg-white shadow overflow-hidden sm:rounded-lg'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              {[...Array(7)].map((_, i) => (
                <th
                  key={i}
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                >
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {[...Array(7)].map((_, cellIndex) => (
                  <td key={cellIndex} className='px-6 py-4 whitespace-nowrap'>
                    <div className='h-4 bg-gray-100 rounded w-full animate-pulse'></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
        <div className='flex-1 flex justify-between sm:hidden'>
          <div className='h-8 bg-gray-200 rounded w-20'></div>
          <div className='h-8 bg-gray-200 rounded w-20 ml-3'></div>
        </div>
        <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
          <div>
            <div className='h-4 bg-gray-200 rounded w-40'></div>
          </div>
          <div>
            <div className='h-8 bg-gray-200 rounded w-64'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
