import type { Meta, StoryObj } from "@storybook/react"
import SummaryCard from "./SummaryCard"

const meta: Meta<typeof SummaryCard> = {
  title: "Molecules/SummaryCard",
  component: SummaryCard
}

export default meta
type Story = StoryObj<typeof SummaryCard>

export const TotalBooks: Story = {
  args: {
    title: "Total Books",
    value: "1,810"
  }
}

export const AvailableBooks: Story = {
  args: {
    title: "Available Now",
    value: "1,240"
  }
}