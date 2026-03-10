import React from "react";

type LegacyProps = { placeholder: string };

type Props =
  | (React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string | null })
  | LegacyProps;

const TextArea: React.FC<Props> = (props) => {
  const { placeholder, ...rest } = props as React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string | null;
  };

  const label = (props as { label?: string }).label;
  const error = (props as { error?: string | null }).error;

  const base =
    "h-28 w-full rounded border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <label className="block">
      {label && <div className="mb-1 text-sm text-gray-600">{label}</div>}
      <textarea placeholder={placeholder} className={base} {...rest} />
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </label>
  );
};

export default TextArea;
