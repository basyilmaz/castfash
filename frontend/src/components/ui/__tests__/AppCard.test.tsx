import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppCard } from '@/components/ui/AppCard';

describe('AppCard', () => {
    it('renders card with children', () => {
        render(
            <AppCard>
                <p>Card content</p>
            </AppCard>
        );
        expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <AppCard className="custom-class">Content</AppCard>
        );
        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders with onClick handler', () => {
        const handleClick = jest.fn();
        render(
            <AppCard onClick={handleClick}>Clickable Card</AppCard>
        );

        const card = screen.getByText('Clickable Card').parentElement;
        expect(card).toBeInTheDocument();
    });

    it('renders header when title prop is provided', () => {
        render(
            <AppCard title="Card Title">Content</AppCard>
        );
        expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders footer when footer prop is provided', () => {
        render(
            <AppCard footer={<button>Action</button>}>Content</AppCard>
        );
        expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('applies default styling', () => {
        const { container } = render(<AppCard>Content</AppCard>);
        const card = container.firstChild as HTMLElement;
        expect(card).toHaveClass('bg-card');
    });
});
