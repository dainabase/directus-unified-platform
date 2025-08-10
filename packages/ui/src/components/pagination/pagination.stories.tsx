import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './pagination'
import { useState } from 'react'

const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible pagination component with multiple variants and extensive customization options.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
      description: 'Current active page (1-indexed)'
    },
    totalPages: {
      control: { type: 'number', min: 1 },
      description: 'Total number of pages'
    },
    pageSize: {
      control: { type: 'number', min: 1 },
      description: 'Number of items per page'
    },
    totalItems: {
      control: { type: 'number', min: 0 },
      description: 'Total number of items'
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'dots'],
      description: 'Visual variant of the pagination'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the pagination controls'
    },
    siblingCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of sibling pages to show on each side of current page'
    },
    boundaryCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of pages to show at the beginning and end'
    },
    showFirstLast: {
      control: { type: 'boolean' },
      description: 'Show first/last navigation buttons'
    },
    showPageSize: {
      control: { type: 'boolean' },
      description: 'Show page size selector'
    },
    showPageJumper: {
      control: { type: 'boolean' },
      description: 'Show page jumper input'
    },
    showTotal: {
      control: { type: 'boolean' },
      description: 'Show total items count'
    }
  }
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

// Helper component for interactive stories
function PaginationDemo(props: any) {
  const [currentPage, setCurrentPage] = useState(props.currentPage || 1)
  const [pageSize, setPageSize] = useState(props.pageSize || 10)
  
  return (
    <Pagination
      {...props}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={(newSize) => {
        setPageSize(newSize)
        setCurrentPage(1) // Reset to first page when changing size
      }}
    />
  )
}

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    totalItems: 100
  },
  render: (args) => <PaginationDemo {...args} />
}

export const WithAllFeatures: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    pageSize: 10,
    totalItems: 200,
    showFirstLast: true,
    showPageSize: true,
    showPageJumper: true,
    showTotal: true,
    pageSizes: [5, 10, 20, 50, 100]
  },
  render: (args) => <PaginationDemo {...args} />
}

export const Compact: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    variant: 'compact'
  },
  render: (args) => <PaginationDemo {...args} />
}

export const Dots: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    variant: 'dots'
  },
  render: (args) => <PaginationDemo {...args} />
}

export const LargePagination: Story = {
  args: {
    currentPage: 50,
    totalPages: 100,
    totalItems: 1000,
    showTotal: true,
    siblingCount: 1,
    boundaryCount: 1
  },
  render: (args) => <PaginationDemo {...args} />
}

export const SmallSize: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    size: 'sm'
  },
  render: (args) => <PaginationDemo {...args} />
}

export const LargeSize: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    size: 'lg'
  },
  render: (args) => <PaginationDemo {...args} />
}

export const WithPageSizeSelector: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    pageSize: 20,
    totalItems: 200,
    showPageSize: true,
    pageSizes: [10, 20, 30, 50, 100]
  },
  render: (args) => <PaginationDemo {...args} />
}

export const WithPageJumper: Story = {
  args: {
    currentPage: 1,
    totalPages: 50,
    showPageJumper: true
  },
  render: (args) => <PaginationDemo {...args} />
}

export const CustomLabels: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    showTotal: true,
    showPageSize: true,
    labels: {
      first: 'Premier',
      previous: 'Précédent',
      next: 'Suivant',
      last: 'Dernier',
      page: 'Page',
      of: 'sur',
      items: 'éléments',
      itemsPerPage: 'Éléments par page',
      goToPage: 'Aller à la page'
    }
  },
  render: (args) => <PaginationDemo {...args} />
}

export const MinimalPagination: Story = {
  args: {
    currentPage: 1,
    totalPages: 3,
    showFirstLast: false
  },
  render: (args) => <PaginationDemo {...args} />
}

export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1
  },
  render: (args) => <PaginationDemo {...args} />
}

export const ManyPages: Story = {
  args: {
    currentPage: 150,
    totalPages: 300,
    totalItems: 3000,
    showTotal: true,
    siblingCount: 2,
    boundaryCount: 2
  },
  render: (args) => <PaginationDemo {...args} />
}

export const ResponsiveExample: Story = {
  args: {
    currentPage: 5,
    totalPages: 20,
    totalItems: 200,
    showFirstLast: true,
    showPageSize: true,
    showTotal: true
  },
  render: (args) => (
    <div className="w-full max-w-4xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Desktop View</h3>
        <PaginationDemo {...args} />
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Tablet View</h3>
        <div className="max-w-md">
          <PaginationDemo {...args} variant="compact" />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Mobile View</h3>
        <div className="max-w-xs">
          <PaginationDemo {...args} variant="dots" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing different pagination variants for responsive design'
      }
    }
  }
}

export const TableIntegration: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    
    const totalItems = 248
    const totalPages = Math.ceil(totalItems / pageSize)
    
    // Sample data
    const data = Array.from({ length: totalItems }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      status: i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Pending' : 'Inactive',
      date: new Date(2024, 0, i + 1).toLocaleDateString()
    }))
    
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentData = data.slice(startIndex, endIndex)
    
    return (
      <div className="w-full max-w-4xl space-y-4">
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-2">{item.id}</td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.status === 'Active' ? 'bg-green-100 text-green-800' :
                      item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setCurrentPage(1)
          }}
          showPageSize
          showTotal
          showFirstLast
          pageSizes={[5, 10, 20, 50]}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing pagination integrated with a data table'
      }
    }
  }
}
