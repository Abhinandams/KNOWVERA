import type { Meta, StoryObj } from '@storybook/react';
import SideBar from './SideBar';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof SideBar> = {
  title: 'Organisms/SideBar',
  component: SideBar,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SideBar>;

export const Default: Story = {};