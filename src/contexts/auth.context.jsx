import { createContext, useState, useEffect } from "react"
import authService from "../services/auth.service"
import { safeGetItem, safeSetItem, safeRemoveItem } from "../utils/storage"

const AuthContext = createContext()

function AuthProviderWrapper(props) {
    // Initialize from localStorage if available
    const [loggedUser, setLoggedUser] = useState(() => {
        return safeGetItem('auth_user', null);
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
            safeSetItem('auth_user', loggedUser);
        } else {
            safeRemoveItem('auth_user');
            safeRemoveItem('auth_token');
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