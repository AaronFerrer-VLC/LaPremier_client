import { useState } from "react"
import PropTypes from "prop-types"
import { Button, ButtonGroup, Form, Row, Col } from "react-bootstrap"
import { FaStar } from "react-icons/fa"

const NewMovieReviewForm = ({ onAddReview, onCloseModal }) => {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(null)
    const [comment, setComment] = useState("")
    const [userName, setUserName] = useState("")
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}
        if (!userName) newErrors.userName = "El nombre es obligatorio."
        if (!rating) newErrors.rating = "Por favor, selecciona una calificación."
        if (!comment) newErrors.comment = "El comentario no puede estar vacío."
        return newErrors
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
        } else {
            const newReview = { rating, comment, user: userName }
            onAddReview(newReview)
            setRating(0)
            setComment("")
            setUserName("")
            setErrors({})
            onCloseModal()
        }
    }

    return (

        <Row>

            <Col>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="userName" className="mb-3">
                        <Form.Label><strong>Tu Nombre</strong></Form.Label>
                        <Form.Control
                            type="text"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Ingresa tu nombre"
                        />
                        {errors.userName && <small className="text-danger">{errors.userName}</small>}
                    </Form.Group>

                    <Form.Group controlId="rating" className="mb-3">
                        <Form.Label><strong>Calificación Película</strong></Form.Label>
                        <div>
                            {[...Array(5)].map((_, index) => (
                                <FaStar
                                    key={index}
                                    onClick={() => setRating(index + 1)}
                                    onMouseEnter={() => setHoverRating(index + 1)}
                                    onMouseLeave={() => setHoverRating(null)}
                                    color={(hoverRating || rating) > index ? "#ffb400" : "#e4e5e9"}
                                    style={{ cursor: "pointer", marginRight: "5px", fontSize: "1.5rem" }}
                                />
                            ))}
                        </div>
                        {errors.rating && <small className="text-danger">{errors.rating}</small>}
                    </Form.Group>

                    <Form.Group controlId="comment" className="mb-3">
                        <Form.Label><strong>Comentario Película</strong></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Escribe tu comentario"
                        />
                        {errors.comment && <small className="text-danger">{errors.comment}</small>}
                    </Form.Group>
                    <ButtonGroup size="sm">
                        <Button type="submit" variant="primary" size="md" className="mt-3">
                            Enviar Comentario
                        </Button>

                    </ButtonGroup>
                </Form>
            </Col>
        </Row>
    )
}

NewMovieReviewForm.propTypes = {
    onAddReview: PropTypes.func.isRequired,
    onCloseModal: PropTypes.func.isRequired
}

export default NewMovieReviewForm
