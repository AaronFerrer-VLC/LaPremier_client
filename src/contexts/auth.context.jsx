import { createContext, useState, useEffect } from "react"
import { STORAGE_KEYS } from "../config/constants"
import authService from "../services/auth.service"

const AuthContext = createContext()

function AuthProviderWrapper(props) {
    // Initialize from localStorage if available
    const [loggedUser, setLoggedUser] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
        return stored ? JSON.parse(stored) : null
    })

    // Verify token on mount and periodically
    useEffect(() => {
        const verifyAuth = async () => {
            if (authService.isAuthenticated()) {
                try {
                    // Optionally verify token with backend
                    // const user = await authService.getCurrentUser()
                    // setLoggedUser(user)
                } catch (error) {
                    // Token invalid, logout
                    logout()
                }
            }
        }

        verifyAuth()
    }, [])

    // Persist to localStorage when loggedUser changes
    useEffect(() => {
        if (loggedUser) {
            localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(loggedUser))
        } else {
            localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        }
    }, [loggedUser])

    const login = (userData) => {
        setLoggedUser(userData)
    }

    const logout = () => {
        authService.logout()
        setLoggedUser(null)
    }

    const value = {
        loggedUser,
        setLoggedUser,
        login,
        logout,
        isAuthenticated: !!loggedUser
    }

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProviderWrapper }