type BadgeVariant = "success" | "danger" | "neutral" | "category"

type Props = {
  variant?: BadgeVariant
  className?: string
} & (
  | {
      text: string
      label?: never
    }
  | {
      label: string
      text?: never
    }
)

const styles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-700",
  danger: "bg-red-100 text-red-700",
  neutral: "bg-gray-100 text-gray-700",
  category: "bg-purple-100 text-purple-700"
}

const Badge = ({ text, label, variant = "neutral", className = "" }: Props) => {
  const value = text ?? label

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[variant]} ${className}`}>
      {value}
    </span>
  )
}

export default Badge
