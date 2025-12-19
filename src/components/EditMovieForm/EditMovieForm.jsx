import { useEffect, useState } from "react"
import { Form, CloseButton, Row, Col } from 'react-bootstrap';
import { Button } from '../UI';
import Loader from "../Loader/Loader"
import { useNavigate, useParams } from "react-router-dom"
import { useCinemas } from '../../hooks/useCinemas'
import { useMovie, useUpdateMovie } from '../../hooks/useMovies'
import { notifySuccess, notifyError } from '../../utils/notifications'
import logger from '../../utils/logger'
import { sanitizeString, sanitizeUrl, sanitizeNumber, sanitizeArray } from '../../utils/sanitize'

const EditMovieForm = () => {
    const { movieId } = useParams()
    const navigate = useNavigate()
    
    // Fetch cinemas using React Query
    const { data: cinemasData = [], isLoading: isLoadingCinemas } = useCinemas()
    const cinemas = cinemasData.filter(c => !c.isDeleted)
    
    // Fetch movie using React Query
    const { data: movie, isLoading: isLoadingMovie } = useMovie(movieId, {
        enabled: !!movieId && movieId !== 'undefined',
    })
    
    // Update movie mutation
    const updateMovieMutation = useUpdateMovie()
    
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

    const [title, setTitle] = useState({
        original: '',
        spanish: ''
    })

    // Initialize form data when movie loads
    useEffect(() => {
        if (movie) {
            setMovieData({
                poster: movie.poster || '',
                country: movie.country || '',
                language: movie.language || '',
                duration: movie.duration || 0,
                gender: Array.isArray(movie.gender) ? movie.gender : [''],
                calification: movie.calification || '',
                released: movie.released !== undefined ? movie.released : true,
                date: movie.date || '',
                director: movie.director || '',
                trailer: movie.trailer || '',
                description: movie.description || '',
                cinemaId: Array.isArray(movie.cinemaId) ? movie.cinemaId : [],
                casting: Array.isArray(movie.casting) && movie.casting.length > 0 
                    ? movie.casting 
                    : [{ name: '', photo: '' }]
            })
            setTitle(movie.title || { original: '', spanish: '' })
        }
    }, [movie])
    
    const isLoading = isLoadingCinemas || isLoadingMovie

    const handleTitleChange = (e) => {
        const { name, value } = e.target
        setTitle({ ...title, [name]: sanitizeString(value, { maxLength: 200 }) })
    }
    
    const handleCinemaChange = (e, idx) => {
        const { value } = e.target
        const cinemaId = sanitizeNumber(value, { integer: true })
        if (cinemaId === null) return
        
        const cinemasCopy = Array.isArray(movieData.cinemaId) ? [...movieData.cinemaId] : []
        cinemasCopy[idx] = cinemaId
        const filteredCinemas = cinemasCopy.filter(cinema => cinema !== "" && cinema !== null)
        setMovieData({ ...movieData, cinemaId: filteredCinemas })
    }

    const handleMovieChange = (e) => {
        const { name, value, checked, type } = e.target;
        let sanitizedValue;
        
        if (type === 'checkbox') {
            sanitizedValue = checked;
        } else if (type === 'number') {
            sanitizedValue = sanitizeNumber(value, { min: 0, integer: name === 'duration' });
        } else if (name === 'poster' || name === 'trailer') {
            sanitizedValue = sanitizeUrl(value) || value;
        } else {
            sanitizedValue = sanitizeString(value, { maxLength: name === 'description' ? 5000 : 500 });
        }
        
        setMovieData({ ...movieData, [name]: sanitizedValue });
    }

    const handleGenderChange = (e, idx) => {
        const { value } = e.target
        const sanitizedValue = sanitizeString(value, { maxLength: 50 })
        const gendersCopy = [...movieData.gender]
        gendersCopy[idx] = sanitizedValue
        setMovieData({ ...movieData, gender: gendersCopy })
    }
    
    const handleCastingChange = (e, idx, field) => {
        const { value } = e.target
        const sanitizedValue = field === 'photo' 
            ? (sanitizeUrl(value) || value)
            : sanitizeString(value, { maxLength: 200 })
        const updatedCasting = [...movieData.casting]
        updatedCasting[idx][field] = sanitizedValue
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
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // Sanitize form data
        const sanitizedData = {
            poster: sanitizeUrl(movieData.poster) || movieData.poster,
            country: sanitizeString(movieData.country, { maxLength: 100 }),
            language: sanitizeString(movieData.language, { maxLength: 10 }),
            duration: sanitizeNumber(movieData.duration, { min: 1, max: 1000, integer: true }) || 0,
            gender: sanitizeArray(movieData.gender, (g) => sanitizeString(g, { maxLength: 50 })),
            calification: sanitizeString(movieData.calification, { maxLength: 10 }),
            released: Boolean(movieData.released),
            date: sanitizeString(movieData.date, { maxLength: 50 }),
            director: sanitizeString(movieData.director, { maxLength: 200 }),
            trailer: sanitizeUrl(movieData.trailer) || movieData.trailer,
            description: sanitizeString(movieData.description, { maxLength: 5000 }),
            cinemaId: sanitizeArray(movieData.cinemaId, (id) => sanitizeNumber(id, { integer: true })),
            casting: sanitizeArray(movieData.casting, (actor) => ({
                name: sanitizeString(actor.name, { maxLength: 200 }),
                photo: sanitizeUrl(actor.photo) || actor.photo
            }))
        }
        
        const sanitizedTitle = {
            original: sanitizeString(title.original, { maxLength: 200 }),
            spanish: sanitizeString(title.spanish, { maxLength: 200 })
        }

        try {
            await updateMovieMutation.mutateAsync({
                id: movieId,
                data: {
                    ...sanitizedData,
                    title: sanitizedTitle
                }
            })
            
            notifySuccess('Película actualizada correctamente')
            navigate(`/peliculas/detalles/${movieId}`)
        } catch (err) {
            logger.error('Failed to update movie', err, 'EditMovieForm')
            notifyError('Error al actualizar la película')
        }
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