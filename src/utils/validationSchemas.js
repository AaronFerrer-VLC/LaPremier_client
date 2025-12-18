/**
 * Validation Schemas
 * Reusable Yup validation schemas for forms
 */

import * as yup from 'yup';

/**
 * Login form validation schema
 */
export const loginSchema = yup.object({
  user: yup
    .string()
    .required('El usuario es obligatorio')
    .min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(3, 'La contraseña debe tener al menos 3 caracteres'),
});

/**
 * Cinema form validation schema
 */
export const cinemaSchema = yup.object({
  name: yup
    .string()
    .required('El nombre del cine es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  url: yup
    .string()
    .url('Debe ser una URL válida')
    .required('La URL es obligatoria'),
  address: yup.object({
    street: yup.string().required('La calle es obligatoria'),
    city: yup.string().required('La ciudad es obligatoria'),
    zipcode: yup
      .number()
      .typeError('El código postal debe ser un número')
      .required('El código postal es obligatorio')
      .positive('El código postal debe ser positivo'),
    country: yup.string().required('El país es obligatorio'),
  }),
  price: yup.object({
    regular: yup
      .number()
      .typeError('El precio debe ser un número')
      .required('El precio regular es obligatorio')
      .min(0, 'El precio no puede ser negativo'),
    weekend: yup
      .number()
      .typeError('El precio debe ser un número')
      .required('El precio de fin de semana es obligatorio')
      .min(0, 'El precio no puede ser negativo'),
    special: yup
      .number()
      .typeError('El precio debe ser un número')
      .required('El precio especial es obligatorio')
      .min(0, 'El precio no puede ser negativo'),
  }),
  capacity: yup.object({
    dicerooms: yup
      .number()
      .typeError('Debe ser un número')
      .required('El número de salas es obligatorio')
      .min(1, 'Debe tener al menos 1 sala')
      .integer('Debe ser un número entero'),
    seating: yup
      .number()
      .typeError('Debe ser un número')
      .required('El aforo es obligatorio')
      .min(1, 'El aforo debe ser al menos 1')
      .integer('Debe ser un número entero'),
  }),
});

/**
 * Movie form validation schema
 */
export const movieSchema = yup.object({
  title: yup.object({
    spanish: yup
      .string()
      .required('El título en español es obligatorio')
      .min(2, 'El título debe tener al menos 2 caracteres'),
    original: yup
      .string()
      .required('El título original es obligatorio')
      .min(2, 'El título debe tener al menos 2 caracteres'),
  }),
  duration: yup
    .number()
    .typeError('La duración debe ser un número')
    .required('La duración es obligatoria')
    .min(1, 'La duración debe ser al menos 1 minuto')
    .integer('Debe ser un número entero'),
  country: yup.string().required('El país es obligatorio'),
  language: yup.string().required('El idioma es obligatorio'),
  gender: yup
    .array()
    .of(yup.string())
    .min(1, 'Debe seleccionar al menos un género')
    .required('El género es obligatorio'),
  calification: yup
    .string()
    .required('La calificación es obligatoria')
    .oneOf(['TP', '7', '12', '16', '18'], 'Calificación inválida'),
  poster: yup
    .string()
    .url('Debe ser una URL válida')
    .required('El poster es obligatorio'),
  trailer: yup
    .string()
    .url('Debe ser una URL válida')
    .required('El trailer es obligatorio'),
});

/**
 * Review form validation schema
 */
export const reviewSchema = yup.object({
  user: yup
    .string()
    .required('El nombre de usuario es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  rating: yup
    .number()
    .typeError('La calificación debe ser un número')
    .required('La calificación es obligatoria')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .integer('Debe ser un número entero'),
  comment: yup
    .string()
    .required('El comentario es obligatorio')
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(500, 'El comentario no puede exceder 500 caracteres'),
});

