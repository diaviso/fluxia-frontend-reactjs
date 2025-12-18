interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  children,
  hint,
}) => {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={styles.hint}>{hint}</span>}
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input: React.FC<InputProps> = ({ hasError, style, ...props }) => {
  return (
    <input
      style={{
        ...styles.input,
        ...(hasError ? styles.inputError : {}),
        ...style,
      }}
      {...props}
    />
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  hasError,
  options,
  placeholder,
  style,
  ...props
}) => {
  return (
    <select
      style={{
        ...styles.input,
        ...styles.select,
        ...(hasError ? styles.inputError : {}),
        ...style,
      }}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ hasError, style, ...props }) => {
  return (
    <textarea
      style={{
        ...styles.input,
        ...styles.textarea,
        ...(hasError ? styles.inputError : {}),
        ...style,
      }}
      {...props}
    />
  );
};

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label style={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={styles.checkbox}
      />
      <span style={styles.checkboxCustom}>
        {checked && <span style={styles.checkmark}>✓</span>}
      </span>
      <span style={styles.checkboxText}>{label}</span>
    </label>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  required: {
    color: '#ef4444',
    marginLeft: '4px',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#1e293b',
    background: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  inputError: {
    borderColor: '#ef4444',
    background: '#fef2f2',
  },
  select: {
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '20px',
    paddingRight: '44px',
  },
  textarea: {
    minHeight: '100px',
    resize: 'vertical',
  },
  hint: {
    fontSize: '12px',
    color: '#64748b',
  },
  error: {
    fontSize: '12px',
    color: '#ef4444',
    fontWeight: '500',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  checkbox: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  checkboxCustom: {
    width: '22px',
    height: '22px',
    border: '2px solid #e2e8f0',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    transition: 'all 0.2s ease',
  },
  checkmark: {
    color: '#6366f1',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#374151',
  },
};

export default FormField;
