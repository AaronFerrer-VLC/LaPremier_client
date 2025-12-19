import { Form, Row, Col } from 'react-bootstrap';
import { Button } from '../UI';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';
import { moviesService } from '../../services/movies.service';
import { useCinema, useUpdateCinema } from '../../hooks/useCinemas';
import { useMovies } from '../../hooks/useMovies';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { ENV } from '../../config/env';
import { sanitizeString, sanitizeUrl, sanitizeNumber, sanitizeArray } from '../../utils/sanitize';

const EditCinemaForm = () => {

    const { cinemaId } = useParams()
    const navigate = useNavigate()

    // Fetch cinema using React Query
    const { data: cinema, isLoading: isLoadingCinema } = useCinema(cinemaId, {
        enabled: !!cinemaId && cinemaId !== 'undefined',
    })
    
    // Fetch movies using React Query
    const { data: localMovies = [], isLoading: isLoadingLocalMovies } = useMovies()
    
    // Fetch TMDB movies
    const [tmdbMovies, setTmdbMovies] = useState([])
    const [isLoadingTMDB, setIsLoadingTMDB] = useState(false)
    
    useEffect(() => {
        const fetchTMDBMovies = async () => {
            if (!ENV.HAS_TMDB) return
            try {
                setIsLoadingTMDB(true)
                const tmdb = await moviesService.getNowPlayingFromTMDB(1)
                setTmdbMovies(tmdb || [])
            } catch (err) {
                logger.warn('Failed to fetch TMDB movies', err, 'EditCinemaForm')
            } finally {
                setIsLoadingTMDB(false)
            }
        }
        fetchTMDBMovies()
    }, [])
    
    // Combine and deduplicate movies
    const movies = useMemo(() => {
        const allMovies = [...(localMovies || [])]
        const transformedTMDB = (tmdbMovies || []).map(movie => ({
            ...movie,
            id: movie.tmdbId,
            _id: movie.tmdbId,
        }))
        allMovies.push(...transformedTMDB)
        
        // Remove duplicates
        const uniqueMovies = allMovies.reduce((acc, movie) => {
            const movieId = movie.id || movie._id || movie.tmdbId
            if (!acc.find(m => (m.id || m._id || m.tmdbId) === movieId)) {
                acc.push(movie)
            }
            return acc
        }, [])
        
        return uniqueMovies
    }, [localMovies, tmdbMovies])
    
    const isLoading = isLoadingCinema || isLoadingLocalMovies || isLoadingTMDB
    
    // Update cinema mutation
    const updateCinemaMutation = useUpdateCinema()

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

    // Initialize form data when cinema loads
    useEffect(() => {
        if (cinema) {
            setCinemaData({
                name: cinema.name || '',
                cover: Array.isArray(cinema.cover) && cinema.cover.length > 0 ? cinema.cover : [''],
                url: cinema.url || '',
                services: Array.isArray(cinema.services) && cinema.services.length > 0 ? cinema.services : [''],
                movieId: Array.isArray(cinema.movieId) ? cinema.movieId : []
            })
            setAddress(cinema.address || {
                street: '',
                city: '',
                zipcode: 0,
                country: ''
            })
            setPrice(cinema.price || {
                regular: 0,
                weekend: 0,
                special: 0
            })
            setSpecs(cinema.specs || {
                VO: false,
                is3D: false,
                accesibility: false
            })
            setCapacity(cinema.capacity || {
                dicerooms: 0,
                seating: 0
            })
        }
    }, [cinema])

    const handleCinemaDataChange = e => {
        const { name, value } = e.target
        const sanitizedValue = name === 'url' 
            ? (sanitizeUrl(value) || value)
            : sanitizeString(value, { maxLength: 500 })

        setCinemaData({
            ...cinemaData, [name]: sanitizedValue
        })
    }

    const handleCoversChange = (e, idx) => {
        const { value } = e.target
        const sanitizedValue = sanitizeUrl(value) || sanitizeString(value, { maxLength: 500 })

        const coversCopy = [...cinemaData.cover]
        coversCopy[idx] = sanitizedValue

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
        const sanitizedValue = sanitizeString(value, { maxLength: 100 })

        const servicesCopy = [...cinemaData.services]
        servicesCopy[idx] = sanitizedValue

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
        const sanitizedId = sanitizeNumber(value, { integer: true, min: 1 })
        
        const moviesIdsCopy = [...cinemaData.movieId]
        
        if (sanitizedId !== null) {
            moviesIdsCopy[idx] = sanitizedId
        } else {
            moviesIdsCopy[idx] = ''
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
        let sanitizedValue
        
        if (name === 'zipcode') {
            sanitizedValue = sanitizeNumber(value, { min: 0, max: 99999, integer: true }) || 0
        } else {
            sanitizedValue = sanitizeString(value, { maxLength: name === 'street' ? 200 : 100 })
        }

        setAddress({
            ...address, [name]: sanitizedValue
        })
    }

    const handlePriceChange = e => {
        const { name, value } = e.target
        const sanitizedValue = sanitizeNumber(value, { min: 0, max: 1000 }) || 0

        setPrice({
            ...price, [name]: sanitizedValue
        })
    }

    const handleSpecsChange = e => {
        const { name, checked } = e.target

        setSpecs({
            ...specs, [name]: Boolean(checked)
        })
    }

    const handleCapacityChange = e => {
        const { name, value } = e.target
        const sanitizedValue = sanitizeNumber(value, { 
            min: 0, 
            max: name === 'seating' ? 100000 : 100, 
            integer: true 
        }) || 0

        setCapacity({
            ...capacity, [name]: sanitizedValue
        })
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        // Sanitize and validate form data
        const sanitizedMovieIds = sanitizeArray(cinemaData.movieId, (id) => {
            const numId = sanitizeNumber(id, { integer: true, min: 1 })
            return numId
        }).filter(id => id !== null && id !== undefined)

        // Sanitize cinema data
        const sanitizedData = {
            name: sanitizeString(cinemaData.name, { maxLength: 200 }),
            cover: sanitizeArray(cinemaData.cover, (url) => sanitizeUrl(url) || sanitizeString(url, { maxLength: 500 })),
            url: sanitizeUrl(cinemaData.url) || cinemaData.url,
            services: sanitizeArray(cinemaData.services, (service) => sanitizeString(service, { maxLength: 100 })),
            movieId: sanitizedMovieIds.length > 0 ? sanitizedMovieIds : [],
            address: {
                street: sanitizeString(address.street, { maxLength: 200 }),
                city: sanitizeString(address.city, { maxLength: 100 }),
                zipcode: sanitizeNumber(address.zipcode, { min: 0, max: 99999, integer: true }) || 0,
                country: sanitizeString(address.country, { maxLength: 100 })
            },
            price: {
                regular: sanitizeNumber(price.regular, { min: 0, max: 1000 }) || 0,
                weekend: sanitizeNumber(price.weekend, { min: 0, max: 1000 }) || 0,
                special: sanitizeNumber(price.special, { min: 0, max: 1000 }) || 0
            },
            specs: {
                VO: Boolean(specs.VO),
                is3D: Boolean(specs.is3D),
                accesibility: Boolean(specs.accesibility)
            },
            capacity: {
                dicerooms: sanitizeNumber(capacity.dicerooms, { min: 0, max: 100, integer: true }) || 0,
                seating: sanitizeNumber(capacity.seating, { min: 0, max: 100000, integer: true }) || 0
            }
        }

        try {
            await updateCinemaMutation.mutateAsync({
                id: cinemaId,
                data: sanitizedData
            })
            
            notifySuccess('Cine actualizado correctamente')
            navigate(`/cines/detalles/${cinemaId}`)
        } catch (err) {
            logger.error('Failed to update cinema', err, 'EditCinemaForm')
            notifyError('Error al actualizar el cine')
        }
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