export default function QuoteBanner() {
  return (
    <div
      className='relative h-[250px] sm:h-[350px] flex items-center justify-center bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url('/features/punchline.png')` }}
    >
      <div className='absolute z-10 px-20 sm:px-30 md:px-38 lg:px-60 xl:px-64'>
        <p className='text-3xl sm:text-5xl md:text-6xl xl:text-7xl text-center text-white py-3 font-semibold'>
          Focus Dedication Specialization
        </p>
      </div>
    </div>
  );
}
