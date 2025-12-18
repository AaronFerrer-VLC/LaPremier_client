/**
 * Alert Component
 * Alert reutilizable del sistema de diseño
 * 
 * @param {string} variant - Variante: 'success', 'danger', 'warning', 'info'
 * @param {string} title - Título del alert (opcional)
 * @param {ReactNode} children - Contenido del alert
 * @param {boolean} dismissible - Permitir cerrar
 * @param {Function} onClose - Función al cerrar
 */

import { Alert as BSAlert } from 'react-bootstrap'
import './Alert.css'

const Alert = ({ 
    variant = 'info',
    title = '',
    children,
    dismissible = false,
    onClose,
    className = '',
    ...props 
}) => {
    const baseClass = 'design-system-alert'
    const variantClass = `alert-${variant}`
    
    return (
        <BSAlert
            variant={variant}
            dismissible={dismissible}
            onClose={onClose}
            className={`${baseClass} ${variantClass} ${className}`}
            {...props}
        >
            {title && (
                <BSAlert.Heading className="design-system-alert-heading">
                    {title}
                </BSAlert.Heading>
            )}
            {children}
        </BSAlert>
    )
}

export default Alert

