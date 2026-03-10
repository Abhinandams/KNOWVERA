import Card from "../Card/Card";
import Input from "../../../atoms/Input/Input";
import Button from "../../../atoms/Button/Button";
import Badge from "../../../atoms/Badge/Badge";

type Props = {
  issueId: string;
  onIssueIdChange: (value: string) => void;
  onConfirm?: () => void;
  loading?: boolean;
};

const ReturnBookCard = ({ issueId, onIssueIdChange, onConfirm, loading = false }: Props) => {
  return (
    <Card title="Process Book Return">

      <Input
        placeholder="Issue ID"
        value={issueId}
        onChange={(event) => onIssueIdChange(event.target.value)}
      />

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="font-medium">The Modern Architect</p>
        <p className="text-sm text-gray-500">
          Author: Marcus V. Sterling
        </p>
      </div>

      <Badge text="Overdue (5 Days)" variant="danger"/>

      <Button type="button" variant="primary" onClick={onConfirm} disabled={loading}>
        {loading ? "Returning..." : "Confirm Return & Collect Fine"}
      </Button>

    </Card>
  );
};

export default ReturnBookCard;
