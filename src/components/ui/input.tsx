import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-red-500/80 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors duration-200 min-h-[100px] resize-y disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-red-500/80 focus:border-red-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
