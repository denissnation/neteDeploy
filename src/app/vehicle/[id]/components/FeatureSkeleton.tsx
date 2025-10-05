// app/vehicle/[id]/components/FeaturesSkeleton.tsx
export default function FeaturesSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className='bg-gray-200 h-[270px] md:h-[350px] animate-pulse rounded'
        />
      ))}
    </div>
  );
}
