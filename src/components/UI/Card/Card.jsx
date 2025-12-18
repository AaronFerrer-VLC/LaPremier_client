/**
 * Card Component
 * Card reutilizable del sistema de diseño
 * 
 * @param {string} variant - Variante de la card: 'base', 'elevated', 'outlined'
 * @param {ReactNode} children - Contenido de la card
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} hover - Activar efecto hover (default: true)
 */

import { Card as BSCard } from 'react-bootstrap'
import './Card.css'

const Card = ({ 
    variant = 'base', 
    children, 
    className = '',
    hover = true,
    ...props 
}) => {
    const baseClass = 'design-system-card'
    const variantClass = `card-${variant}`
    const hoverClass = hover ? 'card-hover' : ''
    
    return (
        <BSCard
            className={`${baseClass} ${variantClass} ${hoverClass} ${className}`}
            {...props}
        >
            {children}
        </BSCard>
    )
}

// Agregar subcomponentes de react-bootstrap Card
Card.Body = BSCard.Body
Card.Img = BSCard.Img
Card.Title = BSCard.Title
Card.Text = BSCard.Text
Card.Header = BSCard.Header
Card.Footer = BSCard.Footer
Card.Link = BSCard.Link
Card.Subtitle = BSCard.Subtitle

export default Card

