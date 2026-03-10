export type MemberStatus = "Active" | "Blocked";

export type Member = {
  id: string;
  name: string;
  photo: string;
  email: string;
  phone: string;
  status: MemberStatus;
  books: number;
  joined: string;
  address: string;
  role: string;
};

export const members: Member[] = [
  {
    id: "M001",
    name: "Dr. Eleanor Vance",
    photo: "https://i.pravatar.cc/160?img=47",
    email: "e.vance@academia.edu",
    phone: "+1 555 012 3456",
    status: "Active",
    books: 3,
    joined: "Jan 12 2023",
    address: "221 Westbrook Ave, NY 10012",
    role: "Faculty",
  },
  {
    id: "M002",
    name: "Julian Blackwood",
    photo: "https://i.pravatar.cc/160?img=12",
    email: "j.blackwood@library.org",
    phone: "+1 555 987 6543",
    status: "Active",
    books: 1,
    joined: "Mar 05 2023",
    address: "17 Garden Street, Boston, MA 02116",
    role: "Student",
  },
  {
    id: "M003",
    name: "Sarah Jenkins",
    photo: "https://i.pravatar.cc/160?img=32",
    email: "s.jenkins@student.uni.edu",
    phone: "+1 555 234 5678",
    status: "Blocked",
    books: 0,
    joined: "Oct 22 2022",
    address: "88 Lakeview Road, Austin, TX 78701",
    role: "Student",
  },
];
