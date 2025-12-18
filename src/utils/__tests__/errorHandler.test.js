import { describe, it, expect } from 'vitest'
import { formatErrorMessage } from '../errorHandler'

describe('errorHandler', () => {
  describe('formatErrorMessage', () => {
    it('should return default message for null/undefined error', () => {
      expect(formatErrorMessage(null)).toBe('Ha ocurrido un error desconocido')
      expect(formatErrorMessage(undefined)).toBe('Ha ocurrido un error desconocido')
    })

    it('should handle axios response errors', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      }
      expect(formatErrorMessage(error)).toBe('Not found')
    })

    it('should handle 404 status code', () => {
      const error = {
        response: {
          status: 404,
          data: {}
        }
      }
      expect(formatErrorMessage(error)).toBe('Recurso no encontrado')
    })

    it('should handle 401 status code', () => {
      const error = {
        response: {
          status: 401,
          data: {}
        }
      }
      expect(formatErrorMessage(error)).toBe('No autorizado. Por favor, inicia sesión')
    })

    it('should handle 403 status code', () => {
      const error = {
        response: {
          status: 403,
          data: {}
        }
      }
      expect(formatErrorMessage(error)).toBe('Acceso denegado')
    })

    it('should handle 500+ status codes', () => {
      const error = {
        response: {
          status: 500,
          data: {}
        }
      }
      expect(formatErrorMessage(error)).toBe('Error del servidor. Por favor, intenta más tarde')
    })

    it('should handle network errors', () => {
      const error = {
        request: {}
      }
      expect(formatErrorMessage(error)).toBe('Error de conexión. Verifica tu conexión a internet')
    })

    it('should handle generic errors', () => {
      const error = {
        message: 'Something went wrong'
      }
      expect(formatErrorMessage(error)).toBe('Something went wrong')
    })

    it('should handle errors without message', () => {
      const error = {}
      expect(formatErrorMessage(error)).toBe('Ha ocurrido un error inesperado')
    })
  })
})

