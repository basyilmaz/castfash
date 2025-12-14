import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppBadge } from '@/components/ui/AppBadge';

describe('AppBadge', () => {
    it('renders badge with children', () => {
        render(<AppBadge>Active</AppBadge>);
        expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('applies variant styles', () => {
        const { rerender } = render(<AppBadge variant="success">Success</AppBadge>);
        expect(screen.getByText('Success')).toBeInTheDocument();

        rerender(<AppBadge variant="danger">Danger</AppBadge>);
        expect(screen.getByText('Danger')).toBeInTheDocument();

        rerender(<AppBadge variant="warning">Warning</AppBadge>);
        expect(screen.getByText('Warning')).toBeInTheDocument();

        rerender(<AppBadge variant="info">Info</AppBadge>);
        expect(screen.getByText('Info')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        render(<AppBadge className="custom-class">Badge</AppBadge>);
        expect(screen.getByText('Badge')).toHaveClass('custom-class');
    });

    it('renders with default variant', () => {
        render(<AppBadge>Default</AppBadge>);
        expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('renders small size', () => {
        render(<AppBadge size="sm">Small</AppBadge>);
        expect(screen.getByText('Small')).toBeInTheDocument();
    });
});
