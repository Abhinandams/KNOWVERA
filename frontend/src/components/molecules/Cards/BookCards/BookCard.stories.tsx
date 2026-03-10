import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import BookCard from "./BookCard"

const meta: Meta<typeof BookCard> = {
  title: "Molecules/BookCard",
  component: BookCard,

  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ]
}

export default meta
type Story = StoryObj<typeof BookCard>

export const Available: Story = {
  args: {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self Help",
    publisher: "Penguin",
    image: "https://picsum.photos/200/300",
    availableCopies: 5
  }
}

export const Unavailable: Story = {
  args: {
    id: 2,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    publisher: "Scribner",
    image: "https://picsum.photos/200/301",
    availableCopies: 0
  }
}