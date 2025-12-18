import Button from './Button'

export default {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'accent'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
}

export const Secondary = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
}

export const Outline = {
  args: {
    variant: 'outline',
    children: 'Button',
  },
}

export const Accent = {
  args: {
    variant: 'accent',
    children: 'Button',
  },
}

export const Small = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
  },
}

export const Medium = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Medium Button',
  },
}

export const Large = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
  },
}

export const AllVariants = () => (
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="accent">Accent</Button>
  </div>
)

export const AllSizes = () => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <Button variant="primary" size="sm">Small</Button>
    <Button variant="primary" size="md">Medium</Button>
    <Button variant="primary" size="lg">Large</Button>
  </div>
)

