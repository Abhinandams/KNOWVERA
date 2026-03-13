import Button from "../../atoms/Button/Button";

type Props = {
  children: React.ReactNode;
  submitLabel: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  uploadSection?: React.ReactNode;
  showUpload?: boolean;
};

const Form= ({ children, submitLabel, onSubmit, onCancel, uploadSection, showUpload = true }: Props) => {
  return (
    <div className={showUpload ? "grid grid-cols-3 gap-6" : ""}>
      {showUpload && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl h-96 flex items-center justify-center">
          {uploadSection ?? "Upload Image"}
        </div>
      )}

      <div className={`${showUpload ? "col-span-2" : ""} grid grid-cols-2 gap-4`}>
        {children}

        <div className="col-span-2 flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={onSubmit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Form;
