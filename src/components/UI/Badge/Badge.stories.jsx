import Badge from './Badge'

export default {
  title: 'Design System/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['light', 'medium', 'dark', 'accent'],
    },
  },
}

export const Light = {
  args: {
    variant: 'light',
    children: 'Badge',
  },
}

export const Medium = {
  args: {
    variant: 'medium',
    children: 'Badge',
  },
}

export const Dark = {
  args: {
    variant: 'dark',
    children: 'Badge',
  },
}

export const Accent = {
  args: {
    variant: 'accent',
    children: 'Badge',
  },
}

export const AllVariants = () => (
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
    <Badge variant="light">Light</Badge>
    <Badge variant="medium">Medium</Badge>
    <Badge variant="dark">Dark</Badge>
    <Badge variant="accent">Accent</Badge>
  </div>
)

