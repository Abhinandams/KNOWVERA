import { useEffect, useMemo, useState } from "react";
import Input from "../components/atoms/Input/Input";
import Button from "../components/atoms/Button/Button";
import Pagination from "../components/organisms/Pagination/Pagination";
import { Link, useNavigate } from "react-router-dom";
import Table from "../components/organisms/Table/Table";
import Badge from "../components/atoms/Badge/Badge";
import type { TableColumn } from "../components/organisms/Table/Table";
import { getAdminUsers, resolveUserProfileImage, type UserResponse } from "../api/userApi";
import { getIssues, type Issue } from "../api/issueApi";
import { extractApiErrorMessage } from "../utils/apiError";

type Member = {
  id: string;
  userId: number;
  name: string;
  photo: string;
  email: string;
  phone: string;
  status: "Active" | "Blocked";
  books: number;
  joined: string;
  address: string;
  role: string;
};

const toMember = (user: UserResponse): Member => {
  const status = String(user.status ?? "active").toLowerCase() === "blocked" ? "Blocked" : "Active";
  const joined = "-";
  return {
    id: String(user.userId),
    userId: user.userId,
    name: `${user.fname ?? ""} ${user.lname ?? ""}`.trim() || "Unknown User",
    photo: resolveUserProfileImage(user.profileImage),
    email: user.email,
    phone: user.phone ?? "-",
    status,
    books: 0,
    joined,
    address: user.address ?? "-",
    role: user.role ?? "user",
  };
};

const buildIssuedCountByUser = (issues: Issue[]) => {
  const counts = new Map<number, number>();

  for (const issue of issues) {
    const status = String(issue.status ?? "").toLowerCase();
    if (status !== "issued" && status !== "overdue") continue;

    const userId = Number(issue.user?.userId ?? 0);
    if (!Number.isFinite(userId) || userId <= 0) continue;

    counts.set(userId, (counts.get(userId) ?? 0) + 1);
  }

  return counts;
};

const columns: TableColumn<Member>[] = [
  {
    key: "member",
    header: "Member Details",
    render: (user: Member) => (
      <div className="flex items-center gap-3">
        <img
          src={user.photo}
          alt={user.name}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">{user.id}</div>
        </div>
      </div>
    ),
  },
  {
    key: "contact",
    header: "Contact Info",
    render: (user: Member) => (
      <div>
        <div className="text-gray-800">{user.email}</div>
        <div className="text-xs text-gray-500">{user.phone}</div>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (user: Member) => (
      <Badge
        text={user.status}
        variant={user.status === "Blocked" ? "danger" : "success"}
      />
    ),
  },
  { key: "books", header: "Books Issued", accessor: "books" },
  { key: "joined", header: "Joined On", accessor: "joined" },
  {
    key: "actions",
    header: "Actions",
    render: (user: Member) => (
      <Link
        to={`/admin/users/${user.id}`}
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        View
      </Link>
    ),
  },
];

const UsersPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, issuesData] = await Promise.all([
          getAdminUsers({ page, size: 10, sort: "fname" }),
          getIssues(),
        ]);
        const issuedCountByUser = buildIssuedCountByUser(Array.isArray(issuesData) ? issuesData : []);
        const mapped = (Array.isArray(data.content) ? data.content : []).map((user) => {
          const member = toMember(user);
          return {
            ...member,
            books: issuedCountByUser.get(member.userId) ?? 0,
          };
        });
        setMembers(mapped);
        setTotalPages(Math.max(1, Number(data.totalPages ?? 1)));
      } catch (err) {
        setError(extractApiErrorMessage(err, "Failed to load users."));
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    const intervalId = window.setInterval(() => {
      loadUsers();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [page]);

  const filteredMembers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return members;
    return members.filter((m) =>
      [m.name, m.email, m.id].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [members, query]);

  return (
    <div className="space-y-6">

      {/* Search + Filter */}
      <div className="flex gap-4 items-center">

        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or member ID..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <Button 
        onClick={() => navigate("/admin/add-user")}
        variant="primary">Add New Member</Button>

      </div>

      {/* Table */}
      {loading && <p className="text-sm text-gray-500">Loading users...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && <Table columns={columns} data={filteredMembers} rowKey={(user) => user.id} />}
      {/* Pagination */}
      {!loading && !error && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}

    </div>
  );
};

export default UsersPage;
