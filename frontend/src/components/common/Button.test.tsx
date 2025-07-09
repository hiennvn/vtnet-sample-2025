import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByTestId('custom-button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the correct variant class', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByTestId('custom-button');
    expect(button.classList.contains('secondary')).toBe(true);
  });

  it('disables the button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByTestId('custom-button')).toBeDisabled();
  });
}); 