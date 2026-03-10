import Badge from "../../atoms/Badge/Badge";

const UserRow = ({ user }: any) => {

  const isBlocked = user.status === "Blocked";

  return (
    <tr className="border-b text-sm">

      {/* Member */}
      <td className="px-4 py-3">
        <div className="font-medium">{user.name}</div>
        <div className="text-gray-400 text-xs">{user.id}</div>
      </td>

      {/* Contact */}
      <td className="px-4 py-3">
        <div>{user.email}</div>
        <div className="text-gray-400 text-xs">{user.phone}</div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge
          text={user.status}
          variant={isBlocked ? "danger" : "success"}
        />
      </td>

      {/* Books */}
      <td className="px-4 py-3">{user.books}</td>

      {/* Joined */}
      <td className="px-4 py-3">{user.joined}</td>

      {/* Actions */}
      <td className="px-4 py-3 text-purple-600 cursor-pointer">
        View
      </td>

    </tr>
  );
};

export default UserRow;