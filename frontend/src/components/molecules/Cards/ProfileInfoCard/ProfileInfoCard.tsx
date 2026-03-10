type Props = {
  label: string;
  value: string | number;
};

const ProfileInfoCard = ({ label, value }: Props) => {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
};

export default ProfileInfoCard;
