/**
 * Select Component
 * Select reutilizable del sistema de diseño
 * 
 * @param {string} variant - Variante del select: 'base', 'outlined'
 * @param {string} size - Tamaño: 'sm', 'md', 'lg'
 * @param {boolean} error - Mostrar estado de error
 * @param {string} errorMessage - Mensaje de error
 * @param {string} label - Label del select
 * @param {string} helperText - Texto de ayuda
 * @param {Array} options - Array de opciones {value, label}
 * @param {string} placeholder - Placeholder text
 */

import { Form } from 'react-bootstrap'
import './Select.css'

const Select = ({ 
    variant = 'base',
    size = 'md',
    error = false,
    errorMessage = '',
    label = '',
    helperText = '',
    options = [],
    placeholder = 'Selecciona una opción',
    className = '',
    ...props 
}) => {
    const baseClass = 'design-system-select'
    const variantClass = `select-${variant}`
    const sizeClass = `select-${size}`
    const errorClass = error ? 'select-error' : ''
    
    return (
        <Form.Group className={`design-system-select-group ${className}`}>
            {label && (
                <Form.Label className="design-system-select-label">
                    {label}
                </Form.Label>
            )}
            <Form.Select
                className={`${baseClass} ${variantClass} ${sizeClass} ${errorClass}`}
                isInvalid={error}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option, index) => (
                    <option key={option.value || index} value={option.value}>
                        {option.label || option}
                    </option>
                ))}
            </Form.Select>
            {error && errorMessage && (
                <Form.Control.Feedback type="invalid" className="design-system-select-error">
                    {errorMessage}
                </Form.Control.Feedback>
            )}
            {!error && helperText && (
                <Form.Text className="design-system-select-helper">
                    {helperText}
                </Form.Text>
            )}
        </Form.Group>
    )
}

export default Select

