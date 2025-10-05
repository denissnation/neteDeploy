// "use client";

import DeleteButton from "./DeleteButton";

export default function Vehicle(vehicle: Vehicle) {

  return (
    <article
      className='my-4 flex justify-evenly items-center'
    >
      <label className='text-2xl hover:underline'>
        <h3>
          {vehicle.vehicle_id}. {vehicle.vehicle_name}
        </h3>
      </label>
      <DeleteButton id={vehicle.vehicle_id} />
    </article>
  );
}
