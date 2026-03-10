import type { Meta, StoryObj } from "@storybook/react"
import { MemoryRouter } from "react-router-dom"
import BookGrid from "./BookGrid"

const meta: Meta<typeof BookGrid> = {
  title: "Organisms/BookGrid",
  component: BookGrid,

  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ]
}

export default meta
type Story = StoryObj<typeof BookGrid>

export const Default: Story = {
  args: {
    books: [
      {
        id: 1,
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self Help",
        publisher: "Penguin",
        image: "https://picsum.photos/200/300",
        availableCopies: 5
      },
      {
        id: 2,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Fiction",
        publisher: "Scribner",
        image: "https://picsum.photos/200/301",
        availableCopies: 0
      },
      {
        id: 3,
        title: "Clean Code",
        author: "Robert Martin",
        category: "Programming",
        publisher: "Prentice Hall",
        image: "https://picsum.photos/200/302",
        availableCopies: 3
      }
    ]
  }
}