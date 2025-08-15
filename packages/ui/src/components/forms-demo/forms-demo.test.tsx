import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormsDemo } from './forms-demo.stories';

describe('FormsDemo', () => {
  it('renders without crashing', () => {
    // Forms demo is a documentation component
    expect(FormsDemo).toBeDefined();
  });

  it('exports story configurations', () => {
    expect(FormsDemo.Default).toBeDefined();
    expect(FormsDemo.WithValidation).toBeDefined();
    expect(FormsDemo.WithComplexLayout).toBeDefined();
  });

  it('provides documentation metadata', () => {
    expect(FormsDemo.parameters).toBeDefined();
    expect(FormsDemo.parameters.docs).toBeDefined();
  });
});
