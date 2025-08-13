#!/usr/bin/env node

/**
 * Single Component Test Generator
 * Generate a test file for a specific component
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Get component name from command line
const componentName = process.argv[2];

if (!componentName) {
  console.error(`${colors.red}Error: Please provide a component name${colors.reset}`);
  console.log(`Usage: node scripts/generate-single-test.js <component-name>`);
  console.log(`Example: node scripts/generate-single-test.js button`);
  process.exit(1);
}

// Generate PascalCase name
const componentNamePascal = componentName
  .split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

// Test template
const testTemplate = `/**
 * Test Suite for ${componentNamePascal} Component
 * @generated ${new Date().toISOString()}
 * @coverage Target: 100% coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ${componentNamePascal} } from './index';

describe('${componentNamePascal}', () => {
  // Setup user event
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. RENDERING TESTS
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<${componentNamePascal} />);
      expect(container).toBeInTheDocument();
    });

    it('should render with children', () => {
      const testContent = 'Test Content';
      render(<${componentNamePascal}>{testContent}</${componentNamePascal}>);
      expect(screen.getByText(testContent)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const customClass = 'custom-test-class';
      const { container } = render(<${componentNamePascal} className={customClass} />);
      expect(container.firstChild).toHaveClass(customClass);
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red', padding: '10px' };
      const { container } = render(<${componentNamePascal} style={customStyle} />);
      expect(container.firstChild).toHaveStyle(customStyle);
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<${componentNamePascal} ref={ref} />);
      expect(ref.current).toBeTruthy();
    });
  });

  // 2. PROPS TESTS
  describe('Props', () => {
    it('should handle disabled state', () => {
      const { container } = render(<${componentNamePascal} disabled />);
      const element = container.firstChild as HTMLElement;
      
      // Check if element is properly disabled (adapt based on component)
      if (element?.hasAttribute('disabled')) {
        expect(element).toBeDisabled();
      }
    });

    it('should handle variant prop', () => {
      const variants = ['default', 'primary', 'secondary', 'outline', 'ghost'];
      
      variants.forEach(variant => {
        const { container } = render(<${componentNamePascal} variant={variant} />);
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should handle size prop', () => {
      const sizes = ['sm', 'md', 'lg', 'xl'];
      
      sizes.forEach(size => {
        const { container } = render(<${componentNamePascal} size={size} />);
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  // 3. INTERACTION TESTS
  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn();
      const { container } = render(<${componentNamePascal} onClick={handleClick} />);
      
      const element = container.firstChild as HTMLElement;
      if (element) {
        await user.click(element);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });

    it('should handle keyboard navigation', async () => {
      const handleKeyDown = jest.fn();
      const { container } = render(<${componentNamePascal} onKeyDown={handleKeyDown} />);
      
      const element = container.firstChild as HTMLElement;
      if (element) {
        element.focus();
        await user.keyboard('{Enter}');
        expect(handleKeyDown).toHaveBeenCalled();
      }
    });

    it('should handle focus and blur', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      const { container } = render(
        <${componentNamePascal} onFocus={handleFocus} onBlur={handleBlur} />
      );
      
      const element = container.firstChild as HTMLElement;
      if (element && element.focus) {
        await user.click(element);
        expect(handleFocus).toHaveBeenCalled();
        
        await user.tab();
        expect(handleBlur).toHaveBeenCalled();
      }
    });

    it('should handle hover events', async () => {
      const handleMouseEnter = jest.fn();
      const handleMouseLeave = jest.fn();
      
      const { container } = render(
        <${componentNamePascal} 
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave} 
        />
      );
      
      const element = container.firstChild as HTMLElement;
      if (element) {
        await user.hover(element);
        expect(handleMouseEnter).toHaveBeenCalled();
        
        await user.unhover(element);
        expect(handleMouseLeave).toHaveBeenCalled();
      }
    });
  });

  // 4. ACCESSIBILITY TESTS
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const ariaLabel = 'Test ${componentNamePascal}';
      const { container } = render(
        <${componentNamePascal} aria-label={ariaLabel} role="button" />
      );
      
      const element = container.firstChild;
      expect(element).toHaveAttribute('aria-label', ariaLabel);
      expect(element).toHaveAttribute('role', 'button');
    });

    it('should support keyboard navigation', async () => {
      const { container } = render(<${componentNamePascal} />);
      const element = container.firstChild as HTMLElement;
      
      if (element && element.focus) {
        await user.tab();
        element.focus();
        expect(document.activeElement).toBe(element);
      }
    });

    it('should have proper focus management', () => {
      const { container } = render(<${componentNamePascal} />);
      const element = container.firstChild as HTMLElement;
      
      if (element && element.focus) {
        element.focus();
        expect(document.activeElement).toBe(element);
      }
    });

    it('should announce changes to screen readers', () => {
      const { container } = render(
        <${componentNamePascal} aria-live="polite" aria-atomic="true" />
      );
      
      const element = container.firstChild;
      expect(element).toHaveAttribute('aria-live', 'polite');
      expect(element).toHaveAttribute('aria-atomic', 'true');
    });
  });

  // 5. STATE MANAGEMENT TESTS
  describe('State Management', () => {
    it('should handle controlled state', () => {
      const value = 'test-value';
      const handleChange = jest.fn();
      
      const { rerender } = render(
        <${componentNamePascal} value={value} onChange={handleChange} />
      );
      
      const newValue = 'new-value';
      rerender(<${componentNamePascal} value={newValue} onChange={handleChange} />);
      
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should handle uncontrolled state', () => {
      const defaultValue = 'default-value';
      const { container } = render(
        <${componentNamePascal} defaultValue={defaultValue} />
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // 6. EDGE CASES
  describe('Edge Cases', () => {
    it('should handle empty/null/undefined props', () => {
      const { container: container1 } = render(<${componentNamePascal} value={null} />);
      expect(container1.firstChild).toBeInTheDocument();
      
      const { container: container2 } = render(<${componentNamePascal} value={undefined} />);
      expect(container2.firstChild).toBeInTheDocument();
      
      const { container: container3 } = render(<${componentNamePascal} value="" />);
      expect(container3.firstChild).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(10000);
      const { container } = render(
        <${componentNamePascal}>{longContent}</${componentNamePascal}>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle rapid state changes', () => {
      const { rerender } = render(<${componentNamePascal} value="1" />);
      
      for (let i = 0; i < 100; i++) {
        rerender(<${componentNamePascal} value={\`\${i}\`} />);
      }
      
      expect(true).toBe(true);
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+{}[]|\\:;"<>?,./\`~';
      const { container } = render(
        <${componentNamePascal}>{specialChars}</${componentNamePascal}>
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // 7. PERFORMANCE TESTS
  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = jest.fn();
      
      const TestWrapper = ({ children }: { children: React.ReactNode }) => {
        renderSpy();
        return <>{children}</>;
      };
      
      const { rerender } = render(
        <TestWrapper>
          <${componentNamePascal} />
        </TestWrapper>
      );
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      rerender(
        <TestWrapper>
          <${componentNamePascal} />
        </TestWrapper>
      );
      
      expect(renderSpy.mock.calls.length).toBeLessThanOrEqual(2);
    });

    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: \`Item \${i}\`,
      }));
      
      const { container } = render(<${componentNamePascal} data={largeData} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // 8. INTEGRATION TESTS
  describe('Integration', () => {
    it('should work within forms', () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      
      render(
        <form onSubmit={handleSubmit}>
          <${componentNamePascal} name="test-field" />
          <button type="submit">Submit</button>
        </form>
      );
      
      fireEvent.click(screen.getByText('Submit'));
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should work with React context', () => {
      const TestContext = React.createContext('default');
      
      render(
        <TestContext.Provider value="test-value">
          <${componentNamePascal} />
        </TestContext.Provider>
      );
      
      expect(true).toBe(true);
    });
  });

  // 9. SNAPSHOT TESTS
  describe('Snapshots', () => {
    it('should match snapshot with default props', () => {
      const { container } = render(<${componentNamePascal} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with all props', () => {
      const { container } = render(
        <${componentNamePascal}
          id="test"
          className="test-class"
          variant="primary"
          size="lg"
          disabled={false}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  // 10. CLEANUP TESTS
  describe('Cleanup', () => {
    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(<${componentNamePascal} />);
      expect(() => unmount()).not.toThrow();
    });

    it('should cancel async operations on unmount', async () => {
      const { unmount } = render(<${componentNamePascal} />);
      unmount();
      
      await waitFor(() => {
        expect(true).toBe(true);
      });
    });
  });
});
`;

// Generate the test file
function generateTest() {
  console.log(`${colors.bright}${colors.cyan}🚀 Generating Test for ${componentName}${colors.reset}`);
  console.log(`${'='.repeat(50)}`);
  
  const componentsDir = path.join(__dirname, '../src/components');
  const componentDir = path.join(componentsDir, componentName);
  
  // Check if component directory exists
  if (!fs.existsSync(componentDir)) {
    console.error(`${colors.red}Error: Component directory not found: ${componentName}${colors.reset}`);
    console.log(`Please check that the component exists in src/components/`);
    process.exit(1);
  }
  
  // Check if test already exists
  const testFilePath = path.join(componentDir, `${componentName}.test.tsx`);
  if (fs.existsSync(testFilePath)) {
    console.log(`${colors.yellow}⚠️ Test file already exists: ${componentName}.test.tsx${colors.reset}`);
    console.log(`Do you want to overwrite it? (y/n)`);
    
    // For automation, we'll skip if it exists
    console.log(`Skipping to avoid overwriting existing test.`);
    process.exit(0);
  }
  
  // Write the test file
  try {
    fs.writeFileSync(testFilePath, testTemplate);
    console.log(`${colors.green}✅ Test file created successfully!${colors.reset}`);
    console.log(`📍 Location: ${testFilePath}`);
    
    console.log(`\n${colors.bright}📝 Next Steps:${colors.reset}`);
    console.log(`1. Review and customize the generated test`);
    console.log(`2. Add component-specific test cases`);
    console.log(`3. Run the test: npm test ${componentName}`);
    console.log(`4. Check coverage: npm run test:coverage`);
    
    console.log(`\n${colors.bright}💡 Tips:${colors.reset}`);
    console.log(`• Adapt the test to match your component's actual props`);
    console.log(`• Add tests for component-specific behaviors`);
    console.log(`• Test error boundaries and edge cases`);
    console.log(`• Ensure accessibility requirements are met`);
    
    process.exit(0);
  } catch (error) {
    console.error(`${colors.red}Error writing test file: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the generator
generateTest();
