type Props = {
  title: string
  value: string | number
  help?: string
  color?: "purple" | "green" | "red" | "blue" | "yellow" | "emerald"
}

const SummaryCard: React.FC<Props> = ({ title, value, help, color="purple" }) => {

  const iconColors = {
    purple: "bg-purple-200 text-purple-600",
    green: "bg-green-200 text-green-600",
    red: "bg-red-200 text-red-600",
    blue: "bg-blue-200 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    emerald: "bg-emerald-100 text-emerald-600"
  }

  return (
    <div className={`flex min-h-28 flex-col justify-between rounded-xl p-4 shadow-card sm:p-6 ${iconColors[color]}`}>
      <div className="text-sm font-medium text-gray-800">{title}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {help && <div className="text-xs text-gray-500">{help}</div>}
    </div>
  )
}

export default SummaryCard
