import { useEffect, useState } from "react"
import { Form, CloseButton, Row, Col } from 'react-bootstrap';
import { Button } from '../UI';
import Loader from "../Loader/Loader"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import logger from '../../utils/logger'

const API_URL = import.meta.env.VITE_APP_API_URL

const EditMovieForm = () => {

    const { movieId } = useParams()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [cinemas, setCinemas] = useState([])
    const [movieData, setMovieData] = useState({
        poster: '',
        country: '',
        language: '',
        duration: 0,
        gender: [''],
        calification: '',
        released: true,
        date: '',
        director: '',
        trailer: '',
        description: '',
        cinemaId: [''],
        casting: [{ name: '', photo: '' }]
    })

    useEffect(() => {
        fetchCinemas()
        fetchMovieData()
    }, [])

    const fetchCinemas = async () => {
        try {
            const response = await axios.get(`${API_URL}/cinemas`)
            setCinemas(response.data)
            setIsLoading(false)
        } catch (err) {
            logger.error('Failed to fetch cinemas', err, 'EditMovieForm')
            setIsLoading(false)
        }
    }

    const [title, setTitle] = useState({
        original: '',
        spanish: ''
    })

    const fetchMovieData = () => {
        axios
            .get(`${API_URL}/movies/${movieId}`)
            .then(response => {
                const { data: movieData } = response
                setMovieData(movieData)
                setTitle(movieData.title)
            })
    }

    const handleTitleChange = (e) => {
        const { name, value } = e.target
        setTitle({ ...title, [name]: value })
    }
    const handleCinemaChange = (e, idx) => {
        const { value } = e.target
        const cinemasCopy = [movieData.cinemaId]
        cinemasCopy[idx] = value
        const filteredCinemas = cinemasCopy.filter(cinema => cinema !== "")
        setMovieData({ ...movieData, cinemaId: filteredCinemas })
    }

    const handleMovieChange = (e) => {
        const { name, value, checked, type } = e.target;
        const result = type === 'checkbox' ? checked : value
        setMovieData({ ...movieData, [name]: result });
    }

    const handleGenderChange = (e, idx) => {
        const { value } = e.target
        const gendersCopy = [...movieData.gender]
        gendersCopy[idx] = value
        setMovieData({ ...movieData, gender: gendersCopy })
    }
    const handleCastingChange = (e, idx, field) => {
        const { value } = e.target
        const updatedCasting = [...movieData.casting]
        updatedCasting[idx][field] = value
        setMovieData({ ...movieData, casting: updatedCasting })
    }
    const addNewCinema = () => {
        setMovieData((prevData) => ({
            ...prevData,
            cinemaId: [...prevData.cinemaId, '']
        }));
    }

    const deletNewCinema = (idx) => {
        setMovieData((prevData) => {
            const cinemaIdCopy = [...prevData.cinemaId]
            cinemaIdCopy.splice(idx, 1)
            return { ...prevData, cinemaId: cinemaIdCopy }
        })
    }

    const addNewGender = () => {
        const gendersCopy = [...movieData.gender]
        gendersCopy.push('')
        setMovieData({ ...movieData, gender: gendersCopy })
    }

    const deletNewGender = () => {
        const gendersCopy = [...movieData.gender]
        gendersCopy.pop()
        setMovieData({ ...movieData, gender: gendersCopy })
    }

    const addNewCasting = () => {
        const updatedCasting = Array.isArray(movieData.casting) ? [...movieData.casting] : []
        updatedCasting.push({ name: '', photo: '' })
        setMovieData({ ...movieData, casting: updatedCasting })
    }
    const deletedNewCasting = (idx) => {
        const updatedCasting = [...movieData.casting]
        updatedCasting.splice(idx, 1)
        setMovieData({ ...movieData, casting: updatedCasting })

    }
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const reqPayload = {
            ...movieData,
            title: title
        }

        axios
            .put(`${API_URL}/movies/${movieId}`, reqPayload)
            .then(response => {
                logger.info('Movie updated successfully', { movieId: response.data.id }, 'EditMovieForm')
                navigate(`/peliculas/detalles/${response.data.id}`)
            })
            .catch(err => {
                logger.error('Failed to update movie', err, 'EditMovieForm')
            })
    }

    return (
        isLoading ? <Loader /> :
            <div className="EditMovieForm">

                <Row>
                    <Col md={{ span: 6, offset: 3 }}>
                        <Form className="form" onSubmit={handleFormSubmit}>
                            <Form.Group className="mb-3" controlId="titleField">
                                <Form.Label><strong>Títulos</strong></Form.Label>

                                <Form.Control className="mb-2"
                                    type="text"
                                    placeholder="Título Original"
                                    name="original"
                                    value={title.original}
                                    onChange={(e) => handleTitleChange(e)}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Título en España"
                                    name="spanish"
                                    value={title.spanish}
                                    onChange={(e) => handleTitleChange(e)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="posterField">
                                <Form.Label><strong>Imagen</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="poster"
                                    value={movieData.poster}
                                    onChange={handleMovieChange}
                                    placeholder="URL de la imagen"
                                />
                            </Form.Group>


                            <Form.Group className="mb-3" controlId="countryField">
                                <Form.Label><strong>País</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="country"
                                    value={movieData.country}
                                    onChange={handleMovieChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="languageField">
                                <Form.Label><strong>Idioma</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="language"
                                    value={movieData.language}
                                    onChange={handleMovieChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="durationField">
                                <Form.Label><strong>Duración</strong> (minutos)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="duration"
                                    value={movieData.duration}
                                    onChange={handleMovieChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="genderField">
                                <Form.Label><strong>Género</strong></Form.Label>
                                {
                                    movieData.gender?.map((eachGender, idx) => {
                                        return (
                                            <Form.Control
                                                className="mb-2"
                                                type="text"
                                                onChange={(event) => handleGenderChange(event, idx)}
                                                value={eachGender}
                                                key={idx}
                                            />
                                        )
                                    })
                                }

                                <Button variant="secondary" size="sm" className="me-2" onClick={addNewGender}>Añadir Género</Button>
                                <Button variant="secondary" size="sm" className="me-2" onClick={deletNewGender}>Quitar Género</Button>

                            </Form.Group>

                            <Form.Group className="mb-3" controlId="calificationField">
                                <Form.Label><strong>Calificación</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="calification"
                                    value={movieData.calification}
                                    onChange={handleMovieChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="dateField">
                                <Form.Label><strong>Fecha de estreno</strong></Form.Label>
                                <Form.Control
                                    type="date"
                                    name="date"
                                    value={movieData.date}
                                    onChange={handleMovieChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="directorField">
                                <Form.Label><strong>Director</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="director"
                                    value={movieData.director}
                                    onChange={handleMovieChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="castingField">
                                <Form.Label><strong>Casting</strong></Form.Label>
                                {movieData.casting?.map((eachCasting, idx) => (
                                    <div key={idx} className="d-flex align-items-center mb-3">
                                        <Form.Control
                                            type="text"
                                            placeholder="Nombre del actor"
                                            value={eachCasting.name}
                                            onChange={(event) =>
                                                handleCastingChange(event, idx, 'name')
                                            }
                                            className="me-2"
                                        />
                                        <Form.Control closeButton
                                            type="text"
                                            placeholder="URL de la foto"
                                            value={eachCasting.photo}
                                            onChange={(event) =>
                                                handleCastingChange(event, idx, 'photo')
                                            }
                                            className="me-2"
                                        />
                                        <CloseButton
                                            onClick={() => deletedNewCasting(idx)}
                                            className="ms-2"
                                        />
                                    </div>
                                ))}
                                <Button variant="secondary" size="sm" className="me-2" onClick={addNewCasting}> Añadir Actor</Button>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="trailerField">
                                <Form.Label><strong>Tráiler (URL)</strong></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="trailer"
                                    value={movieData.trailer}
                                    onChange={handleMovieChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="descriptionField">
                                <Form.Label><strong>Descripción</strong></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={movieData.description}
                                    onChange={handleMovieChange}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="cinemaField">
                                <Form.Label><strong>Cines</strong></Form.Label>
                                {movieData.cinemaId.map((eachCinema, idx) => (
                                    <Form.Control
                                        key={idx}
                                        as="select"
                                        value={eachCinema}
                                        onChange={(event) => handleCinemaChange(event, idx)}
                                        className="mb-2"
                                        disabled={true}
                                    >
                                        <option value="">Selecciona un cine</option>
                                        {cinemas.map((cinema) => (
                                            <option key={cinema.id} value={cinema.id}>
                                                {cinema.name}
                                            </option>
                                        ))}
                                    </Form.Control>
                                ))}
                                <Button disabled variant="secondary" size="sm" className="me-2" onClick={addNewCinema}>Añadir Cine</Button>
                                <Button disabled variant="secondary" size="sm" className="me-2" onClick={deletNewCinema}>Quitar Cine</Button>
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="releasedField">
                                <Form.Check
                                    type="checkbox"
                                    name="released"
                                    checked={movieData.released}
                                    onChange={handleMovieChange}
                                    label="¿Película lanzada?"
                                />
                            </Form.Group>

                            <div className="d-grid mt-5">
                                <Button variant="primary" size="lg" type="submit">
                                    Editar película
                                </Button>
                            </div>
                        </Form>

                    </Col>
                </Row>

            </div>
    )
}
export default EditMovieForm