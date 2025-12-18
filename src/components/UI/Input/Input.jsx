/**
 * Input Component
 * Input reutilizable del sistema de diseño con validación visual
 * 
 * @param {string} variant - Variante del input: 'base', 'outlined'
 * @param {string} type - Tipo de input (text, email, password, etc.)
 * @param {string} size - Tamaño: 'sm', 'md', 'lg'
 * @param {boolean} error - Mostrar estado de error
 * @param {string} errorMessage - Mensaje de error
 * @param {string} label - Label del input
 * @param {string} helperText - Texto de ayuda
 */

import { Form } from 'react-bootstrap'
import './Input.css'

const Input = ({ 
    variant = 'base',
    type = 'text',
    size = 'md',
    error = false,
    errorMessage = '',
    label = '',
    helperText = '',
    className = '',
    ...props 
}) => {
    const baseClass = 'design-system-input'
    const variantClass = `input-${variant}`
    const sizeClass = `input-${size}`
    const errorClass = error ? 'input-error' : ''
    
    return (
        <Form.Group className={`design-system-input-group ${className}`}>
            {label && (
                <Form.Label className="design-system-input-label">
                    {label}
                </Form.Label>
            )}
            <Form.Control
                type={type}
                className={`${baseClass} ${variantClass} ${sizeClass} ${errorClass}`}
                isInvalid={error}
                {...props}
            />
            {error && errorMessage && (
                <Form.Control.Feedback type="invalid" className="design-system-input-error">
                    {errorMessage}
                </Form.Control.Feedback>
            )}
            {!error && helperText && (
                <Form.Text className="design-system-input-helper">
                    {helperText}
                </Form.Text>
            )}
        </Form.Group>
    )
}

export default Input

