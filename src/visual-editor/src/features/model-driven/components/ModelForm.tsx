/**
 * Dynamic form component for editing model properties
 */

import { useState } from 'react';
import type { FormField, ModelForm as ModelFormConfig } from '../types';

interface ModelFormProps {
  config: ModelFormConfig;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function ModelForm({ config, data, onChange }: ModelFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldName: string, value: unknown) => {
    const newData = { ...data, [fieldName]: value };
    onChange(newData);

    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateField = (field: FormField, value: unknown): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} is required`;
    }

    if (field.validation && value) {
      const { min, max, pattern } = field.validation;
      const stringValue = String(value);

      if (min !== undefined && stringValue.length < min) {
        return `${field.label} must be at least ${min} characters`;
      }

      if (max !== undefined && stringValue.length > max) {
        return `${field.label} must be no more than ${max} characters`;
      }

      if (pattern && !new RegExp(pattern).test(stringValue)) {
        return `${field.label} format is invalid`;
      }
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {config.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-gray-900">
              {section.title}
            </h3>
            {section.description && (
              <p className="text-sm text-gray-600 mt-1">
                {section.description}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {section.fields.map(field => (
              <FormFieldComponent
                key={field.name}
                field={field}
                value={data[field.name]}
                error={errors[field.name]}
                onChange={value => handleFieldChange(field.name, value)}
                onValidate={value => {
                  const error = validateField(field, value);
                  if (error) {
                    setErrors(prev => ({ ...prev, [field.name]: error }));
                  }
                  return error;
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface FormFieldComponentProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onValidate: (value: unknown) => string | null;
}

function FormFieldComponent({
  field,
  value,
  error,
  onChange,
  onValidate,
}: FormFieldComponentProps) {
  const handleChange = (newValue: unknown) => {
    onChange(newValue);
    onValidate(newValue);
  };

  const fieldId = `field-${field.name}`;
  const hasError = Boolean(error);

  const baseInputClasses = `block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    hasError
      ? 'border-red-300 focus:border-red-500'
      : 'border-gray-300 focus:border-transparent'
  }`;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            id={fieldId}
            type="text"
            value={String(value || '')}
            placeholder={field.placeholder}
            onChange={e => handleChange(e.target.value)}
            className={baseInputClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={String(value || '')}
            placeholder={field.placeholder}
            rows={4}
            onChange={e => handleChange(e.target.value)}
            className={baseInputClasses}
          />
        );

      case 'number':
        return (
          <input
            id={fieldId}
            type="number"
            value={Number(value || 0)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            onChange={e => handleChange(Number(e.target.value))}
            className={baseInputClasses}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              id={fieldId}
              type="checkbox"
              checked={Boolean(value)}
              onChange={e => handleChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={fieldId} className="ml-2 text-sm text-gray-700">
              {field.description || 'Enable this option'}
            </label>
          </div>
        );

      case 'select':
        return (
          <select
            id={fieldId}
            value={String(value || '')}
            onChange={e => handleChange(e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Select an option...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'array':
        return (
          <ArrayField
            value={Array.isArray(value) ? value : []}
            onChange={handleChange}
            placeholder={field.placeholder}
          />
        );

      case 'object':
        return (
          <ObjectField
            value={
              typeof value === 'object' && value !== null
                ? (value as Record<string, unknown>)
                : {}
            }
            onChange={handleChange}
          />
        );

      default:
        return (
          <input
            id={fieldId}
            type="text"
            value={String(value || '')}
            placeholder={field.placeholder}
            onChange={e => handleChange(e.target.value)}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {renderField()}

      {field.description && field.type !== 'boolean' && (
        <p className="text-xs text-gray-500 mt-1">{field.description}</p>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

interface ArrayFieldProps {
  value: unknown[];
  onChange: (value: unknown[]) => void;
  placeholder?: string;
}

function ArrayField({ value, onChange, placeholder }: ArrayFieldProps) {
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    if (inputValue.trim()) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder || 'Add item...'}
          onChange={e => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={!inputValue.trim()}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {value.length > 0 && (
        <div className="space-y-1">
          {value.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
            >
              <span className="text-sm">{String(item)}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ObjectFieldProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

function ObjectField({ value, onChange }: ObjectFieldProps) {
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');

  const addProperty = () => {
    if (keyInput.trim() && valueInput.trim()) {
      onChange({
        ...value,
        [keyInput.trim()]: valueInput.trim(),
      });
      setKeyInput('');
      setValueInput('');
    }
  };

  const removeProperty = (key: string) => {
    const newValue = { ...value };
    delete newValue[key];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={keyInput}
          placeholder="Property name..."
          onChange={e => setKeyInput(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex space-x-2">
          <input
            type="text"
            value={valueInput}
            placeholder="Property value..."
            onChange={e => setValueInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addProperty}
            disabled={!keyInput.trim() || !valueInput.trim()}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {Object.keys(value).length > 0 && (
        <div className="space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
            >
              <span className="text-sm">
                <span className="font-medium">{key}:</span> {String(val)}
              </span>
              <button
                type="button"
                onClick={() => removeProperty(key)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
