/**
 * Modal Component
 * Modal reutilizable del sistema de diseño
 * 
 * @param {boolean} show - Mostrar/ocultar modal
 * @param {Function} onHide - Función para cerrar modal
 * @param {string} title - Título del modal
 * @param {ReactNode} children - Contenido del modal
 * @param {string} size - Tamaño: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} centered - Centrar modal verticalmente
 * @param {boolean} backdrop - Mostrar backdrop (true, false, 'static')
 */

import { Modal as BSModal, Button } from 'react-bootstrap'
import './Modal.css'

const Modal = ({ 
    show,
    onHide,
    title = '',
    children,
    size = 'md',
    centered = true,
    backdrop = 'static',
    footer = null,
    className = '',
    ...props 
}) => {
    return (
        <BSModal
            show={show}
            onHide={onHide}
            size={size}
            centered={centered}
            backdrop={backdrop}
            className={`design-system-modal ${className}`}
            {...props}
        >
            {title && (
                <BSModal.Header closeButton className="design-system-modal-header">
                    <BSModal.Title className="design-system-modal-title">
                        {title}
                    </BSModal.Title>
                </BSModal.Header>
            )}
            <BSModal.Body className="design-system-modal-body">
                {children}
            </BSModal.Body>
            {footer && (
                <BSModal.Footer className="design-system-modal-footer">
                    {footer}
                </BSModal.Footer>
            )}
        </BSModal>
    )
}

export default Modal

