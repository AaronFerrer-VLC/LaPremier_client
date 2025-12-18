import { useState } from "react"
import { Form, Button, Tabs, Tab, Alert } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { cinemasService } from "../../services/cinemas.service"
import { moviesService } from "../../services/movies.service"
import { useApi } from "../../hooks/useApi"
import { notifySuccess, notifyError } from "../../utils/notifications"
import logger from "../../utils/logger"
import { SkeletonForm } from "../SkeletonLoader/SkeletonLoader"
import TMDBMovieSearch from "../TMDBMovieSearch/TMDBMovieSearch"
import { ENV } from "../../config/env"
import "./NewMovieForm.css"

const NewMovieForm = () => {
    const navigate = useNavigate()

    // Fetch cinemas using useApi hook
    const { data: cinemas, loading: isLoadingCinemas } = useApi(
        () => cinemasService.getAll(),
        []
    )

    const activeCinemas = cinemas?.filter(cinema => !cinema.isDeleted) || []
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

    const handleTitleChange = (e) => {
        const { name, value } = e.target
        setTitle({ ...title, [name]: value })
    }
    const handleCinemaChange = (e, idx) => {
        const { value } = e.target
        const cinemasCopy = [...movieData.cinemaId]
        cinemasCopy[idx] = Number(value)
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
        }))
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
        const updatedCasting = [...movieData.casting]
        updatedCasting.push({ name: '', photo: '' })
        setMovieData({ ...movieData, casting: updatedCasting })
    }
    const deletedNewCasting = (idx) => {
        const updatedCasting = [...movieData.casting]
        updatedCasting.splice(idx, 1)
        setMovieData({ ...movieData, casting: updatedCasting })
    }
    const handleFormSubmit = async (e) => {
        e.preventDefault()

        try {
            const reqPayload = {
                ...movieData,
                title: title
            }

            // Create movie
            const response = await moviesService.create(reqPayload)
            const newMovie = response.data

            // Update cinemas to include this movie
            if (newMovie.cinemaId && newMovie.cinemaId.length > 0) {
                const cinemasToUpdate = activeCinemas.filter(eachCinema =>
                    newMovie.cinemaId.includes(eachCinema.id)
                )

                const updatePromises = cinemasToUpdate.map(eachCinema => {
                    const newMoviesIds = Array.isArray(eachCinema.movieId)
                        ? [...eachCinema.movieId, newMovie.id]
                        : [eachCinema.movieId, newMovie.id].filter(Boolean)

                    return cinemasService.update(eachCinema.id, {
                        ...eachCinema,
                        movieId: newMoviesIds
                    })
                })

                await Promise.all(updatePromises)
            }

            notifySuccess('Película creada correctamente')
            logger.info('Movie created successfully', { movieId: newMovie.id }, 'NewMovieForm')
            navigate(`/peliculas/detalles/${newMovie.id}`)
        } catch (error) {
            logger.error('Failed to create movie', error, 'NewMovieForm')
            notifyError('Error al crear la película')
        }
    }

    if (isLoadingCinemas) {
        return (
            <div className="NewMovieForm mt-5">
                <SkeletonForm />
            </div>
        )
    }

    const handleTMDBMovieSelected = (tmdbMovie) => {
        // Fill form with TMDB data
        const transformedMovie = {
            poster: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : '',
            country: tmdbMovie.origin_country?.[0] || '',
            language: tmdbMovie.original_language || '',
            duration: 0, // Will be filled when syncing
            gender: tmdbMovie.genre_ids ? [] : [''], // Will be filled when syncing
            calification: tmdbMovie.release_date ? tmdbMovie.release_date.split('-')[0] : '',
            released: !!tmdbMovie.release_date,
            date: tmdbMovie.release_date || '',
            director: '',
            trailer: '',
            description: tmdbMovie.overview || '',
            cinemaId: [''],
            casting: [{ name: '', photo: '' }]
        };

        setTitle({
            original: tmdbMovie.original_title || '',
            spanish: tmdbMovie.title || ''
        });

        setMovieData(transformedMovie);
    };

    const handleTMDBMovieSynced = (syncedMovie) => {
        // Movie was synced, now fill the form with complete data
        setTitle(syncedMovie.title || { original: '', spanish: '' });
        setMovieData({
            poster: syncedMovie.poster || '',
            country: syncedMovie.country || '',
            language: syncedMovie.language || '',
            duration: syncedMovie.duration || 0,
            gender: syncedMovie.gender || [''],
            calification: syncedMovie.calification || '',
            released: syncedMovie.released !== undefined ? syncedMovie.released : true,
            date: syncedMovie.date || '',
            director: syncedMovie.director || '',
            trailer: syncedMovie.trailer || '',
            description: syncedMovie.description || '',
            cinemaId: syncedMovie.cinemaId || [''],
            casting: syncedMovie.casting || [{ name: '', photo: '' }]
        });
        
        notifySuccess('Datos de TMDB cargados. Puedes editarlos antes de guardar.');
    };

    return (
        <div className="NewMovieForm mt-5">
            {ENV.HAS_TMDB ? (
                <Tabs defaultActiveKey="manual" className="mb-4">
                    <Tab eventKey="tmdb" title="🔍 Buscar en TMDB">
                        <div className="mt-4">
                            <TMDBMovieSearch
                                onMovieSelected={handleTMDBMovieSelected}
                                onMovieSynced={handleTMDBMovieSynced}
                            />
                        </div>
                    </Tab>
                    <Tab eventKey="manual" title="✏️ Crear Manualmente">
                        <Form className="form mt-4" onSubmit={handleFormSubmit}>
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
                            movieData.gender.map((eachGender, idx) => {
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
                        {movieData.casting.map((eachCasting, idx) => (
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
                                <Form.Control
                                    type="text"
                                    placeholder="URL de la foto"
                                    value={eachCasting.photo}
                                    onChange={(event) =>
                                        handleCastingChange(event, idx, 'photo')
                                    }
                                    className="me-2"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => deletedNewCasting(idx)}
                                    type="button"
                                >
                                    Quitar
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="secondary"
                            size="sm"
                            className="me-2"
                            onClick={addNewCasting}
                            type="button"
                        >
                            Añadir Actor
                        </Button>
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
                            >
                                <option value="">Selecciona un cine</option>
                                {activeCinemas.map((cinema) => (
                                    <option key={cinema.id} value={cinema.id}>
                                        {cinema.name}
                                    </option>
                                ))}
                            </Form.Control>
                        ))}
                        <Button variant="secondary" size="sm" className="me-2" onClick={addNewCinema}>Añadir Cine</Button>
                        <Button variant="secondary" size="sm" className="me-2" onClick={deletNewCinema}>Quitar Cine</Button>
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

                    <Button variant="primary" size="lg" type="submit">
                        Guardar película
                    </Button>
                </Form>
                    </Tab>
                </Tabs>
            ) : (
                <>
                    <Alert variant="info" className="mb-4">
                        
                    </Alert>
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
                            {movieData.gender.map((eachGender, idx) => (
                                <Form.Control
                                    className="mb-2"
                                    type="text"
                                    onChange={(event) => handleGenderChange(event, idx)}
                                    value={eachGender}
                                    key={idx}
                                />
                            ))}
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
                            {movieData.casting.map((eachCasting, idx) => (
                                <div key={idx} className="d-flex align-items-center mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Nombre del actor"
                                        value={eachCasting.name}
                                        onChange={(event) => handleCastingChange(event, idx, 'name')}
                                        className="me-2"
                                    />
                                    <Form.Control
                                        type="text"
                                        placeholder="URL de la foto"
                                        value={eachCasting.photo}
                                        onChange={(event) => handleCastingChange(event, idx, 'photo')}
                                        className="me-2"
                                    />
                                </div>
                            ))}
                            <Button variant="secondary" size="sm" className="me-2" onClick={addNewCasting}>Añadir Actor</Button>
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
                                >
                                    <option value="">Selecciona un cine</option>
                                    {activeCinemas.map((cinema) => (
                                        <option key={cinema.id} value={cinema.id}>
                                            {cinema.name}
                                        </option>
                                    ))}
                                </Form.Control>
                            ))}
                            <Button variant="secondary" size="sm" className="me-2" onClick={addNewCinema}>Añadir Cine</Button>
                            <Button variant="secondary" size="sm" className="me-2" onClick={deletNewCinema}>Quitar Cine</Button>
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
                        <Button variant="primary" size="lg" type="submit">
                            Guardar película
                        </Button>
                    </Form>
                </>
            )}
        </div>
    );
}

export default NewMovieForm