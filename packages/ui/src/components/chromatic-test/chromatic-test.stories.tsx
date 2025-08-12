import type { Meta, StoryObj } from '@storybook/react';
import { ChromaticTest } from './chromatic-test';

/**
 * Chromatic Test Story
 * Temporary story to validate Chromatic configuration
 * Date: August 12, 2025, 08:20 UTC
 */

const meta: Meta<typeof ChromaticTest> = {
  title: 'Test/ChromaticValidation',
  component: ChromaticTest,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# 🎨 Chromatic Test Component

This is a **temporary test component** created to validate that:
- ✅ Chromatic token is properly configured
- ✅ Visual regression testing is working
- ✅ Storybook can capture snapshots
- ✅ CI/CD pipeline triggers correctly

## Status
- **Created**: August 12, 2025, 08:20 UTC
- **Purpose**: Validate Chromatic setup
- **Action**: Remove after successful validation

## Testing Checklist
- [ ] Component renders in Storybook
- [ ] Chromatic workflow triggers on push
- [ ] Visual snapshots are created
- [ ] Build URL is generated
- [ ] No token errors in logs
        `
      }
    }
  },
  tags: ['test', 'validation'],
  argTypes: {
    status: {
      control: 'select',
      options: ['testing', 'success', 'pending'],
      description: 'Current test status'
    },
    message: {
      control: 'text',
      description: 'Test message to display'
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default test state
 */
export const Testing: Story = {
  args: {
    message: '🎨 Chromatic Test in Progress',
    status: 'testing',
    timestamp: new Date().toISOString()
  }
};

/**
 * Success state
 */
export const Success: Story = {
  args: {
    message: '✅ Chromatic Test Successful',
    status: 'success',
    timestamp: new Date().toISOString()
  }
};

/**
 * Pending state
 */
export const Pending: Story = {
  args: {
    message: '⏳ Chromatic Test Pending',
    status: 'pending',
    timestamp: new Date().toISOString()
  }
};

/**
 * All states for visual comparison
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ChromaticTest status="testing" message="Testing State" />
      <ChromaticTest status="success" message="Success State" />
      <ChromaticTest status="pending" message="Pending State" />
    </div>
  )
};
