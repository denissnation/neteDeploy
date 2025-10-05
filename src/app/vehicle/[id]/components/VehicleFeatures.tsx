// app/vehicle/[id]/components/VehicleFeatures.tsx
import { Suspense } from "react";
import FeatureSkeleton from "./FeatureSkeleton";
import FeatureCard from "./FeatureCard";

interface Feature {
  feature_id: number;
  feature_name: string;
  feature_img: string;
}

export default function VehicleFeatures({
  features,
}: {
  features: Feature[] | null;
}) {
  if (!features) {
    return <div>No Feature Found</div>;
  }
  return (
    <div className="pt-16 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-12">HIGHLIGHT</h2>
      <Suspense fallback={<FeatureSkeleton />}>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.feature_id} feature={feature} />
          ))}
        </div>
      </Suspense>
    </div>
  );
}
