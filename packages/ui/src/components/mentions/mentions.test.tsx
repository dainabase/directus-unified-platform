import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Mentions } from './mentions'
import { describe, it, expect, vi } from 'vitest'

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    status: 'online' as const,
  },
  {
    id: '2',
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    status: 'away' as const,
  },
]

describe('Mentions', () => {
  it('renders textarea with placeholder', () => {
    render(<Mentions placeholder="Type here..." />)
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument()
  })

  it('shows suggestions when trigger char is typed', async () => {
    const user = userEvent.setup()
    render(<Mentions users={mockUsers} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '@')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('filters suggestions based on search term', async () => {
    const user = userEvent.setup()
    render(<Mentions users={mockUsers} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '@john')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  it('inserts mention when user is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Mentions users={mockUsers} onChange={onChange} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '@')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('John Doe'))
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        '@johndoe ',
        expect.arrayContaining([expect.objectContaining({ username: 'johndoe' })])
      )
    })
  })

  it('navigates suggestions with arrow keys', async () => {
    const user = userEvent.setup()
    render(<Mentions users={mockUsers} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '@')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    
    // Check selection state would be on John Doe
    expect(screen.getByText('John Doe').parentElement).toHaveClass('bg-accent')
  })

  it('closes suggestions on Escape key', async () => {
    const user = userEvent.setup()
    render(<Mentions users={mockUsers} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '@')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    fireEvent.keyDown(textarea, { key: 'Escape' })
    
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })
  })

  it('respects maxSuggestions prop', async () => {
    const manyUsers = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      username: `user${i}`,
      email: `user${i}@example.com`,
    }))
    
    const user = userEvent.setup()
    render(<Mentions users={manyUsers} maxSuggestions={3} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '@')
    
    await waitFor(() => {
      expect(screen.getByText('User 0')).toBeInTheDocument()
      expect(screen.getByText('User 1')).toBeInTheDocument()
      expect(screen.getByText('User 2')).toBeInTheDocument()
      expect(screen.queryByText('User 3')).not.toBeInTheDocument()
    })
  })

  it('handles custom trigger character', async () => {
    const user = userEvent.setup()
    render(<Mentions users={mockUsers} triggerChar="#" />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '#')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('calls onMention when a user is mentioned', async () => {
    const onMention = vi.fn()
    const user = userEvent.setup()
    render(<Mentions users={mockUsers} onMention={onMention} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '@')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('John Doe'))
    
    await waitFor(() => {
      expect(onMention).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'johndoe' })
      )
    })
  })

  it('handles disabled state', () => {
    render(<Mentions disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('handles readOnly state', () => {
    render(<Mentions readOnly value="Read only text" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('readOnly')
  })

  it('displays active mentions as badges', async () => {
    const user = userEvent.setup()
    render(<Mentions users={mockUsers} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, '@john')
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('John Doe'))
    
    await waitFor(() => {
      expect(screen.getByText('@johndoe')).toBeInTheDocument()
    })
  })
})