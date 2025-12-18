import Card from './Card'

export default {
  title: 'Design System/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['base', 'elevated', 'outlined'],
    },
    hover: {
      control: 'boolean',
    },
  },
}

export const Base = {
  args: {
    variant: 'base',
    children: (
      <>
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>
            This is a base card with some example content.
          </Card.Text>
        </Card.Body>
      </>
    ),
  },
}

export const Elevated = {
  args: {
    variant: 'elevated',
    children: (
      <>
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>
            This is an elevated card with shadow.
          </Card.Text>
        </Card.Body>
      </>
    ),
  },
}

export const Outlined = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Text>
            This is an outlined card with thick border.
          </Card.Text>
        </Card.Body>
      </>
    ),
  },
}

export const WithImage = {
  args: {
    variant: 'elevated',
    hover: true,
    children: (
      <>
        <Card.Img
          variant="top"
          src="https://via.placeholder.com/300x200"
          alt="Placeholder"
        />
        <Card.Body>
          <Card.Title>Card with Image</Card.Title>
          <Card.Text>
            This card includes an image at the top.
          </Card.Text>
        </Card.Body>
      </>
    ),
  },
}

