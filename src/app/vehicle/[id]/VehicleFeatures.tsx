// app/vehicle/[id]/VehicleFeatures.tsx
"use client";

import dynamic from "next/dynamic";

const FeatureCard = dynamic(() => import("./FeatureCard"), {
  loading: () => (
    <div className='bg-gray-200 h-[270px] md:h-[350px] animate-pulse'></div>
  ),
});

type feature = {
  feature_id: number;
  feature_name: string;
  feature_img: string;
};

export default function VehicleFeatures({ features }: { features: feature[] }) {
  return (
    <div className='pt-16 bg-gray-100'>
      <h2 className='text-3xl font-bold text-center mb-12'>INTERIOR</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2'>
        {features.map((feature) => (
          <FeatureCard key={feature.feature_id} feature={feature} />
        ))}
      </div>
    </div>
  );
}
