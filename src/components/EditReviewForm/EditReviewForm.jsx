import { useState, useEffect } from "react"
import { ButtonGroup, Form, Row, Col } from "react-bootstrap"
import { FaStar } from "react-icons/fa"
import { reviewsService } from "../../services/reviews.service"
import { notifyError, notifySuccess } from "../../utils/notifications"
import logger from "../../utils/logger"
import { Button, Input } from "../UI"
import { Spinner } from "../UI"

const EditReviewForm = ({ reviewToEdit, setShowEditReviewModal, updateReview }) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(null)
    const [comment, setComment] = useState("")
    const [userName, setUserName] = useState("")
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validateForm = () => {
        const newErrors = {}
        if (!userName) newErrors.userName = "El nombre es obligatorio."
        if (!rating) newErrors.rating = "Por favor, selecciona una calificación."
        if (!comment) newErrors.comment = "El comentario no puede estar vacío."
        return newErrors
    }

    useEffect(() => {
        if (reviewToEdit) {
            setRating(reviewToEdit.rating || 0)
            setComment(reviewToEdit.comment || "")
            setUserName(reviewToEdit.user || reviewToEdit.userName || "")
        }
    }, [reviewToEdit])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validateForm()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSubmitting(true)
        try {
            const reqPayload = {
                rating,
                comment,
                user: userName,
                userName: userName, // Mantener compatibilidad
                movieId: reviewToEdit?.movieId
            }

            await reviewsService.update(reviewToEdit.id, reqPayload)
            notifySuccess('Reseña actualizada correctamente')
            logger.info('Review updated successfully', { reviewId: reviewToEdit.id }, 'EditReviewForm')
            
            // Llamar a updateReview con el formato esperado
            updateReview({ ...reqPayload, id: reviewToEdit.id })
            setShowEditReviewModal(false)
        } catch (error) {
            logger.error('Failed to update review', error, 'EditReviewForm')
            notifyError('Error al actualizar la reseña')
        } finally {
            setIsSubmitting(false)
        }
    }
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center p-5">
                <Spinner variant="primary" size="lg" />
            </div>
        )
    }

    return (
        <div className="NewEditMovieReviewForm">
            <Row>
                <Col>
                    <Form onSubmit={handleSubmit}>
                        <Input
                            label="Tu Nombre"
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Ingresa tu nombre"
                            error={!!errors.userName}
                            errorMessage={errors.userName}
                            className="mb-3"
                            disabled={isSubmitting}
                            aria-label="Nombre del usuario"
                        />

                        <Form.Group controlId="rating" className="mb-3">
                            <Form.Label><strong>Calificación Película</strong></Form.Label>
                            <div 
                                role="radiogroup" 
                                aria-label="Calificación de la película"
                                aria-required="true"
                            >
                                {[...Array(5)].map((_, index) => {
                                    const currentRating = index + 1
                                    const isSelected = (hoverRating || rating) >= currentRating
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setRating(currentRating)}
                                            onMouseEnter={() => setHoverRating(currentRating)}
                                            onMouseLeave={() => setHoverRating(null)}
                                            aria-label={`Calificación ${currentRating} de 5`}
                                            aria-pressed={rating === currentRating}
                                            disabled={isSubmitting}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: '0',
                                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                marginRight: '5px'
                                            }}
                                        >
                                            <FaStar
                                                color={isSelected ? "#ffb400" : "#e4e5e9"}
                                                style={{ fontSize: "1.5rem" }}
                                                aria-hidden="true"
                                            />
                                        </button>
                                    )
                                })}
                            </div>
                            {errors.rating && (
                                <small className="text-danger" role="alert">
                                    {errors.rating}
                                </small>
                            )}
                        </Form.Group>

                        <Form.Group controlId="comment" className="mb-3">
                            <Form.Label><strong>Comentario Película</strong></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Escribe tu comentario"
                                isInvalid={!!errors.comment}
                                disabled={isSubmitting}
                                aria-label="Comentario de la película"
                                aria-required="true"
                            />
                            {errors.comment && (
                                <Form.Control.Feedback type="invalid" role="alert">
                                    {errors.comment}
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        <ButtonGroup size="sm">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                size="md" 
                                className="mt-3"
                                disabled={isSubmitting}
                                aria-label="Actualizar comentario"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner size="sm" variant="white" className="me-2" />
                                        Actualizando...
                                    </>
                                ) : (
                                    "Actualizar Comentario"
                                )}
                            </Button>
                        </ButtonGroup>
                    </Form>
                </Col>
            </Row>
        </div>
    )
}
export default EditReviewForm