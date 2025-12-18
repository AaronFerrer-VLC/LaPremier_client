import { Form, Row, Col } from 'react-bootstrap';
import { Button } from '../UI';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';
import { moviesService } from '../../services/movies.service';
import { ENV } from '../../config/env';

const API_URL = import.meta.env.VITE_APP_API_URL

const EditCinemaForm = () => {

    const { cinemaId } = useParams()
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(true)

    const [movies, setMovies] = useState([])
    useEffect(() => {
        fetchCinemaData()
        fetchMovies()
    }, [])

    const fetchMovies = async () => {
        try {
            const allMovies = []
            let localMoviesCount = 0
            let tmdbMoviesCount = 0
            
            // Fetch local movies from MongoDB
            try {
                const localResponse = await axios.get(`${API_URL}/movies/`)
                const localMovies = Array.isArray(localResponse.data) ? localResponse.data : []
                allMovies.push(...localMovies)
                localMoviesCount = localMovies.length
                logger.info('Local movies loaded', { count: localMoviesCount }, 'EditCinemaForm')
            } catch (localErr) {
                logger.warn('Failed to fetch local movies', localErr, 'EditCinemaForm')
            }
            
            // Fetch now playing movies from TMDB if enabled
            if (ENV.HAS_TMDB) {
                try {
                    const tmdbMovies = await moviesService.getNowPlayingFromTMDB(1)
                    // Transform TMDB movies to match local format
                    const transformedTMDBMovies = tmdbMovies.map(movie => ({
                        ...movie,
                        id: movie.tmdbId, // Use tmdbId as id for selection
                        _id: movie.tmdbId,
                    }))
                    allMovies.push(...transformedTMDBMovies)
                    tmdbMoviesCount = transformedTMDBMovies.length
                    logger.info('TMDB movies loaded', { count: tmdbMoviesCount }, 'EditCinemaForm')
                } catch (tmdbErr) {
                    logger.warn('Failed to fetch TMDB movies', tmdbErr, 'EditCinemaForm')
                }
            }
            
            // Remove duplicates based on id/tmdbId
            const uniqueMovies = allMovies.reduce((acc, movie) => {
                const movieId = movie.id || movie._id || movie.tmdbId
                if (!acc.find(m => (m.id || m._id || m.tmdbId) === movieId)) {
                    acc.push(movie)
                }
                return acc
            }, [])
            
            setMovies(uniqueMovies)
            setIsLoading(false)
            logger.info('All movies loaded', { total: uniqueMovies.length, local: localMoviesCount, tmdb: tmdbMoviesCount }, 'EditCinemaForm')
        } catch (err) {
            logger.error('Failed to fetch movies', err, 'EditCinemaForm')
            setIsLoading(false)
        }
    }

    const [cinemaData, setCinemaData] = useState({
        name: '',
        cover: [''],
        url: '',
        services: [''],
        movieId: ['']
    })

    const [address, setAddress] = useState({
        street: '',
        city: '',
        zipcode: 0,
        country: ''
    })

    const [price, setPrice] = useState({
        regular: 0,
        weekend: 0,
        special: 0
    })

    const [specs, setSpecs] = useState({
        VO: false,
        is3D: false,
        accesibility: false
    })

    const [capacity, setCapacity] = useState({
        dicerooms: 0,
        seating: 0
    })

    const fetchCinemaData = () => {
        axios
            .get(`${API_URL}/cinemas/${cinemaId}`)
            .then(response => {
                const { data: cinemaData } = response

                setCinemaData(cinemaData)
                setAddress(cinemaData.address)
                setPrice(cinemaData.price)
                setSpecs(cinemaData.specs)
                setCapacity(cinemaData.capacity)
            })
    }

    const handleCinemaDataChange = e => {
        const { name, value } = e.target

        setCinemaData({
            ...cinemaData, [name]: value
        }
        )
    }

    const handleCoversChange = (e, idx) => {

        const { value } = e.target

        const coversCopy = [...cinemaData.cover]

        coversCopy[idx] = value

        setCinemaData({
            ...cinemaData, cover: coversCopy
        })
    }


    const addNewCinemaCover = () => {
        const coversCopy = [...cinemaData.cover]
        coversCopy.push('')
        setCinemaData({ ...cinemaData, cover: coversCopy })
    }

    const deleteNewCinemaCover = () => {
        const coversCopy = [...cinemaData.cover]
        coversCopy.pop('')
        setCinemaData({ ...cinemaData, cover: coversCopy })
    }

    const handleServicesChange = (e, idx) => {

        const { value } = e.target

        const servicesCopy = [...cinemaData.services]

        servicesCopy[idx] = value

        setCinemaData({
            ...cinemaData, services: servicesCopy
        })
    }

    const addNewService = () => {
        const servicesCopy = [...cinemaData.services]
        servicesCopy.push('')
        setCinemaData({ ...cinemaData, services: servicesCopy })
    }

    const deletNewService = () => {
        const servicesCopy = [...cinemaData.services]
        servicesCopy.pop('')
        setCinemaData({ ...cinemaData, services: servicesCopy })
    }

    const handleMovieIdChange = (e, idx) => {
        const { value } = e.target

        const moviesIdsCopy = [...cinemaData.movieId]

        // Convert to number if value is not empty and is numeric, otherwise keep as string
        // MongoDB schema expects [Number], but we need to handle both TMDB IDs (numbers) and MongoDB ObjectIds
        if (value) {
            // Try to convert to number if it's numeric
            const numValue = Number(value);
            if (!isNaN(numValue) && isFinite(numValue)) {
                moviesIdsCopy[idx] = numValue; // Store as number for TMDB IDs
            } else {
                // For MongoDB ObjectIds (strings), we'll need to store them differently
                // But since schema expects Number, we should use a numeric ID if available
                // For now, try to extract numeric part or use 0 as fallback
                logger.warn('Non-numeric movie ID selected', { value, idx }, 'EditCinemaForm');
                moviesIdsCopy[idx] = 0; // Fallback - this won't work, but schema requires Number
            }
        } else {
            moviesIdsCopy[idx] = '';
        }

        setCinemaData({
            ...cinemaData, movieId: moviesIdsCopy
        })
    }

    const addNewMovieId = () => {
        const moviesIdsCopy = [...cinemaData.movieId]
        moviesIdsCopy.push('')
        setCinemaData({ ...cinemaData, movieId: moviesIdsCopy })
    }

    const deletNewMovieId = () => {
        const moviesIdsCopy = [...cinemaData.movieId]
        if (moviesIdsCopy.length > 0) {
            moviesIdsCopy.pop()
            setCinemaData({ ...cinemaData, movieId: moviesIdsCopy })
        }
    }



    const handleAddresChange = e => {
        const { name, value } = e.target

        setAddress({
            ...address, [name]: value
        })
    }

    const handlePriceChange = e => {
        const { name, value } = e.target

        setPrice({
            ...price, [name]: value
        })
    }

    const handleSpecsChange = e => {
        const { name, checked } = e.target

        setSpecs({
            ...specs, [name]: checked
        })
    }

    const handleCapacityChange = e => {
        const { name, value } = e.target

        setCapacity({
            ...capacity, [name]: value
        })
    }

    const handleFormSubmit = e => {

        e.preventDefault()

        // Filter out empty movie IDs and ensure they're all numbers before submitting
        const filteredMovieIds = cinemaData.movieId
            .filter(id => id !== '' && id !== null && id !== undefined && id !== 0)
            .map(id => {
                // Ensure all IDs are numbers (MongoDB schema expects [Number])
                const numId = Number(id);
                if (isNaN(numId) || !isFinite(numId)) {
                    logger.warn('Invalid movie ID filtered out', { id }, 'EditCinemaForm');
                    return null;
                }
                return numId;
            })
            .filter(id => id !== null);

        logger.info('Submitting cinema with movie IDs', { 
            cinemaId, 
            movieIds: filteredMovieIds,
            movieIdsTypes: filteredMovieIds.map(id => typeof id)
        }, 'EditCinemaForm');

        const reqPayload = {
            ...cinemaData,
            movieId: filteredMovieIds.length > 0 ? filteredMovieIds : [],
            address: address,
            price: price,
            specs: specs,
            capacity: capacity
        }

        axios
            .put(`${API_URL}/cinemas/${cinemaId}`, reqPayload)
            .then(() => {
                logger.info('Cinema updated successfully', { cinemaId }, 'EditCinemaForm')
                navigate(`/cines/detalles/${cinemaId}`)
            })
            .catch(err => {
                logger.error('Failed to update cinema', err, 'EditCinemaForm')
            })
    }

    return (

        isLoading ? <h1>CARGANDO</h1> :

            <div className="NewCineForm mt-5">

                <Row>
                    <Col md={{ span: 6, offset: 3 }}>
                        <Form className="form" onSubmit={handleFormSubmit}>
                            <Form.Group className="mb-3" controlId="nameField">
                                <Form.Label className="fw-bold">Nombre</Form.Label>
                                <Form.Control type="text" value={cinemaData.name} name={'name'} onChange={handleCinemaDataChange} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="coverField">
                                <Form.Label className="fw-bold">Añadir fotos (URL)</Form.Label>

                                <div>
                                    {
                                        cinemaData.cover.map((eachCover, idx) => {
                                            return (
                                                <Form.Control
                                                    key={`cover-${idx}-${eachCover || 'empty'}`}
                                                    className="mb-2"
                                                    name={'cover'}
                                                    type="text"
                                                    onChange={e => handleCoversChange(e, idx)}
                                                    value={eachCover}>
                                                </Form.Control>
                                            )
                                        })

                                    }
                                </div>

                                <Button variant="secondary" size="sm" className="me-2" onClick={addNewCinemaCover}>Añadir foto</Button>
                                <Button variant="secondary" size="sm" className="me-2" onClick={deleteNewCinemaCover}>Quitar foto</Button>

                            </Form.Group>

                            <Row className="mt-4 mb-4">
                                <Form.Label className="fw-bold">Dirección</Form.Label>
                                <Col md={{ span: 12 }}>
                                    <Form.Group className="mb-3" controlId="streetField">
                                        <Form.Label>Calle</Form.Label>
                                        <Form.Control type="text" value={address.street} name={'street'} onChange={handleAddresChange} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3" controlId="countryField">
                                        <Form.Label>País</Form.Label>
                                        <Form.Control type="text" value={address.country} name={'country'} onChange={handleAddresChange} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3" controlId="cityField">
                                        <Form.Label>Ciudad</Form.Label>
                                        <Form.Control type="text" value={address.city} name={'city'} onChange={handleAddresChange} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3" controlId="zipCodeField">
                                        <Form.Label>Código Postal</Form.Label>
                                        <Form.Control type="number" value={address.zipcode} name={'zipcode'} onChange={handleAddresChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3" controlId="urlField">
                                <Form.Label className="fw-bold">Sitio web</Form.Label>
                                <Form.Control type="url" value={cinemaData.url} name={'url'} onChange={handleCinemaDataChange} />
                            </Form.Group>

                            <Row className="mt-4 mb-4">
                                <Form.Label className="fw-bold">Precios</Form.Label>
                                <Col>
                                    <Form.Group className="mb-3" controlId="regularPriceField">
                                        <Form.Label>Normal</Form.Label>
                                        <Form.Control type="number" value={price.regular} name={'regular'} onChange={handlePriceChange} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3" controlId="weekendPriceField">
                                        <Form.Label>Fin de semana</Form.Label>
                                        <Form.Control type="number" value={price.weekend} name={'weekend'} onChange={handlePriceChange} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3" controlId="specialPriceField">
                                        <Form.Label>Especial</Form.Label>
                                        <Form.Control type="number" value={price.special} name={'special'} onChange={handlePriceChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Form.Label className="fw-bold">Especificaciones</Form.Label>
                                <Col>
                                    <Form.Group className="mb-3 align-items-center" controlId="is3DField">
                                        <Form.Check
                                            type="checkbox"
                                            label="3D"
                                            name="is3D"
                                            id="is3DCheck"
                                            checked={specs.is3D}
                                            onChange={handleSpecsChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3 align-items-center" controlId="voField">
                                        <Form.Check
                                            type="checkbox"
                                            label="VO"
                                            name="VO"
                                            id="voCheck"
                                            checked={specs.VO}
                                            onChange={handleSpecsChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3 align-items-center" controlId="accesibilityField">
                                        <Form.Check
                                            type="checkbox"
                                            label="Accesibilidad"
                                            name="accesibility"
                                            id="accesibilityCheck"
                                            checked={specs.accesibility}
                                            onChange={handleSpecsChange}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>


                            <Row className='mt-4 mb-4'>
                                <Form.Label className="fw-bold">Capacidad</Form.Label>
                                <Col>
                                    <Form.Group className="mb-3" controlId="diceRoomsField">
                                        <Form.Label>Número de salas</Form.Label>
                                        <Form.Control type="number" value={capacity.dicerooms} name={'dicerooms'} onChange={handleCapacityChange} />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3" controlId="seatingField">
                                        <Form.Label>Aforo total</Form.Label>
                                        <Form.Control type="number" value={capacity.seating} name={'seating'} onChange={handleCapacityChange} />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3" controlId="servicesField">
                                <Form.Label className="fw-bold">Servicios</Form.Label>

                                <div>
                                    {
                                        cinemaData.services.map((eachService, idx) => {
                                            return (
                                                <Form.Control
                                                    key={`service-${idx}-${eachService || 'empty'}`}
                                                    as="select"
                                                    className="mb-2"
                                                    type="text"
                                                    onChange={e => handleServicesChange(e, idx)}
                                                    value={eachService}>

                                                    <option value="">Selecciona un servicio</option>
                                                    <option value="Parking">Parking</option>
                                                    <option value="Food & Drinks">Food & Drinks</option>
                                                    <option value="Toilettes">Toilettes</option>

                                                </Form.Control>
                                            )
                                        })

                                    }

                                </div>

                                <Button variant="secondary" size="sm" className="me-2" onClick={addNewService}>Añadir servicio</Button>
                                <Button variant="secondary" size="sm" className="me-2" onClick={deletNewService}>Quitar servicio</Button>

                            </Form.Group>

                            <Form.Group className="mb-3" controlId="moviesField">
                                <Form.Label className="fw-bold">Películas en cartelera</Form.Label>

                                <div>
                                    {
                                        cinemaData.movieId.map((eachMovieId, idx) => {
                                            return (
                                                <Form.Select
                                                    key={`movieId-${idx}-${eachMovieId || 'empty'}`}
                                                    className='mb-2'
                                                    onChange={e => handleMovieIdChange(e, idx)}
                                                    value={eachMovieId || ''}>
                                                    <option value="">Selecciona una película</option>
                                                    {
                                                        movies.map(elm => {
                                                            const movieKey = elm.id || elm._id || elm.tmdbId || `movie-${elm.title?.spanish || 'unknown'}-${idx}`;
                                                            // ALWAYS use tmdbId for TMDB movies (number)
                                                            // For local MongoDB movies, we need to use a numeric ID
                                                            // Since MongoDB schema expects [Number], we'll prioritize tmdbId
                                                            let movieValue = '';
                                                            if (elm.tmdbId) {
                                                                // TMDB movie: use tmdbId (number)
                                                                movieValue = elm.tmdbId;
                                                            } else if (elm.id || elm._id) {
                                                                // Local movie: try to use numeric ID
                                                                const idToUse = elm.id || elm._id;
                                                                // Check if it's already a number or can be converted
                                                                const numId = Number(idToUse);
                                                                if (!isNaN(numId) && isFinite(numId)) {
                                                                    movieValue = numId;
                                                                } else {
                                                                    // MongoDB ObjectId (string) - can't use directly
                                                                    // Skip this movie or use a fallback
                                                                    logger.warn('Local movie has non-numeric ID, skipping', { 
                                                                        title: elm.title?.spanish || elm.title,
                                                                        id: idToUse 
                                                                    }, 'EditCinemaForm');
                                                                    return null; // Skip this option
                                                                }
                                                            }
                                                            return (
                                                                <option key={movieKey} value={movieValue}>{elm.title?.spanish || elm.title || 'Sin título'}</option>
                                                            )
                                                        }).filter(Boolean) // Remove null entries
                                                    }
                                                </Form.Select>
                                            )
                                        })
                                    }
                                </div>

                                <Button variant="secondary" size="sm" className="me-2" onClick={addNewMovieId}>Añadir película</Button>
                                <Button variant="secondary" size="sm" className="me-2" onClick={deletNewMovieId} disabled={cinemaData.movieId.length <= 1}>Quitar película</Button>

                            </Form.Group>

                            <div className="d-grid mt-5">
                                <Button variant="primary" size="lg" type="submit">Editar cine</Button>
                            </div>

                        </Form>
                    </Col>
                </Row>


            </div >
    )
}

export default EditCinemaForm