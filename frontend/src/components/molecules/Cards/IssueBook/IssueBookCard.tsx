import Card from "../Card/Card";
import Input from "../../../atoms/Input/Input";
import Button from "../../../atoms/Button/Button";

type Props = {
  userId: string;
  bookId: string;
  onUserIdChange: (value: string) => void;
  onBookIdChange: (value: string) => void;
  onConfirm?: () => void;
  loading?: boolean;
};

const IssueBookCard = ({ userId, bookId, onUserIdChange, onBookIdChange, onConfirm, loading = false }: Props) => {
  return (
    <Card title="Issue New Book">

      <div className="space-y-4">

        <div>
          <label className="text-sm font-medium">Select User</label>
          <Input
            placeholder="Enter user ID"
            value={userId}
            onChange={(event) => onUserIdChange(event.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Select Book</label>
          <Input
            placeholder="Enter book ID"
            value={bookId}
            onChange={(event) => onBookIdChange(event.target.value)}
          />
        </div>

        <Button type="button" variant="primary" className="w-full sm:w-auto" onClick={onConfirm} disabled={loading}>
          {loading ? "Issuing..." : "Confirm & Issue Book"}
        </Button>

      </div>

    </Card>
  );
};

export default IssueBookCard;
