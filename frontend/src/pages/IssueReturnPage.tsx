import IssueBookCard from "../components/molecules/Cards/IssueBook/IssueBookCard";
import { useEffect, useMemo, useState } from "react";
import ActionModal from "../components/organisms/ActionModal/ActionModal";
import type { ActionModalType } from "../components/organisms/ActionModal/ActionModal";
import { createIssue, getIssues, returnIssue, type Issue } from "../api/issueApi";
import { extractApiErrorMessage } from "../utils/apiError";
import ErrorModal from "../components/organisms/ErrorModal/ErrorModal";
import { logAdminActivity } from "../utils/adminActivity";
import Table from "../components/organisms/Table/Table";
import Button from "../components/atoms/Button/Button";
import Badge from "../components/atoms/Badge/Badge";
import Pagination from "../components/organisms/Pagination/Pagination";
import Input from "../components/atoms/Input/Input";


const IssueReturnPage = () => {
  const [modalType, setModalType] = useState<ActionModalType | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Returned" | "Not Returned">("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [issuing, setIssuing] = useState(false);
  const [returning, setReturning] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const loadIssues = async () => {
    setLoadingIssues(true);
    try {
      const data = await getIssues();
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(extractApiErrorMessage(err, "Failed to load issues."));
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const issueRows = useMemo(
    () =>
      issues.map((issue) => {
        const status = String(issue.status ?? "issued").toLowerCase();
        return {
          issueId: Number(issue.issueId),
          userId: Number(issue.user?.userId ?? 0),
          bookId: Number(issue.book?.bookId ?? 0),
          member:
            `${issue.user?.fname ?? ""} ${issue.user?.lname ?? ""}`.trim() ||
            `User #${issue.user?.userId ?? "-"}`,
          book: issue.book?.title ?? `Book #${issue.book?.bookId ?? "-"}`,
          issueDate: formatDate(issue.issueDate),
          dueDate: formatDate(issue.dueDate),
          returnDate: formatDate(issue.returnDate),
          status,
        };
      }),
    [issues]
  );

  const issueColumns = [
    { key: "issueId", header: "Issue ID", accessor: "issueId" as const },
    { key: "member", header: "Member", accessor: "member" as const },
    { key: "book", header: "Book", accessor: "book" as const },
    { key: "issueDate", header: "Issued On", accessor: "issueDate" as const },
    { key: "dueDate", header: "Due Date", accessor: "dueDate" as const },
    { key: "returnDate", header: "Returned On", accessor: "returnDate" as const },
    {
      key: "status",
      header: "Status",
      render: (row: (typeof issueRows)[number]) => (
        <Badge
          text={row.status === "returned" ? "Returned" : row.status === "overdue" ? "Overdue" : "Issued"}
          variant={row.status === "returned" ? "success" : row.status === "overdue" ? "danger" : "neutral"}
        />
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (row: (typeof issueRows)[number]) => (
        <Button
          type="button"
          variant={row.status === "returned" ? "ghost" : "primary"}
          disabled={row.status === "returned" || returning}
          onClick={
            row.status === "returned"
              ? undefined
              : async () => {
                  setReturning(true);
                  setError(null);
                  try {
                    const returned = await returnIssue(row.issueId);
                    const returnUserId = Number(returned.user?.userId ?? 0);
                    logAdminActivity({
                      title: returned.book?.title ?? `Issue #${row.issueId}`,
                      subtitle:
                        `Returned by ${returned.user?.fname ?? ""} ${returned.user?.lname ?? ""}`.trim() ||
                        (returnUserId > 0 ? `Returned by user #${returnUserId}` : "Book returned"),
                    });
                    setModalType("book_returned");
                    await loadIssues();
                  } catch (err) {
                    setError(extractApiErrorMessage(err, "Failed to return book."));
                  } finally {
                    setReturning(false);
                  }
                }
          }
        >
          {row.status === "returned" ? "Returned" : "Return"}
        </Button>
      ),
    },
  ];

  const filteredIssueRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return issueRows.filter((row) => {
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Returned" ? row.status === "returned" : row.status !== "returned");

      const matchesSearch =
        keyword.length === 0 ||
        [String(row.issueId), row.member, row.book, String(row.userId), String(row.bookId)]
          .some((value) => value.toLowerCase().includes(keyword));

      return matchesStatus && matchesSearch;
    });
  }, [issueRows, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredIssueRows.length / pageSize));
  const pagedIssueRows = filteredIssueRows.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(0);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Issue & Return Transactions
          </h2>
          <p className="text-sm text-gray-500">
            Manage library circulation by checking books in and out.
          </p>
        </div>
        <Button type="button" onClick={() => setIsIssueModalOpen(true)}>
          Issue Book
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Issued Books</h3>
          <select
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "All" | "Returned" | "Not Returned")
            }
          >
            <option value="All">All</option>
            <option value="Returned">Returned</option>
            <option value="Not Returned">Issued</option>
          </select>
        </div>
        <Input
          placeholder="Search by username, book name, user ID, or book ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {loadingIssues && <p className="text-sm text-gray-500">Loading issues...</p>}
        {!loadingIssues && (
          <Table
            columns={issueColumns}
            data={pagedIssueRows}
            rowKey={(row) => row.issueId}
            emptyMessage="No issue records found."
            tableClassName="shadow-none"
          />
        )}
        {!loadingIssues && filteredIssueRows.length > 0 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {isIssueModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="issue-book-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 id="issue-book-modal-title" className="text-lg font-semibold text-gray-900">
                Issue Book
              </h3>
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <IssueBookCard
              userId={userId}
              bookId={bookId}
              onUserIdChange={setUserId}
              onBookIdChange={setBookId}
              loading={issuing}
              onConfirm={async () => {
                const parsedUserId = Number(userId);
                const parsedBookId = Number(bookId);
                if (!parsedUserId || !parsedBookId) {
                  setError("Enter valid user ID and book ID.");
                  return;
                }
                setIssuing(true);
                setError(null);
                try {
                  const issued = await createIssue({ userId: parsedUserId, bookId: parsedBookId });
                  logAdminActivity({
                    title: issued.book?.title ?? `Book #${parsedBookId}`,
                    subtitle:
                      `Issued to ${issued.user?.fname ?? ""} ${issued.user?.lname ?? ""}`.trim() ||
                      `Issued to user #${parsedUserId}`,
                  });
                  setModalType("book_issued");
                  setUserId("");
                  setBookId("");
                  setIsIssueModalOpen(false);
                  await loadIssues();
                } catch (err) {
                  setError(extractApiErrorMessage(err, "Failed to issue book."));
                } finally {
                  setIssuing(false);
                }
              }}
            />
          </div>
        </div>
      )}

      <ActionModal
        isOpen={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
      />
      <ErrorModal
        isOpen={error !== null}
        message={error}
        onClose={() => setError(null)}
      />

    </div>
  );
};

export default IssueReturnPage;
