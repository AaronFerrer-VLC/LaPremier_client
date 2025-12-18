import { Link, useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useContext, useMemo } from "react"
import { Col, Container, Row, ListGroup, Accordion } from "react-bootstrap"
import { FaStar, FaStarHalfAlt, FaPlayCircle, FaHome, FaArrowLeft } from "react-icons/fa"
import LazyImage from "../../../components/LazyImage/LazyImage"
import NewMovieReviewForm from "../../../components/NewMovieReviewForm/NewMovieReviewForm"
import FlagIcon from "../../../components/FlagIcon/FlagIcon"
import EditReviewForm from "../../../components/EditReviewForm/EditReviewForm"
import FavoriteButton from "../../../components/FavoriteButton/FavoriteButton"
import { AuthContext } from "../../../contexts/auth.context"
import { moviesService } from "../../../services/movies.service"
import { cinemasService } from "../../../services/cinemas.service"
import { reviewsService } from "../../../services/reviews.service"
import { useApi } from "../../../hooks/useApi"
import { notifySuccess, notifyError } from "../../../utils/notifications"
import logger from "../../../utils/logger"
import { SkeletonDetails } from "../../../components/SkeletonLoader/SkeletonLoader"
import { Button, Badge, Modal, Alert } from "../../../components/UI"
import SimilarMovies from "../../../components/SimilarMovies/SimilarMovies"
import RecommendedMovies from "../../../components/RecommendedMovies/RecommendedMovies"
import ReviewFilters from "../../../components/ReviewFilters/ReviewFilters"
import StreamingPlatforms from "../../../components/StreamingPlatforms/StreamingPlatforms"
import CitySelector from "../../../components/CitySelector/CitySelector"
import MovieCollection from "../../../components/MovieCollection/MovieCollection"
import { ENV } from "../../../config/env"
import locationService from "../../../services/location.service"
import "../MovieDetailsPage/MovieDetailsPage.css"

const countryNameToCode = {
    // Spanish names
    "Estados Unidos": "US",
    "España": "ES",
    "Inglaterra": "IN",
    "Reino Unido": "GB",
    "Canada": "CA",
    "México": "MX",
    "Alemania": "DE",
    "Japón": "JP",
    "Nueva Zelanda": "NZ",
    "Australia": "AU",
    // English names (from TMDB)
    "United States of America": "US",
    "United States": "US",
    "Spain": "ES",
    "England": "GB",
    "United Kingdom": "GB",
    "Canada": "CA",
    "Mexico": "MX",
    "Germany": "DE",
    "Japan": "JP",
    "New Zealand": "NZ",
    "Australia": "AU",
    "France": "FR",
    "Italy": "IT",
    "Brazil": "BR",
    "Argentina": "AR",
    "Chile": "CL",
    "Colombia": "CO",
    "Peru": "PE",
    "Venezuela": "VE",
    "China": "CN",
    "India": "IN",
    "South Korea": "KR",
    "Russia": "RU",
    "Poland": "PL",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
    "Austria": "AT",
    "Sweden": "SE",
    "Norway": "NO",
    "Denmark": "DK",
    "Finland": "FI",
    "Ireland": "IE",
    "Portugal": "PT",
    "Greece": "GR",
    "Turkey": "TR",
    "Egypt": "EG",
    "South Africa": "ZA",
    "Desconocido": "ZZ",
    "Unknown": "ZZ"
}

const MovieDetailsPage = () => {
    const { loggedUser } = useContext(AuthContext)
    const { movieId } = useParams()
    const navigate = useNavigate()

    const [showAddReviewModal, setShowAddReviewModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showEditReviewModal, setShowEditReviewModal] = useState(false)
    const [reviewToEdit, setReviewToEdit] = useState(null)
    const [filteredReviews, setFilteredReviews] = useState([])
    const [userCity, setUserCity] = useState(null)
    // Helper function to get Wikipedia URL
    const getWikipediaUrl = (name) => {
        if (!name) return null;
        // Encode the name for Wikipedia URL
        const encodedName = encodeURIComponent(name);
        // Try Spanish Wikipedia first, fallback to English
        return `https://es.wikipedia.org/wiki/${encodedName}`;
    }

    const handlePersonClick = (name) => {
        if (!name) return;
        const wikipediaUrl = getWikipediaUrl(name);
        if (wikipediaUrl) {
            window.open(wikipediaUrl, '_blank', 'noopener,noreferrer');
        }
    }

    // Load user city on mount
    useEffect(() => {
        const loadUserCity = async () => {
            try {
                const city = await locationService.getUserCity();
                setUserCity(city);
            } catch (error) {
                logger.error('Failed to load user city', error, 'MovieDetailsPage');
                setUserCity(null);
            }
        };
        loadUserCity();
    }, []);

    // Check if movieId is a TMDB ID (numeric)
    const isTMDBId = useMemo(() => {
        return /^\d+$/.test(movieId);
    }, [movieId]);

    // Fetch movie details - try TMDB first if numeric ID, otherwise MongoDB
    const { data: movie, loading: isLoadingMovie, error: movieError } = useApi(
        async () => {
            // If it's a numeric ID (TMDB), try TMDB first if enabled
            if (isTMDBId && ENV.HAS_TMDB) {
                try {
                    const tmdbMovie = await moviesService.getFromTMDB(Number(movieId));
                    logger.info('Movie loaded from TMDB', { 
                        movieId, 
                        tmdbId: Number(movieId),
                        poster: tmdbMovie?.poster,
                        hasPoster: !!tmdbMovie?.poster,
                        posterType: typeof tmdbMovie?.poster
                    }, 'MovieDetailsPage');
                    return { data: tmdbMovie };
                } catch (tmdbError) {
                    logger.warn('Failed to get movie from TMDB, trying MongoDB', tmdbError, 'MovieDetailsPage');
                }
            }
            
            // Try MongoDB (either as primary source or fallback)
            try {
                const response = await moviesService.getById(movieId);
                logger.info('Movie loaded from MongoDB', { 
                    movieId,
                    poster: response?.data?.poster,
                    hasPoster: !!response?.data?.poster
                }, 'MovieDetailsPage');
                return response;
            } catch (error) {
                throw error;
            }
        },
        [movieId, isTMDBId]
    )

    // Fetch all cinemas
    const { data: allCinemas, loading: isLoadingCinemas } = useApi(
        () => cinemasService.getAll(),
        []
    )

    // Fetch reviews for this movie
    const { data: reviewsData, loading: isLoadingReviews, refetch: refetchReviews } = useApi(
        () => reviewsService.getByMovieId(movieId),
        [movieId]
    )

    const reviews = reviewsData || []
    const displayReviews = filteredReviews.length > 0 ? filteredReviews : reviews
    const isLoading = isLoadingMovie || isLoadingCinemas || isLoadingReviews

    // Check if movie is from TMDB (streaming) or local (in theaters)
    const isTMDBMovie = useMemo(() => {
        return isTMDBId || !!movie?.tmdbId;
    }, [isTMDBId, movie]);

    // Get watch providers for TMDB movies
    const watchProviders = useMemo(() => {
        return movie?.watchProviders || null;
    }, [movie]);

    // Get movie title for streaming links
    const movieTitle = useMemo(() => {
        return movie?.title?.spanish || movie?.title || movie?.original_title || '';
    }, [movie]);

    // Debug: Log movie data
    useEffect(() => {
        if (movie) {
            logger.info('Movie object received in MovieDetailsPage', { 
                poster: movie.poster,
                poster_path: movie.poster_path,
                backdrop: movie.backdrop,
                hasPoster: !!movie.poster,
                posterType: typeof movie.poster,
                trailer: movie.trailer,
                hasTrailer: !!movie.trailer,
                trailerType: typeof movie.trailer,
                movieId: movieId,
                tmdbId: movie.tmdbId,
                id: movie.id,
                title: movie.title,
                country: movie.country,
                language: movie.language,
                allKeys: Object.keys(movie)
            }, 'MovieDetailsPage');
        }
    }, [movie, movieId]);

    // Filter cinemas that show this movie
    const cinemasInMovie = useMemo(() => {
        if (!allCinemas || !movie) return []
        
        // Get all possible IDs for this movie
        const searchMovieIds = [
            movie.id,
            movie._id,
            movie.tmdbId,
            Number(movieId),
            // Also check if id/_id is a string representation of tmdbId
            movie.id && !isNaN(Number(movie.id)) ? Number(movie.id) : null,
            movie._id && !isNaN(Number(movie._id)) ? Number(movie._id) : null,
        ].filter(id => id !== null && id !== undefined && id !== '');
        
        if (searchMovieIds.length === 0) return [];
        
        // Filter cinemas that have this movie in their movieId array
        let cinemas = allCinemas.filter(eachCinema => {
            if (eachCinema.isDeleted) return false;
            
            const cinemaMovieIds = Array.isArray(eachCinema.movieId) 
                ? eachCinema.movieId 
                : (eachCinema.movieId ? [eachCinema.movieId] : []);
            
            if (cinemaMovieIds.length === 0) return false;
            
            // Check if any of the cinema's movie IDs match any of the movie's possible IDs
            return cinemaMovieIds.some(cinemaMovieId => {
                const cinemaMovieIdNum = Number(cinemaMovieId);
                const cinemaMovieIdStr = String(cinemaMovieId);
                
                return searchMovieIds.some(searchMovieId => {
                    const searchMovieIdNum = Number(searchMovieId);
                    const searchMovieIdStr = String(searchMovieId);
                    
                    // Compare as numbers if both are valid numbers
                    if (!isNaN(searchMovieIdNum) && !isNaN(cinemaMovieIdNum)) {
                        return searchMovieIdNum === cinemaMovieIdNum;
                    }
                    // Otherwise compare as strings
                    return searchMovieIdStr === cinemaMovieIdStr;
                });
            });
        });
        
        // Filter by city if userCity is selected
        if (userCity) {
            cinemas = cinemas.filter(cinema => 
                cinema.address?.city?.toLowerCase() === userCity.toLowerCase()
            )
        }
        
        return cinemas
    }, [allCinemas, movieId, movie, isTMDBMovie, userCity])

    // Calculate country code - handle both Spanish and English country names
    const countryCode = useMemo(() => {
        if (!movie?.country) return 'ZZ';
        
        // Try exact match first
        if (countryNameToCode[movie.country]) {
            return countryNameToCode[movie.country];
        }
        
        // Try case-insensitive match
        const countryLower = movie.country.toLowerCase();
        for (const [key, code] of Object.entries(countryNameToCode)) {
            if (key.toLowerCase() === countryLower) {
                return code;
            }
        }
        
        // If country is a 2-letter code, use it directly
        if (movie.country.length === 2 && /^[A-Z]{2}$/i.test(movie.country)) {
            return movie.country.toUpperCase();
        }
        
        return 'ZZ';
    }, [movie?.country])
    
    // Check if movie is available in Spanish
    const isAvailableInSpanish = useMemo(() => {
        // Check if original language is Spanish
        if (movie?.language === 'es' || movie?.language === 'es-ES') {
            return true;
        }
        
        // Check if there's a Spanish title (indicates translation available)
        if (movie?.title?.spanish && movie?.title?.spanish !== movie?.title?.original) {
            return true;
        }
        
        // For TMDB movies, check if original_language is not Spanish but we have Spanish title
        if (isTMDBMovie && movie?.title?.spanish) {
            return true;
        }
        
        return false;
    }, [movie?.language, movie?.title, isTMDBMovie])

    // Calculate average rating
    const averageRating = useMemo(() => {
        if (!reviews || reviews.length === 0) return 0
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
        return totalRating / reviews.length
    }, [reviews])

    useEffect(() => {
        if (movieError) {
            notifyError('Error al cargar los detalles de la película')
            logger.error('Failed to load movie details', movieError, 'MovieDetailsPage')
        }
    }, [movieError])

    const handleMovieDelete = async () => {
        try {
            const cinemasResponse = await cinemasService.getAll()
            const allCinemasData = cinemasResponse.data

            const cinemasToUpdate = allCinemasData.filter(eachCinema =>
                movie?.cinemaId?.includes(eachCinema.id)
            )

            const updatePromises = cinemasToUpdate.map(eachCinema => {
                const newMoviesIds = Array.isArray(eachCinema.movieId)
                    ? eachCinema.movieId.filter(id => id !== movie?.id)
                    : eachCinema.movieId === movie?.id ? [] : eachCinema.movieId

                return cinemasService.update(eachCinema.id, {
                    ...eachCinema,
                    movieId: newMoviesIds
                })
            })

            await Promise.all(updatePromises)
            await moviesService.softDelete(movieId)

            notifySuccess('Película eliminada correctamente')
            setShowDeleteModal(false)
            navigate('/peliculas')
        } catch (error) {
            logger.error('Failed to delete movie', error, 'MovieDetailsPage')
            notifyError('Error al eliminar la película')
        }
    }

    const addReview = async (newReview) => {
        try {
            const reviewWithMovieId = {
                ...newReview,
                movieId: Number(movieId),
                user: newReview.user || "Anónimo"
            }

            await reviewsService.create(reviewWithMovieId)
            notifySuccess('Reseña añadida correctamente')
            refetchReviews()
            setShowAddReviewModal(false)
        } catch (error) {
            logger.error('Failed to add review', error, 'MovieDetailsPage')
            notifyError('Error al añadir la reseña')
        }
    }

    const openEditReviewModal = (review) => {
        setReviewToEdit(review)
        setShowEditReviewModal(true)
    }
    
    const updateReview = async (reviewDataOrId, updatedData) => {
        try {
            let reviewId, dataToUpdate
            if (typeof reviewDataOrId === 'object' && reviewDataOrId.id) {
                reviewId = reviewDataOrId.id
                const { id, ...rest } = reviewDataOrId
                dataToUpdate = rest
            } else {
                reviewId = reviewDataOrId
                dataToUpdate = updatedData
            }
            
            await reviewsService.update(reviewId, dataToUpdate)
            notifySuccess('Reseña actualizada correctamente')
            logger.info('Review updated successfully', { reviewId: reviewId }, 'MovieDetailsPage')
            refetchReviews()
            setShowEditReviewModal(false)
        } catch (error) {
            logger.error('Failed to update review', error, 'MovieDetailsPage')
            notifyError('Error al actualizar la reseña')
        }
    }

    if (isLoading) {
        return (
            <div className="MovieDetailsPage">
                <Container>
                    <SkeletonDetails />
                </Container>
            </div>
        )
    }

    if (movieError || !movie) {
        return (
            <div className="MovieDetailsPage">
                <Container>
                    <Alert variant="danger" className="mt-4" title="Error al cargar la película">
                        <p>No se pudo cargar la información de la película. Por favor, intenta nuevamente.</p>
                        <div className="d-flex gap-2 mt-3">
                            <Button variant="primary" onClick={() => navigate('/peliculas')}>
                                <FaArrowLeft className="me-2" />
                                Volver a películas
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

    return (
        <div className="MovieDetailsPage">
            <Container>
                {/* HEADER WITH NAVIGATION */}
                <Row className="mt-4 mb-3">
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
                            {loggedUser && !isTMDBMovie && (
                                <div className="ms-auto">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        as={Link} 
                                        to={`/peliculas/editar/${movieId}`}
                                    >
                                        Editar
                                    </Button>
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        className="ms-2"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* MOVIE TITLE */}
                <Row className="mb-4">
                    <Col>
                        <h1 className="movie-title-main">
                            {movie?.title?.spanish?.toUpperCase() || movie?.title || "Sin título"}
                        </h1>
                        {movie?.title?.original && movie?.title?.original !== movie?.title?.spanish && (
                            <p className="movie-title-original text-secondary">
                                {movie.title.original}
                            </p>
                        )}
                    </Col>
                </Row>

                {/* MAIN CONTENT */}
                <Row className="mb-5">
                    {/* LEFT COLUMN - POSTER & DETAILS */}
                    <Col lg={4} className="mb-4">
                        {/* POSTER */}
                        <div className="movie-poster-wrapper mb-4">
                            <div className="position-relative movie-poster-container">
                                {(() => {
                                    // Get poster URL from various possible fields
                                    let posterUrl = movie?.poster || movie?.poster_path || null;
                                    
                                    // If poster is null or invalid, try backdrop as fallback
                                    if (!posterUrl || posterUrl === 'null' || posterUrl === 'undefined') {
                                        posterUrl = movie?.backdrop || movie?.backdrop_path || null;
                                    }
                                    
                                    // Validate poster URL
                                    const hasValidPoster = posterUrl && 
                                        typeof posterUrl === 'string' && 
                                        posterUrl.trim() !== '' && 
                                        posterUrl !== 'null' &&
                                        posterUrl !== 'undefined';
                                    
                                    if (hasValidPoster) {
                                        // Construct full URL if needed
                                        let finalPosterUrl = posterUrl.trim();
                                        
                                        // If it's a relative path (starts with / but not //), construct TMDB URL
                                        if (finalPosterUrl.startsWith('/') && !finalPosterUrl.startsWith('//')) {
                                            finalPosterUrl = `https://image.tmdb.org/t/p/w500${finalPosterUrl}`;
                                        }
                                        
                                        return (
                                            <>
                                                <img
                                                    src={finalPosterUrl}
                                                    alt={movie?.title?.spanish || movie?.title?.original || movie?.title || 'Movie poster'}
                                                    className="movie-poster-image"
                                                    onError={(e) => {
                                                        logger.warn('Poster image failed to load', { 
                                                            posterUrl: finalPosterUrl,
                                                            originalPoster: posterUrl,
                                                            movieId: movieId
                                                        }, 'MovieDetailsPage');
                                                        e.target.style.display = 'none';
                                                        const container = e.target.closest('.movie-poster-container');
                                                        if (container) {
                                                            const placeholder = container.querySelector('.movie-poster-placeholder-fallback');
                                                            if (placeholder) {
                                                                placeholder.style.display = 'flex';
                                                            }
                                                        }
                                                    }}
                                                    onLoad={(e) => {
                                                        logger.info('Poster image loaded successfully', { 
                                                            posterUrl: finalPosterUrl,
                                                            movieId: movieId
                                                        }, 'MovieDetailsPage');
                                                        // Ensure image is visible
                                                        e.target.style.opacity = '1';
                                                        e.target.style.display = 'block';
                                                        e.target.style.visibility = 'visible';
                                                        e.target.style.position = 'absolute';
                                                        e.target.style.top = '0';
                                                        e.target.style.left = '0';
                                                        e.target.style.width = '100%';
                                                        e.target.style.height = '100%';
                                                        e.target.style.objectFit = 'cover';
                                                    }}
                                                    loading="eager"
                                                />
                                                <div className="movie-poster-placeholder movie-poster-placeholder-fallback" style={{ display: 'none' }}>
                                                    <div className="placeholder-icon">🎬</div>
                                                    <div className="placeholder-text">Error al cargar imagen</div>
                                                </div>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <div className="movie-poster-placeholder">
                                                <div className="placeholder-icon">🎬</div>
                                                <div className="placeholder-text">Imagen no disponible</div>
                                            </div>
                                        );
                                    }
                                })()}
                                
                                {(() => {
                                    // Get trailer URL - can be full URL or YouTube key
                                    const trailerUrl = movie?.trailer;
                                    let finalTrailerUrl = null;
                                    
                                    if (trailerUrl && typeof trailerUrl === 'string' && trailerUrl.trim() !== '' && trailerUrl !== 'null') {
                                        const trimmed = trailerUrl.trim();
                                        
                                        // If it's already a full URL, use it
                                        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                                            finalTrailerUrl = trimmed;
                                        } 
                                        // If it's a YouTube key (just the key, no URL), construct the URL
                                        else if (trimmed.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
                                            finalTrailerUrl = `https://www.youtube.com/watch?v=${trimmed}`;
                                        }
                                        // If it starts with watch?v=, add https://www.youtube.com/
                                        else if (trimmed.startsWith('watch?v=')) {
                                            finalTrailerUrl = `https://www.youtube.com/${trimmed}`;
                                        }
                                    }
                                    
                                    if (finalTrailerUrl) {
                                        return (
                                            <div 
                                                className="trailer-overlay"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    window.open(finalTrailerUrl, "_blank", "noopener,noreferrer");
                                                }}
                                                title="Ver trailer en YouTube"
                                            >
                                                <FaPlayCircle size={60} />
                                                <span className="trailer-text">Ver Trailer</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                                <div className="favorite-button-overlay">
                                    <FavoriteButton 
                                        movieId={movieId} 
                                        tmdbId={movie?.tmdbId || (isTMDBId ? Number(movieId) : null)}
                                        type="favorite" 
                                        size="lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* STREAMING PLATFORMS - Prominent display */}
                        {isTMDBMovie && watchProviders && (
                            <div className="streaming-platforms-section mb-4">
                                <StreamingPlatforms 
                                    watchProviders={watchProviders}
                                    region="ES"
                                    showLabel={true}
                                    movieTitle={movieTitle}
                                />
                            </div>
                        )}

                        {/* CINEMAS - For movies in theaters (both local and TMDB) */}
                        {(cinemasInMovie.length > 0 || !isTMDBMovie) && (
                            <div className="cinemas-section mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="section-subtitle mb-0">
                                        <strong>
                                            {cinemasInMovie.length > 0 
                                                ? `Cines Disponibles (${cinemasInMovie.length})` 
                                                : 'Cines Disponibles'}
                                        </strong>
                                    </h5>
                                    <CitySelector
                                        currentCity={userCity}
                                        onCityChange={(city) => {
                                            setUserCity(city);
                                            locationService.setUserCity(city);
                                        }}
                                    />
                                </div>
                                {cinemasInMovie.length > 0 ? (
                                    <ListGroup variant="flush">
                                        {cinemasInMovie.map((cinema) => {
                                            const cinemaKey = cinema.id || cinema._id || `cinema-${cinema.name}`;
                                            return (
                                                <ListGroup.Item key={cinemaKey} className="cinema-list-item d-flex justify-content-between align-items-center">
                                                    <Link 
                                                        to={`/cines/detalles/${cinema.id || cinema._id}`} 
                                                        className="cinema-link flex-grow-1"
                                                    >
                                                        {cinema.name}
                                                        {cinema.address?.city && (
                                                            <small className="text-secondary d-block">
                                                                📍 {cinema.address.city}
                                                            </small>
                                                        )}
                                                    </Link>
                                                    {cinema.url && (
                                                        <Button
                                                            as="a"
                                                            href={cinema.url}
                                                            target="_blank"
                                                            variant="accent"
                                                            size="sm"
                                                            className="ms-3"
                                                        >
                                                            Comprar entradas
                                                        </Button>
                                                    )}
                                                </ListGroup.Item>
                                            );
                                        })}
                                    </ListGroup>
                                ) : (
                                    <Alert variant="info" className="mb-0">
                                        {userCity 
                                            ? `No hay cines disponibles en ${userCity} para esta película.`
                                            : 'Selecciona una ciudad para ver los cines disponibles.'}
                                    </Alert>
                                )}
                            </div>
                        )}
                    </Col>

                    {/* RIGHT COLUMN - INFO & CASTING */}
                    <Col lg={8}>
                        {/* MOVIE DETAILS GRID */}
                        <Row className="movie-details-grid mb-4">
                            <Col xs={6} md={4} className="detail-item">
                                <div className="detail-label">País</div>
                                <div className="detail-value">
                                    {movie?.country || 'N/A'}{' '}
                                    {countryCode && countryCode !== 'ZZ' && (
                                        <FlagIcon countryCode={countryCode} size="small" />
                                    )}
                                </div>
                            </Col>
                            <Col xs={6} md={4} className="detail-item">
                                <div className="detail-label">Idioma</div>
                                <div className="detail-value">
                                    {movie?.language || 'N/A'}
                                    {isAvailableInSpanish && movie?.language !== 'es' && movie?.language !== 'es-ES' && (
                                        <Badge variant="success" className="ms-2">ES</Badge>
                                    )}
                                </div>
                            </Col>
                            <Col xs={6} md={4} className="detail-item">
                                <div className="detail-label">Duración</div>
                                <div className="detail-value">{movie?.duration ? `${movie.duration} min` : 'N/A'}</div>
                            </Col>
                            <Col xs={6} md={4} className="detail-item">
                                <div className="detail-label">Fecha</div>
                                <div className="detail-value">
                                    {movie?.date ? new Date(movie.date).toLocaleDateString('es-ES') : 'N/A'}
                                </div>
                            </Col>
                            <Col xs={6} md={4} className="detail-item">
                                <div className="detail-label">Director</div>
                                {movie?.director ? (
                                    <div 
                                        className="detail-value clickable-person"
                                        onClick={() => handlePersonClick(movie.director)}
                                        style={{ cursor: 'pointer' }}
                                        title="Ver en Wikipedia"
                                    >
                                        {movie.director}
                                    </div>
                                ) : (
                                    <div className="detail-value">N/A</div>
                                )}
                            </Col>
                            <Col xs={12} className="detail-item">
                                <div className="detail-label">Género</div>
                                <div className="detail-value">
                                    {movie?.gender?.length > 0 ? (
                                        movie.gender.map((gen) => (
                                            <Badge key={gen} variant="accent" className="me-2 mb-2">
                                                {gen}
                                            </Badge>
                                        ))
                                    ) : (
                                        'N/A'
                                    )}
                                </div>
                            </Col>
                        </Row>

                        {/* SYNOPSIS */}
                        <div className="synopsis-section mb-4">
                            <h3 className="section-title">Sinopsis</h3>
                            <p className="synopsis-text">
                                {movie?.description || movie?.overview || "Sin descripción disponible."}
                            </p>
                        </div>

                        {/* CASTING */}
                        {movie?.casting && movie.casting.length > 0 && (
                            <div className="casting-section mb-4">
                                <h3 className="section-title mb-3">Reparto</h3>
                                <div className="casting-scroll">
                                    {movie.casting.map((actor, index) => {
                                        const actorKey = actor.name || `actor-${index}`;
                                        const actorName = actor.name || `Actor ${index + 1}`;
                                        return (
                                            <div 
                                                key={actorKey} 
                                                className="actor-card clickable"
                                                onClick={() => handlePersonClick(actor.name)}
                                                style={{ cursor: actor.name ? 'pointer' : 'default' }}
                                                title={actor.name ? "Ver en Wikipedia" : undefined}
                                            >
                                                {actor.photo && actor.photo.trim() !== "" ? (
                                                    <LazyImage
                                                        src={actor.photo}
                                                        alt={actorName}
                                                        className="actor-photo"
                                                        style={{ borderRadius: '50%' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM1MzUzNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiBmaWxsPSIjODA4MDgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+RpDwvdGV4dD48L3N2Zz4=';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="actor-photo-placeholder">
                                                        👤
                                                    </div>
                                                )}
                                                <p className="actor-name">
                                                    {actorName}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* RATING SECTION */}
                        <div className="rating-section mb-4">
                            <Row className="align-items-center">
                                <Col md="auto">
                                    <div className="rating-display">
                                        {averageRating > 0 ? (
                                            <>
                                                <div className="rating-number">{averageRating.toFixed(1)}</div>
                                                <div className="rating-stars">
                                                    {[...Array(5)].map((_, starIdx) => {
                                                        const isFull = averageRating >= starIdx + 1
                                                        const isHalf = averageRating >= starIdx + 0.5 && averageRating < starIdx + 1
                                                        return (
                                                            <span key={`avg-star-${starIdx}`} className="star-icon">
                                                                {isFull ? (
                                                                    <FaStar style={{ color: "#ffb400" }} />
                                                                ) : isHalf ? (
                                                                    <FaStarHalfAlt style={{ color: "#ffb400" }} />
                                                                ) : (
                                                                    <FaStar style={{ color: "#e4e5e9" }} />
                                                                )}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                <div className="rating-count text-secondary">
                                                    {reviews.length} {reviews.length === 1 ? 'valoración' : 'valoraciones'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="no-rating">
                                                <span className="text-secondary">Sin valoraciones aún</span>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                                <Col md="auto" className="ms-auto">
                                    <Button 
                                        variant="accent" 
                                        size="lg" 
                                        onClick={() => setShowAddReviewModal(true)}
                                        className="rate-button"
                                    >
                                        Valorar Película
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>

                {/* REVIEWS SECTION */}
                <Row className="mb-5">
                    <Col>
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>
                                    <strong className="text-primary">
                                        Comentarios y Reseñas ({reviews.length})
                                    </strong>
                                </Accordion.Header>
                                <Accordion.Body className="p-3">
                                    <ReviewFilters 
                                        reviews={reviews} 
                                        onFilteredReviewsChange={setFilteredReviews}
                                    />
                                    <div className="reviews-list">
                                        {displayReviews.length > 0 ? (
                                            <ListGroup variant="flush">
                                                {displayReviews.map((review) => {
                                                    const reviewKey = review.id || review._id || `review-${review.user}-${review.movieId}-${review.createdAt || Date.now()}`;
                                                    return (
                                                        <ListGroup.Item key={reviewKey} className="review-item">
                                                            <div className="review-header">
                                                                <strong className="review-author">
                                                                    {review.user || "Anónimo"}
                                                                </strong>
                                                                {loggedUser && (
                                                                    <Button 
                                                                        variant="outline" 
                                                                        size="sm"
                                                                        onClick={() => openEditReviewModal(review)}
                                                                    >
                                                                        Editar
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <p className="review-comment">{review.comment}</p>
                                                            <div className="review-rating">
                                                                {[...Array(5)].map((_, starIdx) => (
                                                                    <span 
                                                                        key={`${reviewKey}-star-${starIdx}`} 
                                                                        className={`star ${starIdx < (review.rating || 0) ? 'filled' : ''}`}
                                                                    >
                                                                        ★
                                                                    </span>
                                                                ))}
                                                                <span className="rating-text ms-2">
                                                                    ({review.rating || 0}/5)
                                                                </span>
                                                            </div>
                                                        </ListGroup.Item>
                                                    );
                                                })}
                                            </ListGroup>
                                        ) : (
                                            <div className="no-reviews text-center py-4">
                                                <p className="text-primary mb-2">No hay comentarios para esta película.</p>
                                                <p className="text-secondary">Sé el primero en dejar un comentario.</p>
                                            </div>
                                        )}
                                    </div>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </Col>
                </Row>

                {/* MOVIE COLLECTION */}
                {movie?.collection?.id && (
                    <MovieCollection 
                        collectionId={movie.collection.id} 
                        collectionName={movie.collection.name}
                    />
                )}

                {/* RECOMMENDED MOVIES */}
                {movie && <RecommendedMovies currentMovie={movie} limit={4} />}

                {/* SIMILAR MOVIES */}
                {movie && <SimilarMovies currentMovie={movie} limit={4} />}

                {/* MODALS */}
                <Modal
                    show={showAddReviewModal}
                    onHide={() => setShowAddReviewModal(false)}
                    title="Añadir una valoración"
                    backdrop="static"
                >
                    <NewMovieReviewForm
                        onAddReview={addReview}
                        onCloseModal={() => setShowAddReviewModal(false)}
                    />
                </Modal>

                <Modal
                    show={showEditReviewModal}
                    onHide={() => setShowEditReviewModal(false)}
                    title="Editar reseña"
                    backdrop="static"
                >
                    <EditReviewForm
                        reviewToEdit={reviewToEdit}
                        updateReview={updateReview}
                        setShowEditReviewModal={setShowEditReviewModal}
                    />
                </Modal>

                <Modal
                    show={showDeleteModal}
                    onHide={() => setShowDeleteModal(false)}
                    title="Eliminar película"
                    backdrop="static"
                    footer={
                        <>
                            <Button variant="danger" onClick={handleMovieDelete}>
                                Eliminar definitivamente
                            </Button>
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                Cancelar
                            </Button>
                        </>
                    }
                >
                    <p className="text-primary">
                        Si continúas no se podrá recuperar la película seleccionada. ¿Estás seguro de que quieres continuar?
                    </p>
                </Modal>
            </Container>
        </div>
    )
}

export default MovieDetailsPage
