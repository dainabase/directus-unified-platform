import React from 'react'
import PropTypes from 'prop-types'

const Table = ({ 
  children,
  className = '',
  ...props 
}) => {
  return (
    <div className="overflow-x-auto">
      <table 
        className={`glass-table w-full ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

const TableHead = ({ children, className = '', ...props }) => (
  <thead className={className} {...props}>
    {children}
  </thead>
)

const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
)

const TableRow = ({ children, className = '', hoverable = true, ...props }) => (
  <tr 
    className={`
      ${hoverable ? 'hover:bg-gray-50/50' : ''}
      ${className}
    `} 
    {...props}
  >
    {children}
  </tr>
)

const TableHeader = ({ children, className = '', align = 'left', ...props }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <th 
      className={`
        px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider
        ${alignClasses[align]}
        ${className}
      `}
      {...props}
    >
      {children}
    </th>
  )
}

const TableCell = ({ children, className = '', align = 'left', ...props }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  return (
    <td 
      className={`
        px-6 py-4 whitespace-nowrap text-sm
        ${alignClasses[align]}
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  )
}

Table.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

TableHead.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

TableBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

TableRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hoverable: PropTypes.bool
}

TableHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right'])
}

TableCell.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right'])
}

Table.Head = TableHead
Table.Body = TableBody
Table.Row = TableRow
Table.Header = TableHeader
Table.Cell = TableCell

export default Table