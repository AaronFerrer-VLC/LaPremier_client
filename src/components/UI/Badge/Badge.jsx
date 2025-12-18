/**
 * Badge Component
 * Badge reutilizable del sistema de diseño
 * 
 * @param {string} variant - Variante del badge: 'light', 'medium', 'dark', 'accent'
 * @param {ReactNode} children - Contenido del badge
 * @param {string} className - Clases CSS adicionales
 */

import { Badge as BSBadge } from 'react-bootstrap'
import './Badge.css'

const Badge = ({ 
    variant = 'light', 
    children, 
    className = '',
    ...props 
}) => {
    const baseClass = 'design-system-badge'
    const variantClass = `badge-${variant}`
    
    return (
        <BSBadge
            className={`${baseClass} ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </BSBadge>
    )
}

export default Badge

