import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const Layout = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState('all')

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Sidebar
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
      />
      <TopBar />
      <main
        style={{
          marginLeft: 240,
          paddingTop: 52,
          minHeight: '100vh',
        }}
      >
        <div style={{ padding: 24 }}>
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child, { selectedCompany })
              : child
          )}
        </div>
      </main>
    </div>
  )
}

export default Layout
