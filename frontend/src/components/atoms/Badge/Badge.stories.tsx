import type { Meta, StoryObj } from "@storybook/react"
import Badge from "./Badge"

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge
}

export default meta
type Story = StoryObj<typeof Badge>

export const Success: Story = {
  args: {
    text: "Available",
    variant: "success"
  }
}

export const Danger: Story = {
  args: {
    text: "Unavailable",
    variant: "danger"
  }
}

