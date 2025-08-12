/**
 * 🎨 CHROMATIC TEST FILE
 * This file is used to trigger Chromatic workflow for testing
 * Date: August 12, 2025, 08:20 UTC
 * 
 * This is a temporary test component to verify:
 * - Chromatic token is correctly configured
 * - Visual regression testing is working
 * - Storybook deployment is functional
 */

import React from 'react';

export interface ChromaticTestProps {
  message?: string;
  timestamp?: string;
  status?: 'testing' | 'success' | 'pending';
}

/**
 * Test component for Chromatic validation
 * This component will be removed after validation
 */
export const ChromaticTest: React.FC<ChromaticTestProps> = ({
  message = '🎨 Chromatic Test Component',
  timestamp = new Date().toISOString(),
  status = 'testing'
}) => {
  const statusColors = {
    testing: '#3B82F6',  // blue
    success: '#10B981',  // green
    pending: '#F59E0B'   // amber
  };

  return (
    <div 
      style={{
        padding: '24px',
        borderRadius: '8px',
        border: `2px solid ${statusColors[status]}`,
        backgroundColor: '#F9FAFB',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '400px',
        margin: '20px auto'
      }}
    >
      <h2 style={{ 
        margin: '0 0 16px 0',
        color: statusColors[status],
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        {message}
      </h2>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Status:</strong> <span style={{ color: statusColors[status] }}>{status}</span>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Timestamp:</strong> {timestamp}
      </div>
      
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#E5E7EB',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>Testing:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>✅ Component renders correctly</li>
          <li>✅ Chromatic token configured</li>
          <li>✅ Workflow triggered by changes</li>
          <li>✅ Visual snapshots will be created</li>
        </ul>
      </div>
      
      <div style={{
        marginTop: '16px',
        padding: '8px',
        backgroundColor: '#FEF3C7',
        borderRadius: '4px',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        ⚠️ This is a temporary test file - Remove after validation
      </div>
    </div>
  );
};

// Export for Storybook
export default ChromaticTest;
