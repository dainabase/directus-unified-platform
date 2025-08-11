import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from "lucide-react"

export interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
  selectable?: boolean
  disabled?: boolean
  expanded?: boolean
  selected?: boolean
  data?: any
}

export interface TreeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  data: TreeNode[]
  onNodeSelect?: (node: TreeNode) => void
  onNodeExpand?: (node: TreeNode, expanded: boolean) => void
  multiSelect?: boolean
  expandedKeys?: string[]
  selectedKeys?: string[]
  defaultExpandedKeys?: string[]
  defaultSelectedKeys?: string[]
  showIcon?: boolean
  showLine?: boolean
  draggable?: boolean
  onDragStart?: (node: TreeNode) => void
  onDragEnd?: (node: TreeNode) => void
  onDrop?: (dragNode: TreeNode, dropNode: TreeNode, position: "before" | "after" | "inside") => void
  renderNode?: (node: TreeNode) => React.ReactNode
  expandOnClick?: boolean
  checkable?: boolean
  onCheck?: (checkedKeys: string[], node: TreeNode) => void
  checkedKeys?: string[]
}

interface TreeNodeComponentProps {
  node: TreeNode
  level: number
  expanded: boolean
  selected: boolean
  checked?: boolean
  onToggle: () => void
  onSelect: () => void
  onCheck?: () => void
  showIcon: boolean
  showLine: boolean
  draggable: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onDrop?: (position: "before" | "after" | "inside") => void
  renderNode?: (node: TreeNode) => React.ReactNode
  expandOnClick: boolean
  checkable: boolean
  hasChildren: boolean
  isLastChild?: boolean
  parentExpanded?: boolean[]
}

const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({
  node,
  level,
  expanded,
  selected,
  checked,
  onToggle,
  onSelect,
  onCheck,
  showIcon,
  showLine,
  draggable,
  onDragStart,
  onDragEnd,
  onDrop,
  renderNode,
  expandOnClick,
  checkable,
  hasChildren,
  isLastChild,
  parentExpanded = [],
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [dropPosition, setDropPosition] = React.useState<"before" | "after" | "inside" | null>(null)

  const handleClick = () => {
    if (expandOnClick && hasChildren) {
      onToggle()
    } else {
      onSelect()
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", node.id)
    onDragStart?.()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height
    
    if (y < height * 0.25) {
      setDropPosition("before")
    } else if (y > height * 0.75) {
      setDropPosition("after")
    } else {
      setDropPosition("inside")
    }
    
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
    setDropPosition(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (dropPosition) {
      onDrop?.(dropPosition)
    }
    setDropPosition(null)
  }

  const getIcon = () => {
    if (node.icon) return node.icon
    if (!showIcon) return null
    
    if (hasChildren) {
      return expanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  return (
    <div
      className={cn(
        "select-none",
        isDragOver && dropPosition === "before" && "border-t-2 border-primary",
        isDragOver && dropPosition === "after" && "border-b-2 border-primary",
        isDragOver && dropPosition === "inside" && "bg-muted"
      )}
      onDragOver={draggable ? handleDragOver : undefined}
      onDragLeave={draggable ? handleDragLeave : undefined}
      onDrop={draggable ? handleDrop : undefined}
    >
      <div
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer hover:bg-muted rounded-sm",
          selected && "bg-muted",
          node.disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={!node.disabled ? handleClick : undefined}
        draggable={draggable && !node.disabled}
        onDragStart={draggable ? handleDragStart : undefined}
        onDragEnd={draggable ? onDragEnd : undefined}
      >
        {showLine && level > 0 && (
          <div className="absolute left-0 top-0 bottom-0 flex">
            {parentExpanded.map((isExpanded, i) => (
              <div
                key={i}
                className={cn(
                  "w-5",
                  isExpanded && i < parentExpanded.length - 1 && "border-l border-muted-foreground/20"
                )}
                style={{ marginLeft: `${i * 20}px` }}
              />
            ))}
          </div>
        )}
        
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className="p-0.5 hover:bg-muted-foreground/10 rounded mr-1"
            disabled={node.disabled}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        
        {!hasChildren && <span className="w-5 mr-1" />}
        
        {checkable && (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              e.stopPropagation()
              onCheck?.()
            }}
            className="mr-2"
            disabled={node.disabled}
          />
        )}
        
        {showIcon && (
          <span className="mr-2 flex-shrink-0">{getIcon()}</span>
        )}
        
        {renderNode ? (
          renderNode(node)
        ) : (
          <span className="flex-1 truncate">{node.label}</span>
        )}
      </div>
    </div>
  )
}

export function TreeView({
  data,
  onNodeSelect,
  onNodeExpand,
  multiSelect = false,
  expandedKeys: controlledExpandedKeys,
  selectedKeys: controlledSelectedKeys,
  defaultExpandedKeys = [],
  defaultSelectedKeys = [],
  showIcon = true,
  showLine = false,
  draggable = false,
  onDragStart,
  onDragEnd,
  onDrop,
  renderNode,
  expandOnClick = false,
  checkable = false,
  onCheck,
  checkedKeys: controlledCheckedKeys,
  className,
  ...props
}: TreeViewProps) {
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(
    new Set(controlledExpandedKeys || defaultExpandedKeys)
  )
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(
    new Set(controlledSelectedKeys || defaultSelectedKeys)
  )
  const [checkedKeys, setCheckedKeys] = React.useState<Set<string>>(
    new Set(controlledCheckedKeys || [])
  )
  const [draggedNode, setDraggedNode] = React.useState<TreeNode | null>(null)

  React.useEffect(() => {
    if (controlledExpandedKeys) {
      setExpandedKeys(new Set(controlledExpandedKeys))
    }
  }, [controlledExpandedKeys])

  React.useEffect(() => {
    if (controlledSelectedKeys) {
      setSelectedKeys(new Set(controlledSelectedKeys))
    }
  }, [controlledSelectedKeys])

  React.useEffect(() => {
    if (controlledCheckedKeys) {
      setCheckedKeys(new Set(controlledCheckedKeys))
    }
  }, [controlledCheckedKeys])

  const handleNodeExpand = (node: TreeNode) => {
    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(node.id)) {
      newExpanded.delete(node.id)
      onNodeExpand?.(node, false)
    } else {
      newExpanded.add(node.id)
      onNodeExpand?.(node, true)
    }
    setExpandedKeys(newExpanded)
  }

  const handleNodeSelect = (node: TreeNode) => {
    if (node.selectable === false) return
    
    const newSelected = new Set(selectedKeys)
    if (multiSelect) {
      if (newSelected.has(node.id)) {
        newSelected.delete(node.id)
      } else {
        newSelected.add(node.id)
      }
    } else {
      newSelected.clear()
      newSelected.add(node.id)
    }
    setSelectedKeys(newSelected)
    onNodeSelect?.(node)
  }

  const handleNodeCheck = (node: TreeNode) => {
    const newChecked = new Set(checkedKeys)
    if (newChecked.has(node.id)) {
      newChecked.delete(node.id)
    } else {
      newChecked.add(node.id)
    }
    setCheckedKeys(newChecked)
    onCheck?.(Array.from(newChecked), node)
  }

  const handleDragStart = (node: TreeNode) => {
    setDraggedNode(node)
    onDragStart?.(node)
  }

  const handleDragEnd = (node: TreeNode) => {
    setDraggedNode(null)
    onDragEnd?.(node)
  }

  const handleDrop = (dropNode: TreeNode, position: "before" | "after" | "inside") => {
    if (draggedNode && draggedNode.id !== dropNode.id) {
      onDrop?.(draggedNode, dropNode, position)
    }
  }

  const renderTree = (
    nodes: TreeNode[],
    level = 0,
    parentExpanded: boolean[] = []
  ): React.ReactNode => {
    return nodes.map((node, index) => {
      const hasChildren = node.children && node.children.length > 0
      const isExpanded = expandedKeys.has(node.id)
      const isSelected = selectedKeys.has(node.id)
      const isChecked = checkedKeys.has(node.id)
      const isLastChild = index === nodes.length - 1

      return (
        <div key={node.id}>
          <TreeNodeComponent
            node={node}
            level={level}
            expanded={isExpanded}
            selected={isSelected}
            checked={isChecked}
            onToggle={() => handleNodeExpand(node)}
            onSelect={() => handleNodeSelect(node)}
            onCheck={() => handleNodeCheck(node)}
            showIcon={showIcon}
            showLine={showLine}
            draggable={draggable}
            onDragStart={() => handleDragStart(node)}
            onDragEnd={() => handleDragEnd(node)}
            onDrop={(position) => handleDrop(node, position)}
            renderNode={renderNode}
            expandOnClick={expandOnClick}
            checkable={checkable}
            hasChildren={hasChildren || false}
            isLastChild={isLastChild}
            parentExpanded={parentExpanded}
          />
          {hasChildren && isExpanded && (
            <div>
              {renderTree(
                node.children!,
                level + 1,
                [...parentExpanded, !isLastChild]
              )}
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div
      className={cn(
        "w-full overflow-auto",
        className
      )}
      {...props}
    >
      {renderTree(data)}
    </div>
  )
}