export default function VehicleListsSkeleton() {
  return (
    <div className='space-y-4'>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className='h-[250px] sm:h-[350px] md:h-[550px] bg-gray-200 animate-pulse'
        />
      ))}
    </div>
  );
}
