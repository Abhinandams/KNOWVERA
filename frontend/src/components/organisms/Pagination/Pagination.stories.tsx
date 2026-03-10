import type { Meta, StoryObj } from "@storybook/react"
import Pagination from "./Pagination"

const meta: Meta<typeof Pagination> = {
  title: "Organisms/Pagination",
  component: Pagination
}

export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    onPageChange: () => {}
  }
}