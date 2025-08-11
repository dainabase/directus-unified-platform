import type { Meta, StoryObj } from '@storybook/react'
import { TreeView, TreeNode } from './tree-view'
import { useState } from 'react'
import { File, Folder, Image, FileText, FileCode } from 'lucide-react'

const meta = {
  title: 'Components/TreeView',
  component: TreeView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TreeView>

export default meta
type Story = StoryObj<typeof meta>

const basicData: TreeNode[] = [
  {
    id: '1',
    label: 'Documents',
    children: [
      {
        id: '1-1',
        label: 'Resume.pdf',
      },
      {
        id: '1-2',
        label: 'Cover Letter.docx',
      },
    ],
  },
  {
    id: '2',
    label: 'Pictures',
    children: [
      {
        id: '2-1',
        label: 'Vacation',
        children: [
          {
            id: '2-1-1',
            label: 'Beach.jpg',
          },
          {
            id: '2-1-2',
            label: 'Mountains.jpg',
          },
        ],
      },
      {
        id: '2-2',
        label: 'Profile.png',
      },
    ],
  },
  {
    id: '3',
    label: 'Projects',
    children: [
      {
        id: '3-1',
        label: 'Website',
        children: [
          {
            id: '3-1-1',
            label: 'index.html',
          },
          {
            id: '3-1-2',
            label: 'styles.css',
          },
          {
            id: '3-1-3',
            label: 'script.js',
          },
        ],
      },
    ],
  },
]

const fileSystemData: TreeNode[] = [
  {
    id: 'root',
    label: 'src',
    icon: <Folder className="h-4 w-4 text-blue-500" />,
    children: [
      {
        id: 'components',
        label: 'components',
        icon: <Folder className="h-4 w-4 text-blue-500" />,
        children: [
          {
            id: 'button',
            label: 'button',
            icon: <Folder className="h-4 w-4 text-blue-500" />,
            children: [
              {
                id: 'button-tsx',
                label: 'button.tsx',
                icon: <FileCode className="h-4 w-4 text-green-500" />,
              },
              {
                id: 'button-test',
                label: 'button.test.tsx',
                icon: <FileCode className="h-4 w-4 text-yellow-500" />,
              },
              {
                id: 'button-stories',
                label: 'button.stories.tsx',
                icon: <FileCode className="h-4 w-4 text-purple-500" />,
              },
            ],
          },
          {
            id: 'card',
            label: 'card',
            icon: <Folder className="h-4 w-4 text-blue-500" />,
            children: [
              {
                id: 'card-tsx',
                label: 'card.tsx',
                icon: <FileCode className="h-4 w-4 text-green-500" />,
              },
              {
                id: 'card-css',
                label: 'card.module.css',
                icon: <FileCode className="h-4 w-4 text-blue-600" />,
              },
            ],
          },
        ],
      },
      {
        id: 'lib',
        label: 'lib',
        icon: <Folder className="h-4 w-4 text-blue-500" />,
        children: [
          {
            id: 'utils-ts',
            label: 'utils.ts',
            icon: <FileCode className="h-4 w-4 text-green-500" />,
          },
        ],
      },
      {
        id: 'index-ts',
        label: 'index.ts',
        icon: <FileCode className="h-4 w-4 text-green-500" />,
      },
      {
        id: 'readme',
        label: 'README.md',
        icon: <FileText className="h-4 w-4 text-gray-500" />,
      },
    ],
  },
]

export const Default: Story = {
  args: {
    data: basicData,
    defaultExpandedKeys: ['1', '2'],
  },
}

export const WithIcons: Story = {
  args: {
    data: fileSystemData,
    defaultExpandedKeys: ['root', 'components', 'button'],
    showIcon: true,
  },
}

export const Checkable: Story = {
  args: {
    data: basicData,
    checkable: true,
    defaultExpandedKeys: ['1', '2', '2-1'],
  },
}

export const MultiSelect: Story = {
  args: {
    data: basicData,
    multiSelect: true,
    defaultExpandedKeys: ['1', '2'],
    defaultSelectedKeys: ['1-1', '2-2'],
  },
}

export const WithLines: Story = {
  args: {
    data: fileSystemData,
    showLine: true,
    showIcon: true,
    defaultExpandedKeys: ['root', 'components', 'button', 'card'],
  },
}

export const ExpandOnClick: Story = {
  args: {
    data: basicData,
    expandOnClick: true,
    defaultExpandedKeys: ['1'],
  },
}

export const Controlled: Story = {
  render: () => {
    const [expandedKeys, setExpandedKeys] = useState<string[]>(['1'])
    const [selectedKeys, setSelectedKeys] = useState<string[]>(['1-1'])
    const [checkedKeys, setCheckedKeys] = useState<string[]>(['2-1-1', '3-1-2'])

    return (
      <div className="w-[400px]">
        <div className="mb-4 p-4 border rounded">
          <h3 className="font-semibold mb-2">Controls</h3>
          <div className="space-y-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
              onClick={() => setExpandedKeys(['1', '2', '3', '2-1', '3-1'])}
            >
              Expand All
            </button>
            <button
              className="px-3 py-1 bg-gray-500 text-white rounded"
              onClick={() => setExpandedKeys([])}
            >
              Collapse All
            </button>
          </div>
          <div className="mt-2 text-sm">
            <div>Expanded: {expandedKeys.join(', ') || 'None'}</div>
            <div>Selected: {selectedKeys.join(', ') || 'None'}</div>
            <div>Checked: {checkedKeys.join(', ') || 'None'}</div>
          </div>
        </div>
        
        <TreeView
          data={basicData}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          checkedKeys={checkedKeys}
          checkable
          multiSelect
          onNodeExpand={(node, expanded) => {
            if (expanded) {
              setExpandedKeys([...expandedKeys, node.id])
            } else {
              setExpandedKeys(expandedKeys.filter(key => key !== node.id))
            }
          }}
          onNodeSelect={(node) => {
            if (selectedKeys.includes(node.id)) {
              setSelectedKeys(selectedKeys.filter(key => key !== node.id))
            } else {
              setSelectedKeys([...selectedKeys, node.id])
            }
          }}
          onCheck={(keys) => {
            setCheckedKeys(keys)
          }}
        />
      </div>
    )
  },
}

export const CustomRenderer: Story = {
  args: {
    data: fileSystemData,
    defaultExpandedKeys: ['root', 'components'],
    showIcon: true,
    renderNode: (node) => (
      <div className="flex items-center justify-between w-full">
        <span>{node.label}</span>
        {node.id.includes('.') && (
          <span className="text-xs text-muted-foreground ml-2">
            {node.label.split('.').pop()?.toUpperCase()}
          </span>
        )}
      </div>
    ),
  },
}

export const DisabledNodes: Story = {
  args: {
    data: [
      {
        id: '1',
        label: 'Enabled Folder',
        children: [
          {
            id: '1-1',
            label: 'Enabled File',
          },
          {
            id: '1-2',
            label: 'Disabled File',
            disabled: true,
          },
        ],
      },
      {
        id: '2',
        label: 'Disabled Folder',
        disabled: true,
        children: [
          {
            id: '2-1',
            label: 'Child of Disabled',
          },
        ],
      },
    ],
    defaultExpandedKeys: ['1'],
    checkable: true,
  },
}