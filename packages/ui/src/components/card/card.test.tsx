import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '../src/components/card/card';

describe('Card Component', () => {
  describe('Card', () => {
    it('renders correctly with children', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies default classes', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm');
    });

    it('applies custom className', () => {
      render(<Card className="custom-card-class" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      
      expect(card).toHaveClass('custom-card-class');
    });
  });

  describe('CardHeader', () => {
    it('renders correctly with children', () => {
      render(
        <CardHeader>
          <div>Header content</div>
        </CardHeader>
      );
      
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('applies default spacing classes', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });
  });

  describe('CardTitle', () => {
    it('renders as h3 by default', () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      
      expect(title.tagName).toBe('H3');
    });

    it('applies default typography classes', () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
    });
  });

  describe('CardDescription', () => {
    it('renders as p element', () => {
      render(<CardDescription>Card description text</CardDescription>);
      const description = screen.getByText('Card description text');
      
      expect(description.tagName).toBe('P');
    });

    it('applies muted text styling', () => {
      render(<CardDescription>Card description text</CardDescription>);
      const description = screen.getByText('Card description text');
      
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('renders correctly with children', () => {
      render(
        <CardContent>
          <div>Main content</div>
        </CardContent>
      );
      
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });

    it('applies padding classes', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      
      expect(content).toHaveClass('p-6', 'pt-0');
    });
  });

  describe('CardFooter', () => {
    it('renders correctly with children', () => {
      render(
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      );
      
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('applies flex layout classes', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });
  });

  describe('Complete Card composition', () => {
    it('renders a complete card with all subcomponents', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card body content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Save</button>
            <button>Cancel</button>
          </CardFooter>
        </Card>
      );
      
      expect(screen.getByText('Complete Card')).toBeInTheDocument();
      expect(screen.getByText('This is a complete card example')).toBeInTheDocument();
      expect(screen.getByText('Card body content goes here')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('maintains proper structure and hierarchy', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      
      const card = container.firstChild;
      expect(card?.childNodes).toHaveLength(3);
      
      const header = card?.childNodes[0];
      expect(header?.childNodes).toHaveLength(2);
    });
  });
});
