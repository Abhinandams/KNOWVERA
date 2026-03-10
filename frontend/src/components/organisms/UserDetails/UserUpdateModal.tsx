import { useEffect, useState } from "react";
import Button from "../../atoms/Button/Button";
import Input from "../../atoms/Input/Input";

export type EditableMember = {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  status: "Active" | "Blocked";
  address: string;
  role: string;
  password?: string;
};

type Props = {
  isOpen: boolean;
  member: EditableMember | null;
  onClose: () => void;
  onSave: (updatedMember: EditableMember) => void;
};

const UserUpdateModal = ({ isOpen, member, onClose, onSave }: Props) => {
  const [form, setForm] = useState<EditableMember | null>(member);

  useEffect(() => {
    setForm(member);
  }, [member, isOpen]);

  if (!isOpen || !form) return null;

  const handleChange = <K extends keyof EditableMember>(key: K, value: EditableMember[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = () => {
    if (!form) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-update-modal-title"
    >
      <div className="mx-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6 md:max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 id="user-update-modal-title" className="text-xl font-semibold text-gray-900">
            Edit Member
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="First Name" value={form.fname} onChange={(e) => handleChange("fname", e.target.value)} />
          <Input label="Last Name" value={form.lname} onChange={(e) => handleChange("lname", e.target.value)} />
          <Input label="Email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} />
          <Input label="Phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          <Input label="Role" value={form.role} onChange={(e) => handleChange("role", e.target.value)} />
          <Input label="New Password (optional)" type="password" value={form.password ?? ""} onChange={(e) => handleChange("password", e.target.value)} />
          <label className="block text-sm text-gray-600">
            Status
            <select
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value as EditableMember["status"])}
            >
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block text-sm text-gray-600">
          Address
          <textarea
            className="mt-1 h-24 w-full rounded border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </label>

        <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserUpdateModal;
