import React from 'react';
import styled from 'styled-components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

const StyledButton = styled.button<ButtonProps>`
  padding: ${props => {
    switch (props.size) {
      case 'small': return '4px 8px';
      case 'large': return '12px 24px';
      default: return '8px 16px';
    }
  }};
  border: none;
  border-radius: 4px;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '0.875rem';
      case 'large': return '1.125rem';
      default: return '1rem';
    }
  }};
  cursor: pointer;
  transition: background-color 0.2s;

  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          &:hover:not(:disabled) {
            background: var(--bg-hover);
          }
        `;
      case 'danger':
        return `
          background: var(--danger-color);
          color: white;
          &:hover:not(:disabled) {
            background: var(--danger-color-hover);
          }
        `;
      default:
        return `
          background: var(--primary-color);
          color: white;
          &:hover:not(:disabled) {
            background: var(--primary-color-hover);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  ...props
}) => {
  return (
    <StyledButton variant={variant} size={size} {...props}>
      {children}
    </StyledButton>
  );
}; 