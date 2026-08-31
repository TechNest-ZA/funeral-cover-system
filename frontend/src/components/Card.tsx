import type { HTMLAttributes } from 'react';
import './ui.css';

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
