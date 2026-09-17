"use client";

import { useActionState } from "react";
import { createListAction, type CreateListState } from "@/app/lists/actions";

export function NewListForm() {
  const [state, formAction] = useActionState(createListAction, {});
  return <NewListFormView state={state} action={formAction} />;
}

/**
 * The New list form, with the action state as a prop so it can be rendered
 * and tested without a server action. Keyed on `state.nonce` so a successful
 * create remounts it with an empty input.
 */
export function NewListFormView({
  state,
  action,
}: {
  state: CreateListState;
  action: (formData: FormData) => void;
}) {
  return (
    <form
      key={state.nonce ?? "initial"}
      action={action}
      aria-label="New list"
      className="mt-4 flex flex-col gap-1"
    >
      <label htmlFor="new-list-name" className="text-sm font-medium">
        List name
      </label>
      <input
        id="new-list-name"
        name="name"
        type="text"
        defaultValue={state.value ?? ""}
        className="rounded border border-zinc-300 px-2 py-1"
      />
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <div>
        <button
          type="submit"
          className="rounded border border-zinc-300 bg-white px-3 py-1 text-sm"
        >
          Create list
        </button>
      </div>
    </form>
  );
}
