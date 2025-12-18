import { useState } from 'react'
import Input from './Input'

export default {
  title: 'Design System/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['base', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
  },
}

export const Default = {
  args: {
    label: 'Label',
    placeholder: 'Enter text...',
  },
}

export const WithHelperText = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'example@email.com',
    helperText: 'We\'ll never share your email.',
  },
}

export const WithError = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'example@email.com',
    error: true,
    errorMessage: 'Please enter a valid email address.',
  },
}

export const AllSizes = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
    <Input label="Small" size="sm" placeholder="Small input" />
    <Input label="Medium" size="md" placeholder="Medium input" />
    <Input label="Large" size="lg" placeholder="Large input" />
  </div>
)

export const Interactive = () => {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  return (
    <div style={{ maxWidth: '400px' }}>
      <Input
        label="Interactive Input"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setError(e.target.value.length < 3 && e.target.value.length > 0)
        }}
        error={error}
        errorMessage="Must be at least 3 characters"
        placeholder="Type something..."
      />
    </div>
  )
}

