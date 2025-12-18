import { Form } from "react-bootstrap"
import { useContext, useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { loginSchema } from "../../utils/validationSchemas"

import { AuthContext } from "../../contexts/auth.context"
import authService from "../../services/auth.service"
import { notifyError, notifySuccess } from "../../utils/notifications"
import logger from "../../utils/logger"
import { Button, Input } from "../UI"

const LoginForm = ({ setShowModal }) => {
    const { login } = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onBlur', // Validate on blur for better UX
    })

    const onSubmit = async (data) => {
        try {
            setIsLoading(true)
            const { user, password } = data

            // Call backend API for authentication
            const authData = await authService.login(user, password)
            
            // Update auth context
            login(authData.user)
            
            notifySuccess('Sesión iniciada correctamente')
            setShowModal(false)
            logger.info('User logged in successfully', { username: user }, 'LoginForm')
        } catch (error) {
            logger.error('Login error', error, 'LoginForm')
            const errorMessage = error.response?.data?.error?.message || 'Error al iniciar sesión'
            notifyError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="LoginForm">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label="Usuario"
                    type="text"
                    {...register('user')}
                    error={!!errors.user}
                    errorMessage={errors.user?.message}
                    disabled={isSubmitting}
                    className="mb-3"
                />

                <Input
                    label="Contraseña"
                    type="password"
                    {...register('password')}
                    error={!!errors.password}
                    errorMessage={errors.password?.message}
                    disabled={isSubmitting}
                    className="mb-3"
                />

                <div className="d-grid">
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Iniciando sesión...' : 'Acceder'}
                    </Button>
                </div>
            </Form>
        </div>
    )
}

export default LoginForm