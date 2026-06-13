import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

type AppButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';

interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  appVariant?: AppButtonVariant;
}

const variantMap: Record<AppButtonVariant, ButtonProps['variant']> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  danger: 'danger',
  outline: 'outline-primary',
  ghost: 'link',
};

/**
 * Shared button wrapper that keeps action styling consistent across the app.
 *
 * @param props React Bootstrap button props plus appVariant.
 * @returns A normalized Bootstrap button.
 */
export default function AppButton({ appVariant = 'primary', className = '', ...props }: AppButtonProps) {
  return (
    <Button
      {...props}
      variant={variantMap[appVariant]}
      className={`rounded-pill px-4 ${className}`.trim()}
    />
  );
}
