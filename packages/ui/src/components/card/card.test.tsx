import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './index';

describe('Card Component', () => {
  describe('Card', () => {
    it('renders without crashing', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Card className="custom-class">Content</Card>);
      const card = screen.getByText('Content').parentElement;
      expect(card).toHaveClass('custom-class');
    });

    it('applies default styling', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('border-border');
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('shadow-sm');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Content</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('spreads additional props', () => {
      render(<Card data-testid="test-card" role="article">Content</Card>);
      const card = screen.getByTestId('test-card');
      expect(card).toHaveAttribute('role', 'article');
    });
  });

  describe('CardHeader', () => {
    it('renders without crashing', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardHeader className="custom-header">Header</CardHeader>);
      const header = screen.getByText('Header').parentElement;
      expect(header).toHaveClass('custom-header');
    });

    it('applies default styling', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('p-4');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('border-border');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardHeader ref={ref}>Header</CardHeader>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardTitle', () => {
    it('renders without crashing', () => {
      render(<CardTitle>Card Title</CardTitle>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders as h3 element', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H3');
    });

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
    });

    it('applies default styling', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLHeadingElement>();
      render(<CardTitle ref={ref}>Title</CardTitle>);
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });

  describe('CardDescription', () => {
    it('renders without crashing', () => {
      render(<CardDescription>Card Description</CardDescription>);
      expect(screen.getByText('Card Description')).toBeInTheDocument();
    });

    it('renders as p element', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description.tagName).toBe('P');
    });

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc');
    });

    it('applies default styling', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-neutral-600');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLParagraphElement>();
      render(<CardDescription ref={ref}>Description</CardDescription>);
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
  });

  describe('CardContent', () => {
    it('renders without crashing', () => {
      render(<CardContent>Content area</CardContent>);
      expect(screen.getByText('Content area')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>);
      const content = screen.getByText('Content').parentElement;
      expect(content).toHaveClass('custom-content');
    });

    it('applies default styling', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-4');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardContent ref={ref}>Content</CardContent>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardFooter', () => {
    it('renders without crashing', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer">Footer</CardFooter>);
      const footer = screen.getByText('Footer').parentElement;
      expect(footer).toHaveClass('custom-footer');
    });

    it('applies default styling', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('p-4');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('border-border');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardFooter ref={ref}>Footer</CardFooter>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Complete Card Example', () => {
    const CompleteCard = () => (
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>This is a card description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter>
          <button>Action Button</button>
        </CardFooter>
      </Card>
    );

    it('renders complete card structure', () => {
      render(<CompleteCard />);
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('This is a card description')).toBeInTheDocument();
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('maintains proper hierarchy', () => {
      render(<CompleteCard />);
      
      const title = screen.getByText('Card Title');
      const description = screen.getByText('This is a card description');
      const content = screen.getByText('This is the main content of the card.');
      const button = screen.getByText('Action Button');
      
      // Check that all elements are within the card
      const card = title.closest('[class*="rounded-lg"]');
      expect(card).toContainElement(title);
      expect(card).toContainElement(description);
      expect(card).toContainElement(content);
      expect(card).toContainElement(button);
    });
  });

  describe('Card with Custom Content', () => {
    it('accepts any React node as children', () => {
      render(
        <Card>
          <CardContent>
            <div data-testid="custom-div">Custom div</div>
            <span data-testid="custom-span">Custom span</span>
            <button data-testid="custom-button">Custom button</button>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByTestId('custom-div')).toBeInTheDocument();
      expect(screen.getByTestId('custom-span')).toBeInTheDocument();
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('works with complex nested structures', () => {
      render(
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Nested Title</CardTitle>
              <CardDescription>Nested Description</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('Nested Title')).toBeInTheDocument();
      expect(screen.getByText('Nested Description')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports aria attributes', () => {
      render(
        <Card aria-label="User profile card" role="article">
          <CardHeader>
            <CardTitle id="card-title">Profile</CardTitle>
          </CardHeader>
          <CardContent aria-describedby="card-title">
            Content
          </CardContent>
        </Card>
      );
      
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'User profile card');
      
      const content = screen.getByText('Content').parentElement;
      expect(content).toHaveAttribute('aria-describedby', 'card-title');
    });

    it('maintains semantic HTML structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Semantic Title</CardTitle>
            <CardDescription>Semantic Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Semantic content paragraph</p>
          </CardContent>
        </Card>
      );
      
      // Title is h3
      const title = screen.getByText('Semantic Title');
      expect(title.tagName).toBe('H3');
      
      // Description is p
      const description = screen.getByText('Semantic Description');
      expect(description.tagName).toBe('P');
      
      // Content paragraph is p
      const content = screen.getByText('Semantic content paragraph');
      expect(content.tagName).toBe('P');
    });
  });

  describe('Styling Customization', () => {
    it('allows complete style override', () => {
      render(
        <Card className="bg-red-500 border-blue-500">
          <CardHeader className="bg-green-500">
            <CardTitle className="text-purple-500">Styled Title</CardTitle>
          </CardHeader>
        </Card>
      );
      
      const title = screen.getByText('Styled Title');
      expect(title).toHaveClass('text-purple-500');
      
      const header = title.closest('[class*="bg-green-500"]');
      expect(header).toHaveClass('bg-green-500');
      
      const card = title.closest('[class*="bg-red-500"]');
      expect(card).toHaveClass('bg-red-500');
      expect(card).toHaveClass('border-blue-500');
    });

    it('merges custom styles with defaults', () => {
      render(
        <Card className="mt-4">
          <CardContent className="text-center">
            Centered content
          </CardContent>
        </Card>
      );
      
      const card = screen.getByText('Centered content').closest('[class*="rounded-lg"]');
      expect(card).toHaveClass('mt-4');
      expect(card).toHaveClass('rounded-lg'); // Default class still present
      
      const content = screen.getByText('Centered content').parentElement;
      expect(content).toHaveClass('text-center');
      expect(content).toHaveClass('p-4'); // Default class still present
    });
  });
});
