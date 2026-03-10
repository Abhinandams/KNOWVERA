import type { Meta, StoryObj } from "@storybook/react"
import BookFilters from "./BookFilters"

const meta: Meta<typeof BookFilters> = {
  title: "Organisms/BookFilters",
  component: BookFilters
}

export default meta
type Story = StoryObj<typeof BookFilters>

export const Default: Story = {}