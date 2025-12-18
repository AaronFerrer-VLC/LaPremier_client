/**
 * Spinner Component
 * Spinner reutilizable del sistema de diseño
 * 
 * @param {string} variant - Variante: 'primary', 'accent', 'white'
 * @param {string} size - Tamaño: 'sm', 'md', 'lg'
 * @param {string} animation - Tipo: 'border', 'grow'
 * @param {string} text - Texto a mostrar junto al spinner
 */

import { Spinner as BSSpinner } from 'react-bootstrap'
import './Spinner.css'

const Spinner = ({ 
    variant = 'primary',
    size = 'md',
    animation = 'border',
    text = '',
    className = '',
    ...props 
}) => {
    const baseClass = 'design-system-spinner'
    const variantClass = `spinner-${variant}`
    const sizeClass = `spinner-${size}`
    
    const SpinnerComponent = animation === 'grow' ? BSSpinner : BSSpinner
    
    return (
        <div className={`design-system-spinner-wrapper ${className}`}>
            <SpinnerComponent
                animation={animation}
                variant={variant}
                className={`${baseClass} ${variantClass} ${sizeClass}`}
                {...props}
            />
            {text && (
                <span className="design-system-spinner-text">
                    {text}
                </span>
            )}
        </div>
    )
}

export default Spinner

