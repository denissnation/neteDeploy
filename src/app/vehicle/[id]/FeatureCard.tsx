// app/vehicle/[id]/components/FeatureCard.tsx
"use client";

interface Feature {
  feature_id: number;
  feature_name: string;
  feature_img: string;
}

export default function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div
      className='bg-white p-6 shadow-sm text-center h-[270px] md:h-[350px] flex items-center justify-center bg-cover bg-center bg-no-repeat'
      style={{
        backgroundImage: `url('/uploads/features/${feature.feature_img}')`,
      }}
    >
      <div className='text-xl font-medium text-white'>
        {feature.feature_name}
      </div>
    </div>
  );
}
