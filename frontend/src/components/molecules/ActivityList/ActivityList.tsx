import Badge from "../../atoms/Badge/Badge";

type Activity = {
  title: string
  subtitle: string
  time: string
  status: string
}

type Props = {
  title: string
  activities: Activity[]
}

const ActivityList = ({ title, activities }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">

      <h3 className="font-semibold mb-4">
        {title}
      </h3>

      <div className="space-y-4">

        {activities.map((a, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b pb-3"
          >

            <div>
              <p className="font-medium">{a.title}</p>
              <p className="text-sm text-gray-500">{a.subtitle}</p>
            </div>

            <div className="text-right">
              <Badge
                text={a.status}
                variant={a.status === "Success" ? "success" : "danger"}
              />
              <p className="text-xs text-gray-400 mt-1">
                {a.time}
              </p>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default ActivityList;