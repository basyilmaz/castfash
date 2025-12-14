import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppInput } from '@/components/ui/AppInput';

describe('AppInput', () => {
    it('renders input with label', () => {
        render(<AppInput label="Email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('handles value changes', () => {
        const handleChange = jest.fn();
        render(<AppInput label="Email" onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test@example.com' } });

        expect(handleChange).toHaveBeenCalled();
    });

    it('displays error message', () => {
        render(<AppInput label="Email" error="Invalid email format" />);
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    it('displays hint text', () => {
        render(<AppInput label="Email" hint="Enter your email address" />);
        expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<AppInput label="Email" disabled />);
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('renders with placeholder', () => {
        render(<AppInput label="Email" placeholder="Enter email" />);
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('applies different input types', () => {
        const { rerender } = render(<AppInput label="Password" type="password" />);
        expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');

        rerender(<AppInput label="Email" type="email" />);
        expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');

        rerender(<AppInput label="Number" type="number" />);
        expect(screen.getByLabelText('Number')).toHaveAttribute('type', 'number');
    });

    it('applies required attribute', () => {
        render(<AppInput label="Email" required />);
        expect(screen.getByRole('textbox')).toBeRequired();
    });
});
