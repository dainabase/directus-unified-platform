/**
 * Card Component Tests
 * Tests card structure, content areas, and compositions
 */

import React from 'react';
import { renderWithProviders, screen } from '../../../tests/utils/test-utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './index';

describe('Card Component', () => {
  describe('Card Container', () => {
    it('renders card with default styling', () => {
      renderWithProviders(
        <Card data-testid="card">
          <CardContent>Content</CardContent>
        </Card>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg', 'border');
    });

    it('accepts custom className', () => {
      renderWithProviders(
        <Card className="custom-card" data-testid="card">
          <CardContent>Content</CardContent>
        </Card>
      );
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-card');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      renderWithProviders(
        <Card ref={ref}>
          <CardContent>Content</CardContent>
        </Card>
      );
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardHeader', () => {
    it('renders header with content', () => {
      renderWithProviders(
        <Card>
          <CardHeader data-testid="header">
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );
      
      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('applies correct spacing', () => {
      renderWithProviders(
        <Card>
          <CardHeader data-testid="header">
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );
      
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('space-y-1.5', 'p-6');
    });
  });

  describe('CardTitle', () => {
    it('renders title with correct styling', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle data-testid="title">Card Title</CardTitle>
          </CardHeader>
        </Card>
      );
      
      const title = screen.getByTestId('title');
      expect(title).toHaveTextContent('Card Title');
      expect(title.tagName).toBe('H3');
    });

    it('accepts custom className', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle className="custom-title">Title</CardTitle>
          </CardHeader>
        </Card>
      );
      
      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('renders description with correct styling', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardDescription data-testid="desc">
              This is a description
            </CardDescription>
          </CardHeader>
        </Card>
      );
      
      const description = screen.getByTestId('desc');
      expect(description).toHaveTextContent('This is a description');
      expect(description.tagName).toBe('P');
    });

    it('has muted text styling', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardDescription data-testid="desc">
              Muted text
            </CardDescription>
          </CardHeader>
        </Card>
      );
      
      const description = screen.getByTestId('desc');
      expect(description).toHaveClass('text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('renders content area', () => {
      renderWithProviders(
        <Card>
          <CardContent data-testid="content">
            <p>Card content goes here</p>
          </CardContent>
        </Card>
      );
      
      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
    });

    it('applies correct padding', () => {
      renderWithProviders(
        <Card>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6');
    });

    it('removes top padding when following header', () => {
      renderWithProviders(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent data-testid="content">Content</CardContent>
        </Card>
      );
      
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('pt-0');
    });
  });

  describe('CardFooter', () => {
    it('renders footer with content', () => {
      renderWithProviders(
        <Card>
          <CardFooter data-testid="footer">
            <button>Action</button>
          </CardFooter>
        </Card>
      );
      
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('applies flex layout by default', () => {
      renderWithProviders(
        <Card>
          <CardFooter data-testid="footer">
            <button>Save</button>
            <button>Cancel</button>
          </CardFooter>
        </Card>
      );
      
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex', 'items-center');
    });

    it('applies correct padding', () => {
      renderWithProviders(
        <Card>
          <CardFooter data-testid="footer">Footer</CardFooter>
        </Card>
      );
      
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('p-6', 'pt-0');
    });
  });

  describe('Complete Card Composition', () => {
    it('renders full card structure', () => {
      renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>With all sections</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area</p>
          </CardContent>
          <CardFooter>
            <button>Primary</button>
            <button>Secondary</button>
          </CardFooter>
        </Card>
      );
      
      expect(screen.getByText('Complete Card')).toBeInTheDocument();
      expect(screen.getByText('With all sections')).toBeInTheDocument();
      expect(screen.getByText('Main content area')).toBeInTheDocument();
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
    });

    it('maintains semantic structure', () => {
      const { container } = renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle>Semantic Card</CardTitle>
            <CardDescription>Proper HTML structure</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content paragraph</p>
          </CardContent>
        </Card>
      );
      
      // Check for semantic HTML
      const heading = container.querySelector('h3');
      const paragraph = container.querySelector('p');
      
      expect(heading).toHaveTextContent('Semantic Card');
      expect(paragraph).toHaveTextContent('Proper HTML structure');
    });
  });

  describe('Accessibility', () => {
    it('supports ARIA attributes', () => {
      renderWithProviders(
        <Card role="article" aria-label="Feature card">
          <CardContent>Content</CardContent>
        </Card>
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Feature card');
    });

    it('maintains heading hierarchy', () => {
      const { container } = renderWithProviders(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
            <CardDescription>Supporting text</CardDescription>
          </CardHeader>
        </Card>
      );
      
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Main Title');
    });
  });

  describe('Interactive Cards', () => {
    it('can be made clickable', () => {
      const handleClick = jest.fn();
      
      renderWithProviders(
        <Card 
          onClick={handleClick}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
        >
          <CardContent>Clickable Card</CardContent>
        </Card>
      );
      
      const card = screen.getByRole('button');
      card.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('supports hover states', () => {
      renderWithProviders(
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent>Hoverable Card</CardContent>
        </Card>
      );
      
      const card = screen.getByText('Hoverable Card').parentElement?.parentElement;
      expect(card).toHaveClass('transition-shadow');
    });
  });
});
