import { useState, useEffect, useContext, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { FaGlasses, FaClosedCaptioning, FaWheelchair, FaHome, FaArrowLeft } from 'react-icons/fa'
import { Container, Image, Row, Col, Carousel, Stack, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { cinemasService } from '../../../services/cinemas.service'
import { moviesService } from '../../../services/movies.service'
import { useCinema } from '../../../hooks/useCinemas'
import { notifySuccess, notifyError } from '../../../utils/notifications'
import logger from '../../../utils/logger'
import { SkeletonDetails } from '../../../components/SkeletonLoader/SkeletonLoader'
import { Button, Badge, Card, Modal, Alert } from '../../../components/UI'
import { ENV } from '../../../config/env'
import SEO from '../../../components/SEO/SEO'

import "./CinemaDetailsPage.css"
import EnhancedMap from '../../../components/EnhancedMap/EnhancedMap'
import ShareButton from '../../../components/ShareButton/ShareButton'
import { AuthContext } from '../../../contexts/auth.context'

const CinemaDetailsPage = () => {
    const { loggedUser } = useContext(AuthContext)
    const { cinemaId } = useParams()
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate()

    // Fetch cinema details using React Query
    const { data: cinema, isLoading: isLoadingCinema, error: cinemaError } = useCinema(cinemaId, {
        enabled: !!cinemaId && cinemaId !== 'undefined',
    });

    // Fetch movies for this cinema - load specific movies by ID from TMDB
    // Since all movies come from TMDB, we fetch them directly by the IDs stored in cinema.movieId
    const [allMovies, setAllMovies] = useState([])
    const [isLoadingMovies, setIsLoadingMovies] = useState(false)
    
    useEffect(() => {
        const fetchMoviesForCinema = async () => {
            if (!cinema || !ENV.HAS_TMDB) {
                setAllMovies([])
                return
            }
            
            const cinemaMovieIds = Array.isArray(cinema.movieId) ? cinema.movieId : (cinema.movieId ? [cinema.movieId] : [])
            
            if (cinemaMovieIds.length === 0) {
                logger.info('Cinema has no movie IDs', { cinemaId, cinemaName: cinema.name }, 'CinemaDetailsPage')
                setAllMovies([])
                return
            }
            
            setIsLoadingMovies(true)
            logger.info('Loading movies from TMDB for cinema', { 
                cinemaId: cinemaId,
                cinemaName: cinema.name,
                movieIds: cinemaMovieIds 
            }, 'CinemaDetailsPage')
            
            try {
                // Fetch each movie by its TMDB ID
                const moviePromises = cinemaMovieIds
                    .filter(id => id !== null && id !== undefined && id !== '' && id !== 0)
                    .map(async (tmdbId) => {
                        try {
                            const movie = await moviesService.getFromTMDB(Number(tmdbId))
                            return {
                                ...movie,
                                id: movie.tmdbId,
                                _id: movie.tmdbId,
                            }
                        } catch (err) {
                            logger.warn('Failed to fetch movie from TMDB', { tmdbId, error: err }, 'CinemaDetailsPage')
                            return null
                        }
                    })
                
                const fetchedMovies = await Promise.all(moviePromises)
                const validMovies = fetchedMovies.filter(m => m !== null)
                
                logger.info('Movies loaded from TMDB', { 
                    requested: cinemaMovieIds.length,
                    loaded: validMovies.length,
                    movieIds: cinemaMovieIds,
                    loadedTitles: validMovies.map(m => m.title?.spanish || m.title)
                }, 'CinemaDetailsPage')
                
                setAllMovies(validMovies)
            } catch (err) {
                logger.error('Failed to fetch movies from TMDB', err, 'CinemaDetailsPage')
                setAllMovies([])
            } finally {
                setIsLoadingMovies(false)
            }
        }
        
        fetchMoviesForCinema()
    }, [cinema, cinemaId])

    // Since we're loading movies directly from TMDB by ID, allMovies already contains only the movies for this cinema
    // No need to filter - just use allMovies directly
    const moviesInCinema = useMemo(() => {
        logger.info('Movies for cinema', { 
            cinemaId: cinemaId,
            cinemaName: cinema?.name,
            moviesCount: allMovies.length,
            movieTitles: allMovies.map(m => m.title?.spanish || m.title || 'Sin título')
        }, 'CinemaDetailsPage');
        
        return allMovies;
    }, [allMovies, cinema, cinemaId])

    const isLoading = isLoadingCinema || isLoadingMovies

    useEffect(() => {
        if (!cinemaId) {
            notifyError('ID de cine no válido')
            navigate('/cines')
            return;
        }
    }, [cinemaId, navigate])

    useEffect(() => {
        if (cinemaError) {
            notifyError('Error al cargar los detalles del cine')
            logger.error('Failed to load cinema details', cinemaError, 'CinemaDetailsPage')
        }
    }, [cinemaError])

    const handleCinemaDelete = async () => {
        try {
            // Get all movies
            const moviesResponse = await moviesService.getAll()
            const allMovies = moviesResponse.data

            // Filter movies that reference this cinema
            const moviesToUpdate = allMovies.filter(eachMovie =>
                cinema?.movieId?.includes(eachMovie.id)
            )

            // Update each movie to remove cinema reference
            const updatePromises = moviesToUpdate.map(eachMovie => {
                const newCinemasIds = Array.isArray(eachMovie.cinemaId)
                    ? eachMovie.cinemaId.filter(id => id !== cinema?.id)
                    : eachMovie.cinemaId === cinema?.id ? [] : eachMovie.cinemaId

                return moviesService.update(eachMovie.id, {
                    ...eachMovie,
                    cinemaId: newCinemasIds
                })
            })

            await Promise.all(updatePromises)

            // Soft delete cinema
            await cinemasService.softDelete(cinemaId)

            notifySuccess('Cine eliminado correctamente')
            setShowModal(false)
            navigate('/cines')
        } catch (error) {
            logger.error('Failed to delete cinema', error, 'CinemaDetailsPage')
            notifyError('Error al eliminar el cine')
        }
    }

    if (!cinemaId) {
        return (
            <div className="CinemaDetailsPage">
                <Container>
                    <Alert variant="danger" className="mt-4" title="Error">
                        <p>ID de cine no válido.</p>
                        <div className="d-flex gap-2 mt-3">
                            <Button variant="primary" onClick={() => navigate('/cines')}>
                                <FaArrowLeft className="me-2" />
                                Volver a cines
                            </Button>
                            <Button variant="secondary" as={Link} to="/">
                                <FaHome className="me-2" />
                                Ir a Home
                            </Button>
                        </div>
                    </Alert>
                </Container>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="CinemaDetailsPage">
                <Container>
                    <SkeletonDetails />
                </Container>
            </div>
        )
    }

    if (cinemaError || !cinema) {
        return (
            <div className="CinemaDetailsPage">
                <Container>
                    <Alert variant="danger" className="mt-4" title="Error al cargar el cine">
                        <p>No se pudo cargar la información del cine. Por favor, intenta nuevamente.</p>
                        <div className="d-flex gap-2 mt-3">
                            <Button variant="primary" onClick={() => navigate('/cines')}>
                                <FaArrowLeft className="me-2" />
                            Volver a cines
                        </Button>
                            <Button variant="secondary" as={Link} to="/">
                                <FaHome className="me-2" />
                                Ir a Home
                            </Button>
                        </div>
                    </Alert>
                </Container>
            </div>
        )
    }

    const cinemaName = cinema?.name || 'Cine';
    const cinemaDescription = `Descubre ${cinemaName}. Información completa, películas en cartelera, ubicación, servicios y más.`;
    const cinemaImage = cinema?.cover?.[0] || 'https://res.cloudinary.com/dhluctrie/image/upload/v1731516947/favicon.png';
    const cinemaUrl = typeof window !== 'undefined' ? window.location.href : `https://lapremiere.com/cines/detalles/${cinemaId}`;

    return (
        <>
            <SEO
                title={cinemaName}
                description={cinemaDescription}
                keywords={`${cinemaName}, cine, ${cinema?.address?.city || ''}, cartelera, películas`}
                image={cinemaImage}
                url={cinemaUrl}
                type="business.business"
                cinema={cinema}
            />
            <div className="CinemaDetailsPage">

                        <Container>

                            {/* NAVIGATION BUTTONS */}
                            <Row className='mt-4 mb-3'>
                                <Col>
                                    <div className="d-flex align-items-center gap-3">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            as={Link} 
                                            to="/"
                                            className="back-home-btn"
                                        >
                                            <FaHome className="me-2" />
                                            Home
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => navigate(-1)}
                                            className="back-btn"
                                        >
                                            <FaArrowLeft className="me-2" />
                                            Volver
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            {/* NOMBRE & BOTONES */}
                            <Row className='mt-2'>

                                {/* NOMBRE */}
                                <Col md={"auto"} >
                                    <h4 className="section-title m-0 text-primary">{cinema?.name?.toUpperCase() || 'Cine'}</h4>
                                </Col>

                                {/* BOTONES */}
                                <Col>
                                    <Navbar>
                                        <Container>
                                            <Nav.Link as="a" href={cinema?.url} target="_blank" className="ms-3 text-primary fw-bold">
                                                Comprar entradas
                                            </Nav.Link>
                                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                                            <Navbar.Collapse id="responsive-navbar-nav" >
                                                <Nav className="ms-auto">

                                                    <Nav.Link className="text-primary" as={Link} to={"/cines"} >
                                                        Volver a cines
                                                    </Nav.Link>
                                                    {
                                                        loggedUser &&

                                                        <NavDropdown title="Editar" id="collapsible-nav-dropdown" className="text-primary">

                                                            <NavDropdown.Item as={Link} to={`/cines/editar/${cinemaId}`}>Editar cine</NavDropdown.Item>
                                                            <NavDropdown.Divider />
                                                            <NavDropdown.Item className="delete-button" onClick={() => setShowModal(true)}>Eliminar cine</NavDropdown.Item>

                                                        </NavDropdown>
                                                    }
                                                </Nav>
                                            </Navbar.Collapse>
                                        </Container>
                                    </Navbar>
                                </Col>

                            </Row>
                            <hr className="border-secondary" />

                            <Row className="mt-2 align-items-center">
                                <Col md={{ span: 4 }}>
                                    <Carousel>
                                        <Carousel.Item >
                                            <Image className="w-100 h-100 object-fit-cover" style={{ aspectRatio: "4 / 3", overflow: "hidden", width: "100%" }} src={cinema?.cover?.[0]} rounded />
                                        </Carousel.Item>
                                        <Carousel.Item >
                                            <Image className="w-100 h-100 object-fit-cover" style={{ aspectRatio: "4 / 3", overflow: "hidden", width: "100%" }} src={cinema?.cover?.[1]} rounded />
                                        </Carousel.Item>
                                        <Carousel.Item >
                                            <Image className="w-100 h-100 object-fit-cover" style={{ aspectRatio: "4 / 3", overflow: "hidden", width: "100%" }} src={cinema?.cover?.[2]} rounded />
                                        </Carousel.Item>
                                    </Carousel>
                                </Col>

                                <Col md={{ span: 8 }}>
                                    <Row>
                                        <Col className="details-container" md={{ span: 6 }}>
                                            <Row className="mb-3" >
                                                <Row>
                                                    <Col>
                                                        <span className="form-section-title text-primary">Dirección: </span>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <span className="text-primary">{cinema?.address?.street}, {cinema?.address?.zipcode} ({cinema?.address?.city})</span>
                                                    </Col>
                                                </Row>
                                            </Row>
                                            <Row className="mb-3">
                                                <Row>
                                                    <Col >
                                                        <span className="form-section-title text-primary">Precio: </span>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Stack direction="horizontal" gap={1}>
                                                            <Badge variant="medium">Normal: {cinema?.price?.regular}€</Badge>
                                                            <Badge variant="dark">Fin de semana: {cinema?.price?.weekend}€</Badge>
                                                            <Badge variant="light">Miércoles: {cinema?.price?.special}€</Badge>
                                                        </Stack>
                                                    </Col>
                                                </Row>
                                            </Row>
                                            <Row className="mb-3">
                                                <Row className="align-items-center">
                                                    <Col >
                                                        <span className="form-section-title text-primary">Servicios: </span>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Stack direction="horizontal" gap={1}>
                                                            {
                                                                cinema?.services?.map(elm => {
                                                                    return (
                                                                        <Badge variant="light" key={elm}>{elm}</Badge>
                                                                    )
                                                                })
                                                            }
                                                        </Stack>
                                                    </Col>
                                                </Row>
                                            </Row>
                                            <Row className="mb-3">
                                                <Row>
                                                    <Col>
                                                        <p className="text-primary"><span className="form-section-title">Specs: </span></p>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <Stack direction="horizontal" gap={3}>
                                                        {cinema?.specs?.is3D && (
                                                            <div className="cinema-detail-icon-container">
                                                                <FaGlasses className="cinema-detail-icon" size={32} />
                                                                <span className="cinema-detail-icon-label">3D</span>
                                                            </div>
                                                        )}
                                                        {cinema?.specs?.VO && (
                                                            <div className="cinema-detail-icon-container">
                                                                <FaClosedCaptioning className="cinema-detail-icon" size={32} />
                                                                <span className="cinema-detail-icon-label">VO</span>
                                                            </div>
                                                        )}
                                                        {cinema?.specs?.accesibility && (
                                                            <div className="cinema-detail-icon-container">
                                                                <FaWheelchair className="cinema-detail-icon" size={32} />
                                                                <span className="cinema-detail-icon-label">Acc.</span>
                                                            </div>
                                                        )}
                                                        </Stack>
                                                    </Col>
                                                </Row>
                                            </Row>
                                        </Col>

                                        <Col md={{ span: 6 }}>
                                            {cinema?.address && (
                                                <div>
                                                    <div className="d-flex justify-content-end mb-2">
                                                        <ShareButton 
                                                            url={typeof window !== 'undefined' ? `${window.location.origin}/cines/detalles/${cinemaId}` : `/cines/detalles/${cinemaId}`}
                                                            title={cinema.name}
                                                            type="cinema"
                                                        />
                                                    </div>
                                                    <EnhancedMap cinema={cinema} />
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <Row className="mt-5 p-2 bg-secondary rounded">
                                <Col>
                                    <h5 className="section-title fw-bold m-0 text-primary">
                                        PELÍCULAS EN CARTELERA {moviesInCinema.length > 0 && `(${moviesInCinema.length})`}
                                    </h5>
                                </Col>
                            </Row>
                            <hr className="border-secondary" />
                            {moviesInCinema.length === 0 ? (
                                <Row className="p-4">
                                    <Col>
                                        <Alert variant="info">
                                            No hay películas en cartelera en este cine.
                                        </Alert>
                                    </Col>
                                </Row>
                            ) : (
                            <Row className="flex-nowrap p-4" style={{ overflowX: "auto" }}>
                                    {moviesInCinema.map((elm, index) => {
                                        const movieKey = elm.id || elm._id || elm.tmdbId || `movie-${index}`;
                                        const movieId = elm.id || elm._id || elm.tmdbId;
                                        
                                        // Don't filter by isDeleted for TMDB movies
                                        const isDeleted = elm.isDeleted && !elm.tmdbId;
                                        
                                        if (!isDeleted) {
                                            return (
                                                <Col md={{ span: 2 }} key={movieKey} className="mb-3">
                                                    <Card className="MovieCard h-100 mx-auto">
                                                        <Link className="h-100 mx-auto" to={`/peliculas/detalles/${movieId}`}>
                                                            <Card.Img 
                                                                variant="top" 
                                                                className="h-100 object-fit-cover" 
                                                                src={elm.poster || elm.poster_path || '/placeholder-poster.jpg'} 
                                                                style={{ minHeight: '300px', objectFit: 'cover' }}
                                                            />
                                                        </Link>
                                                        {
                                                            elm.released !== false ?
                                                                <Button as="a" target="_blank" href={cinema?.url} variant="accent" className="rounded-0 rounded-bottom fw-bold m-0 w-100">Comprar entradas</Button>
                                                                :
                                                                <Button as="a" target="_blank" href={cinema?.url} variant="secondary" className="rounded-0 rounded-bottom fw-bold m-0 w-100">Próximamente</Button>
                                                        }
                                                    </Card>
                                                </Col>
                                            )
                                        }
                                        return null;
                                    })}
                            </Row>
                            )}

                        </Container>

                    </div >

                    <Modal
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        title="Eliminar cine seleccionado"
                        backdrop="static"
                        footer={
                            <>
                                <Button variant="danger" onClick={handleCinemaDelete}>
                                    Eliminar definitivamente
                                </Button>
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                            </>
                        }
                    >
                        <p className="text-primary">Si continúas no se podrá recuperar el cine seleccionado. ¿Estás seguro de que quieres continuar?</p>
                    </Modal>
                </>
    )
}
export default CinemaDetailsPage