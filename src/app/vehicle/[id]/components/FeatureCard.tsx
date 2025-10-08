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
      className="bg-white text-center h-[270px] md:h-[350px] flex items-center justify-center bg-cover bg-center bg-no-repeat w-full"
      style={{
        backgroundImage: `url('${feature.feature_img}')`,
      }}
    >
      <div className="text-xl font-medium text-white bg-black bg-opacity-40 px-4 py-2 rounded">
        {feature.feature_name}
      </div>
    </div>
  );
}
