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

  const isOddCount = features.length % 2 !== 0;
  const lastFeatureIndex = features.length - 1;

  // Special case: single feature gets special treatment
  if (features.length === 1) {
    return (
      <div className="pt-16 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-12">HIGHLIGHT</h2>
        <Suspense fallback={<FeatureSkeleton />}>
          <div className="flex justify-center">
            <div className="w-full sm:w-1/2">
              <FeatureCard feature={features[0]} />
            </div>
          </div>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-12 ">HIGHLIGHT</h2>
      <Suspense fallback={<FeatureSkeleton />}>
        <div className="bg-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-0">
          {features.map((feature, index) => (
            <div
              key={feature.feature_id}
              className={`
                ${
                  isOddCount && index === lastFeatureIndex
                    ? "sm:col-span-2 flex justify-center"
                    : ""
                }
              `}
            >
              <div
                className={`
                ${
                  isOddCount && index === lastFeatureIndex
                    ? "w-full sm:w-1/2"
                    : "w-full"
                }
              `}
              >
                <FeatureCard feature={feature} />
              </div>
            </div>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
