/**
 * Theme Context
 * Contexto para manejar el tema (dark/light mode)
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { safeGetItem, safeSetItem } from '../utils/storage'

const ThemeContext = createContext()

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}

export const ThemeProvider = ({ children }) => {
    // Leer preferencia guardada o usar dark por defecto
    const [theme, setTheme] = useState(() => {
        return safeGetItem('theme', 'dark');
    })

    // Aplicar tema al documento
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        safeSetItem('theme', theme)
    }, [theme])

    // Detectar preferencia del sistema
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
        const handleChange = (e) => {
            // Solo aplicar si no hay tema guardado
            if (!safeGetItem('theme')) {
                setTheme(e.matches ? 'light' : 'dark')
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
    }

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
        isLight: theme === 'light',
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

