import "./HomePage.css"
import CinemasGlobalFilter from "../../components/CinemasGlobalFilter/CinemasGlobalFilter";
import MoviesGlobalFilter from "../../components/MoviesGlobalFilter/MoviesGlobalFilter";
import CitySelector from "../../components/CitySelector/CitySelector";
import { useState, useMemo, useEffect } from "react";
import { Container, Col, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { moviesService } from "../../services/movies.service"
import { cinemasService } from "../../services/cinemas.service"
import locationService from "../../services/location.service"
import { useApi } from "../../hooks/useApi"
import { SkeletonCardList } from "../../components/SkeletonLoader/SkeletonLoader"
import { Button, Card } from "../../components/UI"
import MovieCard from "../../components/MovieCard/MovieCard"
import { FaFilm, FaTheaterMasks, FaStar, FaArrowRight, FaFire, FaTrophy, FaCalendarAlt } from "react-icons/fa"
import { ENV } from "../../config/env"
import logger from "../../utils/logger"

const HomePage = () => {
    const [filterSelected, setFilterSelected] = useState("")
    const [videoLoaded, setVideoLoaded] = useState(false)
    const [userCity, setUserCity] = useState(null)
    const [nowPlayingMovies, setNowPlayingMovies] = useState([])
    const [loadingNowPlaying, setLoadingNowPlaying] = useState(false)
    const [trendingMovies, setTrendingMovies] = useState([])
    const [loadingTrending, setLoadingTrending] = useState(false)
    const [popularMovies, setPopularMovies] = useState([])
    const [loadingPopular, setLoadingPopular] = useState(false)
    const [upcomingMovies, setUpcomingMovies] = useState([])
    const [loadingUpcoming, setLoadingUpcoming] = useState(false)
    const [activeTab, setActiveTab] = useState('nowPlaying')

    // Fetch data for featured content
    const { data: movies, loading: loadingMovies } = useApi(
        () => moviesService.getAll(),
        []
    )

    const { data: cinemas, loading: loadingCinemas } = useApi(
        () => cinemasService.getAll(),
        []
    )

    // Load user city on mount
    useEffect(() => {
        const loadUserCity = async () => {
            try {
                const city = await locationService.getUserCity();
                setUserCity(city);
            } catch (error) {
                logger.error('Failed to load user city', error, 'HomePage');
                setUserCity('Madrid'); // Default
            }
        };
        loadUserCity();
    }, []);

    // Fetch movies from TMDB
    useEffect(() => {
        const fetchMovies = async () => {
            if (!ENV.HAS_TMDB) return;

            try {
                // Fetch all categories in parallel
                const [nowPlaying, trending, popular, upcoming] = await Promise.all([
                    moviesService.getNowPlayingFromTMDB(1).catch(() => []),
                    moviesService.getTrendingFromTMDB('day', 1).catch(() => []),
                    moviesService.getPopularFromTMDB(1).catch(() => []),
                    moviesService.getUpcomingFromTMDB(1).catch(() => []),
                ]);

                setNowPlayingMovies(nowPlaying.slice(0, 6));
                setTrendingMovies(trending.slice(0, 6));
                setPopularMovies(popular.slice(0, 6));
                setUpcomingMovies(upcoming.slice(0, 6));
            } catch (error) {
                logger.error('Failed to fetch movies from TMDB', error, 'HomePage');
            } finally {
                setLoadingNowPlaying(false);
                setLoadingTrending(false);
                setLoadingPopular(false);
                setLoadingUpcoming(false);
            }
        };

        if (userCity) {
            setLoadingNowPlaying(true);
            setLoadingTrending(true);
            setLoadingPopular(true);
            setLoadingUpcoming(true);
            fetchMovies();
        }
    }, [userCity]);

    const handleFilterSelected = filter => {
        setFilterSelected(filter)
    }

    // Removed featuredMovies - only using TMDB now playing movies

    // Get cinemas in user's city
    const cinemasInCity = useMemo(() => {
        if (!cinemas || !userCity) return [];
        return cinemas.filter(
            (cinema) =>
                !cinema.isDeleted &&
                cinema.address?.city?.toLowerCase() === userCity.toLowerCase()
        );
    }, [cinemas, userCity]);

    // Get featured cinemas - prefer cinemas in user's city
    const featuredCinemas = useMemo(() => {
        if (cinemasInCity.length > 0) {
            return cinemasInCity.slice(0, 3);
        }
        if (!cinemas) return []
        return cinemas
            .filter(cinema => !cinema.isDeleted)
            .slice(0, 3)
    }, [cinemasInCity, cinemas])

    // Calculate statistics
    const stats = useMemo(() => {
        const activeMovies = movies?.filter(m => !m.isDeleted) || []
        const activeCinemas = cinemas?.filter(c => !c.isDeleted) || []
        
        return {
            totalMovies: activeMovies.length,
            totalCinemas: activeCinemas.length,
            totalRooms: activeCinemas.reduce((sum, c) => sum + (c.capacity?.dicerooms || 0), 0),
            totalSeating: activeCinemas.reduce((sum, c) => sum + (c.capacity?.seating || 0), 0)
        }
    }, [movies, cinemas])

    const handleVideoLoad = () => {
        setVideoLoaded(true)
    }

    return (
        <main className="HomePage" role="main">
            {/* Hero Section */}
            <section className="hero-section position-relative" aria-label="Sección principal">
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="video-content"
                    onLoadedData={handleVideoLoad}
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23000' width='1920' height='1080'/%3E%3C/svg%3E"
                    aria-label="Video de fondo"
                >
                    <source src="https://res.cloudinary.com/dhluctrie/video/upload/v1732182659/background-video_cudoag.mp4" type="video/mp4" />
                    Tu navegador no soporta videos.
                </video>
                
                {!videoLoaded && (
                    <div className="video-placeholder" />
                )}

                <Container className="hero-content d-flex flex-column justify-content-center align-items-center min-vh-100 p-5">
                    <div className="hero-text text-center" style={{ zIndex: 100 }}>
                        <h1 className="hero-title mb-4 animate-fade-in text-primary">
                            LA PREMIERE
                        </h1>
                        <h2 className="hero-subtitle mb-5 animate-fade-in-delay text-primary">
                            Encuentra tu peli favorita, en tu cine favorito
                        </h2>
                        
                        <div className="search-section mt-5 animate-fade-in-delay-2">
                            <div className="mb-3 d-flex justify-content-center">
                                <CitySelector
                                    currentCity={userCity}
                                    onCityChange={(city) => {
                                        setUserCity(city);
                                        locationService.setUserCity(city);
                                    }}
                                />
                            </div>
                            <p className="mb-4 start-question">¿Por dónde quieres empezar?</p>
                            <Row className="g-3 justify-content-center">
                                <Col xs={12} md={5}>
                                    <CinemasGlobalFilter 
                                        filterSelected={filterSelected} 
                                        handleFilterSelected={handleFilterSelected} 
                                    />
                                </Col>
                                <Col xs={12} md={5}>
                                    <MoviesGlobalFilter 
                                        filterSelected={filterSelected} 
                                        handleFilterSelected={handleFilterSelected} 
                                    />
                                </Col>
                            </Row>
                        </div>

                        {/* Quick Actions */}
                        <Row className="mt-5 g-3 justify-content-center">
                            <Col xs={12} sm={6} md={3}>
                                <Button 
                                    as={Link} 
                                    to="/peliculas" 
                                    variant="outline" 
                                    size="lg" 
                                    className="w-100 quick-action-btn d-flex flex-column align-items-center justify-content-center"
                                >
                                    <FaFilm className="mb-2" style={{ fontSize: '1.5rem' }} />
                                    <span>Ver</span>
                                    <span>Películas</span>
                                </Button>
                            </Col>
                            <Col xs={12} sm={6} md={3}>
                                <Button 
                                    as={Link} 
                                    to="/cines" 
                                    variant="outline" 
                                    size="lg" 
                                    className="w-100 quick-action-btn d-flex flex-column align-items-center justify-content-center"
                                >
                                    <FaTheaterMasks className="mb-2" style={{ fontSize: '1.5rem' }} />
                                    <span>Ver</span>
                                    <span>Cines</span>
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </section>

            {/* Statistics Section */}
            <section className="stats-section py-5" aria-label="Estadísticas">
                <Container>
                    <h2 className="visually-hidden">Estadísticas de LA PREMIERE</h2>
                    <Row className="g-4">
                        <Col xs={6} md={3}>
                            <Card className="stat-card text-center border-0" role="article" aria-label={`${stats.totalMovies} películas disponibles`}>
                                <Card.Body>
                                    <FaFilm size={40} className="mb-3 stat-icon" aria-hidden="true" />
                                    <h3 className="stat-number">{stats.totalMovies}</h3>
                                    <p className="stat-label mb-0">Películas</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} md={3}>
                            <Card className="stat-card text-center border-0" role="article" aria-label={`${stats.totalCinemas} cines disponibles`}>
                                <Card.Body>
                                    <FaTheaterMasks size={40} className="mb-3 stat-icon" aria-hidden="true" />
                                    <h3 className="stat-number">{stats.totalCinemas}</h3>
                                    <p className="stat-label mb-0">Cines</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} md={3}>
                            <Card className="stat-card text-center border-0" role="article" aria-label={`${stats.totalRooms} salas disponibles`}>
                                <Card.Body>
                                    <FaStar size={40} className="mb-3 stat-icon" aria-hidden="true" />
                                    <h3 className="stat-number">{stats.totalRooms}</h3>
                                    <p className="stat-label mb-0">Salas</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={6} md={3}>
                            <Card className="stat-card text-center border-0" role="article" aria-label={`${stats.totalSeating.toLocaleString()} butacas disponibles`}>
                                <Card.Body>
                                    <FaTheaterMasks size={40} className="mb-3 stat-icon" aria-hidden="true" />
                                    <h3 className="stat-number">{stats.totalSeating.toLocaleString()}</h3>
                                    <p className="stat-label mb-0">Butacas</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Featured Movies Section - Now Playing from TMDB */}
            {ENV.HAS_TMDB && (
                <section className="featured-section py-5" aria-label="Películas en cartelera">
                    <Container>
                        <Row className="align-items-center mb-4">
                            <Col>
                                <h2 className="section-title">
                                    {userCity ? `Películas en Cartelera - ${userCity}` : 'Películas en Cartelera'}
                                </h2>
                            </Col>
                            <Col xs="auto">
                                <Button 
                                    as={Link} 
                                    to="/peliculas/cartelera" 
                                    variant="outline"
                                    className="see-all-btn"
                                >
                                    Ver todas <FaArrowRight className="ms-2" />
                                </Button>
                            </Col>
                        </Row>
                        {loadingNowPlaying ? (
                            <SkeletonCardList count={3} />
                        ) : nowPlayingMovies.length > 0 ? (
                            <Row className="g-4">
                                {nowPlayingMovies.slice(0, 3).map((movie) => {
                                    const uniqueKey = movie.id || movie._id || movie.tmdbId || `tmdb-${movie.tmdbId}`;
                                    return (
                                        <Col key={uniqueKey} xs={12} md={4}>
                                            <MovieCard
                                                movie={movie}
                                                id={movie.id}
                                                tmdbId={movie.tmdbId}
                                                title={movie.title}
                                                country={movie.country}
                                                duration={movie.duration}
                                                language={movie.language}
                                                calification={movie.calification}
                                                poster={movie.poster}
                                            />
                                        </Col>
                                    );
                                })}
                            </Row>
                        ) : (
                            <p className="text-secondary text-center">No hay películas en cartelera disponibles</p>
                        )}
                    </Container>
                </section>
            )}


            {/* Featured Cinemas Section */}
            {!loadingCinemas && featuredCinemas.length > 0 && (
                <section className="featured-section py-5" aria-label="Cines destacados">
                    <Container>
                        <Row className="align-items-center mb-4">
                            <Col>
                                <h2 className="section-title">
                                    {userCity ? `Cines en ${userCity}` : 'Cines Destacados'}
                                </h2>
                            </Col>
                            <Col xs="auto">
                                <Button 
                                    as={Link} 
                                    to="/cines" 
                                    variant="outline"
                                    className="see-all-btn"
                                >
                                    Ver todos <FaArrowRight className="ms-2" />
                                </Button>
                            </Col>
                        </Row>
                        {loadingCinemas ? (
                            <SkeletonCardList count={3} />
                        ) : (
                            <Row className="g-4">
                                {featuredCinemas.map(cinema => {
                                    const uniqueKey = cinema.id || cinema._id || `cinema-${cinema.name}`;
                                    return (
                                        <Col key={uniqueKey} xs={12} md={4}>
                                            <Card 
                                                as={Link} 
                                                to={`/cines/detalles/${cinema.id}`}
                                                className="featured-card h-100 border-0 text-decoration-none"
                                            >
                                                <Card.Img 
                                                    variant="top" 
                                                    src={cinema.cover?.[0]} 
                                                    alt={cinema.name}
                                                    style={{ height: '350px', objectFit: 'cover' }}
                                                />
                                                <Card.Body>
                                                    <Card.Title className="text-primary">{cinema.name}</Card.Title>
                                                    <Card.Text className="text-secondary">
                                                        {cinema.address?.city} • {cinema.capacity?.dicerooms} salas
                                                    </Card.Text>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </Container>
                </section>
            )}
        </main>
    )
}

export default HomePage