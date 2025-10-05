"use client";

import { useFormState } from "react-dom";
import { deleteVehicle } from "@/lib/vehicleActions";

export default function DeleteButton({ id }: { id: number }) {
  interface State {
    success: boolean;
    error: string | null;
    message: string;
  }
  const initialState: State = {
    success: false,
    error: null,
    message: "",
  };
  const [state, formAction] = useFormState<State, FormData>(
    deleteVehicle,
    initialState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit">Delete</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
