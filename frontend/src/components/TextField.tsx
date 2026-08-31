import type { InputHTMLAttributes } from 'react';
import './ui.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  success?: boolean;
}

export function TextField({ label, error, hint, success, id, className = '', ...rest }: TextFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  const inputClass = [error ? 'has-error' : '', success ? 'has-success' : '', className].filter(Boolean).join(' ');
  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      <input id={fieldId} className={inputClass} {...rest} />
      {error && <div className="field-error">{error}</div>}
      {!error && hint && <div className={success ? 'field-hint field-hint-success' : 'field-hint'}>{hint}</div>}
    </div>
  );
}
