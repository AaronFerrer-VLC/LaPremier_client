/**
 * ThemeToggle Component
 * Toggle para cambiar entre dark/light mode
 */

import { Button } from 'react-bootstrap'
import { useTheme } from '../../../contexts/ThemeContext'
import { FaMoon, FaSun } from 'react-icons/fa'
import './ThemeToggle.css'

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme, isDark } = useTheme()

    return (
        <Button
            variant="outline"
            onClick={toggleTheme}
            className={`theme-toggle ${className}`}
            aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
            title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
        >
            {isDark ? (
                <FaSun className="theme-toggle-icon" />
            ) : (
                <FaMoon className="theme-toggle-icon" />
            )}
            <span className="theme-toggle-text">
                {isDark ? 'Claro' : 'Oscuro'}
            </span>
        </Button>
    )
}

export default ThemeToggle

