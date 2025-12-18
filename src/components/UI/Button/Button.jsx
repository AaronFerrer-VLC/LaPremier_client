/**
 * Button Component
 * Botón reutilizable del sistema de diseño
 * 
 * @param {string} variant - Variante del botón: 'primary', 'secondary', 'outline', 'accent'
 * @param {string} size - Tamaño del botón: 'sm', 'md', 'lg'
 * @param {ReactNode} children - Contenido del botón
 * @param {string} className - Clases CSS adicionales
 */

import { Button as BSButton } from 'react-bootstrap'
import './Button.css'

const Button = ({ 
    variant = 'primary', 
    size = 'md',
    children, 
    className = '',
    ...props 
}) => {
    const baseClass = 'design-system-btn'
    const variantClass = `btn-${variant}`
    const sizeClass = `btn-${size}`
    
    return (
        <BSButton
            className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </BSButton>
    )
}

export default Button

