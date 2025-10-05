import React from "react";

interface FeatureCardProps {
  imageUrl: string;
  title: string;
}

export default function FeatureCard({ imageUrl, title }: FeatureCardProps) {
  return (
    <div
      className='bg-white p-6 shadow-sm text-center h-[270px] md:h-[350px] flex items-center justify-center bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url('${imageUrl}')` }}
    >
      <div className='text-xl font-medium text-white'>{title}</div>
    </div>
  );
}
