"use client";

/**
 * A checkbox that submits its enclosing form as soon as it changes, so a
 * click on it runs the form's server action without a separate button.
 */
export function TaskCheckbox({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      defaultChecked={checked}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className="mt-1 h-4 w-4"
    />
  );
}
