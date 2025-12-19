/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts for accessibility
 * Allows users to skip to main content, navigation, etc.
 */

import { Link } from 'react-router-dom';
import './SkipLinks.css';

const SkipLinks = () => {
  return (
    <div className="skip-links" role="navigation" aria-label="Enlaces de acceso rápido">
      <Link to="#main-content" className="skip-link">
        Saltar al contenido principal
      </Link>
      <Link to="#main-navigation" className="skip-link">
        Saltar a la navegación
      </Link>
      <Link to="#footer" className="skip-link">
        Saltar al pie de página
      </Link>
    </div>
  );
};

export default SkipLinks;

