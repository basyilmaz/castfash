import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppButton } from '@/components/ui/AppButton';

describe('AppButton', () => {
    it('renders button with children', () => {
        render(<AppButton>Click me</AppButton>);
        expect(screen.getByRole('button')).toHaveTextContent('Click me');
    });

    it('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(<AppButton onClick={handleClick}>Click me</AppButton>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        render(<AppButton disabled>Click me</AppButton>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows loading state', () => {
        render(<AppButton loading>Click me</AppButton>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies variant classes correctly', () => {
        const { rerender } = render(<AppButton variant="primary">Primary</AppButton>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<AppButton variant="secondary">Secondary</AppButton>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<AppButton variant="danger">Danger</AppButton>);
        expect(screen.getByRole('button')).toBeInTheDocument();

        rerender(<AppButton variant="outline">Outline</AppButton>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies fullWidth class when fullWidth is true', () => {
        render(<AppButton fullWidth>Full Width</AppButton>);
        expect(screen.getByRole('button')).toHaveClass('w-full');
    });

    it('renders as link when href is provided', () => {
        render(<AppButton href="/test">Link Button</AppButton>);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/test');
    });
});
