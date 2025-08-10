import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

describe('Accordion', () => {
  it('renders correctly', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('expands and collapses on click', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText('Trigger');
    const content = screen.getByText('Content');

    // Initially collapsed
    expect(content).not.toBeVisible();

    // Click to expand
    await user.click(trigger);
    expect(content).toBeVisible();

    // Click to collapse (when collapsible is true)
    await user.click(trigger);
    expect(content).not.toBeVisible();
  });

  it('allows multiple items to be open when type is multiple', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText('Trigger 1');
    const trigger2 = screen.getByText('Trigger 2');
    const content1 = screen.getByText('Content 1');
    const content2 = screen.getByText('Content 2');

    // Open first item
    await user.click(trigger1);
    expect(content1).toBeVisible();

    // Open second item (first should remain open)
    await user.click(trigger2);
    expect(content1).toBeVisible();
    expect(content2).toBeVisible();
  });

  it('only allows one item open when type is single', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText('Trigger 1');
    const trigger2 = screen.getByText('Trigger 2');
    const content1 = screen.getByText('Content 1');
    const content2 = screen.getByText('Content 2');

    // Open first item
    await user.click(trigger1);
    expect(content1).toBeVisible();
    expect(content2).not.toBeVisible();

    // Open second item (first should close)
    await user.click(trigger2);
    expect(content1).not.toBeVisible();
    expect(content2).toBeVisible();
  });

  it('respects defaultValue prop', () => {
    render(
      <Accordion type="single" defaultValue="item-2">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const content1 = screen.getByText('Content 1');
    const content2 = screen.getByText('Content 2');

    expect(content1).not.toBeVisible();
    expect(content2).toBeVisible();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText('Trigger 1');

    // Focus first trigger
    trigger1.focus();
    expect(trigger1).toHaveFocus();

    // Press Enter to expand
    await user.keyboard('{Enter}');
    expect(screen.getByText('Content 1')).toBeVisible();

    // Press Space to collapse
    await user.keyboard(' ');
    expect(screen.getByText('Content 1')).not.toBeVisible();
  });

  it('has correct ARIA attributes', () => {
    render(
      <Accordion type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText('Trigger');
    
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  it('applies custom className', () => {
    render(
      <Accordion type="single" className="custom-accordion">
        <AccordionItem value="item-1" className="custom-item">
          <AccordionTrigger className="custom-trigger">Trigger</AccordionTrigger>
          <AccordionContent className="custom-content">Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const accordion = document.querySelector('.custom-accordion');
    const item = document.querySelector('.custom-item');
    const trigger = document.querySelector('.custom-trigger');
    const content = document.querySelector('.custom-content');

    expect(accordion).toBeInTheDocument();
    expect(item).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });
});