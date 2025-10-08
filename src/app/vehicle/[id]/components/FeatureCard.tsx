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
      className=" relative text-center h-[270px] md:h-[350px] flex items-center justify-center bg-cover bg-center bg-no-repeat w-full"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),url('${feature.feature_img}')`,
      }}
    >
      {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
      <div className="text-xl font-medium text-white ">
        {feature.feature_name}
      </div>
    </div>
  );
}
