import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/atoms/Badge/Badge";
import Button from "../components/atoms/Button/Button";
import ProfileInfoCard from "../components/molecules/Cards/ProfileInfoCard/ProfileInfoCard";
import UserUpdateModal, { type EditableMember } from "../components/organisms/UserDetails/UserUpdateModal";
import ActionModal from "../components/organisms/ActionModal/ActionModal";
import type { ActionModalType } from "../components/organisms/ActionModal/ActionModal";
import { deleteAdminUser, getAdminUserById, resolveUserProfileImage, updateAdminUser, type UserResponse } from "../api/userApi";
import { extractApiErrorMessage } from "../utils/apiError";
import { logAdminActivity } from "../utils/adminActivity";
import ErrorModal from "../components/organisms/ErrorModal/ErrorModal";
import { getAuthItem } from "../utils/authStorage";

const toEditableMember = (user: UserResponse): EditableMember => ({
  id: String(user.userId),
  fname: user.fname ?? "",
  lname: user.lname ?? "",
  email: user.email ?? "",
  phone: user.phone ?? "",
  role: user.role ?? "user",
  status: String(user.status ?? "active").toLowerCase() === "blocked" ? "Blocked" : "Active",
  address: user.address ?? "",
  password: "",
});

const UserDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const loggedInUserId = Number(getAuthItem("userId") ?? 0);
  const isSelf = Number(id ?? 0) === loggedInUserId;
  const [member, setMember] = useState<EditableMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState("https://i.pravatar.cc/160");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionModalType, setActionModalType] = useState<ActionModalType | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getAdminUserById(id);
        setMember(toEditableMember(data));
        setProfilePhoto(resolveUserProfileImage(data.profileImage));
      } catch (err) {
        setLoadError(extractApiErrorMessage(err, "Failed to load member."));
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  if (loading) return <p className="text-sm text-gray-500">Loading member...</p>;
  if (loadError) return <p className="text-sm text-red-600">{loadError}</p>;

  if (!member) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Member not found</h2>
          <p className="mt-2 text-sm text-gray-500">No member exists for ID: {id}</p>
          <Button type="button" className="mt-4" onClick={() => navigate("/admin/users")}>
            Back to Members
          </Button>
        </div>
      </div>
    );
  }

  const memberName = `${member.fname} ${member.lname}`.trim();

  const profileInfo = [
    { label: "Email", value: member.email },
    { label: "Phone", value: member.phone },
    { label: "Role", value: member.role },
    { label: "Status", value: member.status },
    { label: "Address", value: member.address },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="text-sm text-gray-500 hover:text-emerald-700"
          >
            Members
          </button>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-sm font-medium text-gray-700">{memberName}</span>
        </div>
        <Badge
          text={member.status}
          variant={member.status === "Blocked" ? "danger" : "success"}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={profilePhoto}
            alt={memberName}
            className="h-40 w-40 rounded-full border border-gray-200 object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{memberName}</h2>
            <p className="mt-1 text-sm text-gray-500">Member ID: {member.id}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {profileInfo.map((item) => (
            <ProfileInfoCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate("/admin/users")}>
          Back
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={isSelf}
          className={isSelf ? "opacity-60 cursor-not-allowed" : ""}
          onClick={async () => {
            if (!id) return;
            if (isSelf) return;
            try {
              await deleteAdminUser(id);
              logAdminActivity({
                title: memberName,
                subtitle: "User deleted by Admin",
              });
              navigate("/admin/users");
            } catch (err) {
              setActionError(extractApiErrorMessage(err, "Failed to delete member."));
            }
          }}
        >
          Delete Member
        </Button>
        <Button type="button" variant="primary" onClick={() => setIsEditModalOpen(true)}>
          Edit Member
        </Button>
      </div>
      <UserUpdateModal
        isOpen={isEditModalOpen}
        member={member}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (updatedMember) => {
          if (!id) return;
          try {
            const payload = {
              fname: updatedMember.fname,
              lname: updatedMember.lname,
              email: updatedMember.email,
              phone: updatedMember.phone,
              address: updatedMember.address,
              role: updatedMember.role,
              status: updatedMember.status.toLowerCase(),
              password: updatedMember.password?.trim() ? updatedMember.password : undefined,
            };
            const saved = await updateAdminUser(id, payload);
            setMember(toEditableMember(saved));
            setIsEditModalOpen(false);
            setActionModalType("user_updated");
          } catch (err) {
            setActionError(extractApiErrorMessage(err, "Failed to update member."));
          }
        }}
      />
      <ActionModal
        isOpen={actionModalType !== null}
        type={actionModalType}
        onClose={() => setActionModalType(null)}
      />
      <ErrorModal
        isOpen={actionError !== null}
        message={actionError}
        onClose={() => setActionError(null)}
      />
    </div>
  );
};

export default UserDetailsPage;
