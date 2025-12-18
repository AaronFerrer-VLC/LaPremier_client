import { useEffect, useState } from "react"
import { Col, Row } from "react-bootstrap"
import MovieCard from "../MovieCard/MovieCard"
import MovieListItem from "../MovieListItem/MovieListItem"
import ViewToggle from "../ViewToggle/ViewToggle"
import "./MoviesList.css"
import { SkeletonCardList } from "../SkeletonLoader/SkeletonLoader"
import { moviesService } from "../../services/movies.service"
import { logError, formatErrorMessage } from "../../utils/errorHandler"
import { Alert, Button } from "../UI"
import { ENV } from "../../config/env"
import logger from "../../utils/logger"

const MoviesList = ({ filterData, searchQuery = '', city = null }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [movies, setMovies] = useState([])
    const [error, setError] = useState(null)
    const [viewMode, setViewMode] = useState('grid')

    useEffect(() => {
        fetchMovies()
    }, [searchQuery, filterData]) // Re-fetch when search query or filters change

    const fetchMovies = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            let fetchedMovies = []

            if (searchQuery) {
                // Search movies from TMDB
                const tmdbSearchData = await moviesService.searchTMDB(searchQuery, 1)
                fetchedMovies = (tmdbSearchData.results || []).map(movie => ({
                    ...movie,
                    id: movie.id, // Use TMDB's ID as the primary ID
                    tmdbId: movie.id,
                    title: {
                        original: movie.original_title,
                        spanish: movie.title
                    },
                    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    backdrop: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
                    overview: movie.overview,
                    release_date: movie.release_date,
                    vote_average: movie.vote_average,
                    vote_count: movie.vote_count,
                    country: movie.production_countries?.[0]?.iso_3166_1 || '',
                    language: movie.original_language,
                    calification: movie.release_date ? movie.release_date.split('-')[0] : '',
                    duration: null,
                    gender: movie.genre_ids,
                }))
                logger.info('Movies searched from TMDB', { query: searchQuery, count: fetchedMovies.length }, 'MoviesList')
            } else if (ENV.HAS_TMDB) {
                // Fetch now playing movies from TMDB by default
                const tmdbData = await moviesService.getNowPlayingFromTMDB(1)
                fetchedMovies = tmdbData.map(movie => ({
                    ...movie,
                    id: movie.tmdbId, // Use tmdbId as id for routing
                    _id: movie.tmdbId,
                }))
                logger.info('Now playing movies loaded from TMDB', { count: fetchedMovies.length }, 'MoviesList')
            } else {
                // Fallback to local movies if TMDB is not available
                const response = await moviesService.getAll()
                fetchedMovies = response.data
            }

            setMovies(fetchedMovies)
        } catch (err) {
            logError(err, 'MoviesList')
            setError(formatErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }

    let filteredMovies = []

    if (filterData) {
        filteredMovies = movies.filter(eachMovie => {
            const genderMatch = !filterData.gender || (eachMovie.gender && eachMovie.gender.includes(filterData.gender));
            const countryMatch = !filterData.country || eachMovie.country === filterData.country;
            const languageMatch = !filterData.language || eachMovie.language === filterData.language;
            return genderMatch && countryMatch && languageMatch;
        });
    }

    if (isLoading) {
        return (
            <div className="MoviesList">
                <SkeletonCardList count={8} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="MoviesList">
                <Alert variant="danger" className="m-5" title="Error al cargar películas">
                    <p>{error}</p>
                    <Button variant="outline" onClick={fetchMovies} className="mt-3">
                        Reintentar
                    </Button>
                </Alert>
            </div>
        )
    }

    const displayMovies = filterData ? filteredMovies : movies
    // For TMDB movies, we don't filter by isDeleted since they're not in our database
    const activeMovies = ENV.HAS_TMDB ? displayMovies : displayMovies.filter(movie => !movie.isDeleted)

    if (activeMovies.length === 0) {
        return (
            <div className="MoviesList">
                <Alert variant="info" className="m-5">
                    No se encontraron películas disponibles.
                </Alert>
            </div>
        )
    }

    return (
        <div className="MoviesList">
            <div className="movies-list-header p-5 pb-3">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="movies-list-title">
                        Películas ({activeMovies.length})
                    </h2>
                    <ViewToggle onViewChange={setViewMode} />
                </div>
            </div>
            {viewMode === 'grid' ? (
                <Row className="px-5 pb-5">
                    {activeMovies.map(movie => {
                        const uniqueKey = movie.id || movie._id || movie.tmdbId || `tmdb-${movie.tmdbId}`
                        return (
                            <Col className="mb-5" key={uniqueKey} md={{ span: 3 }}>
                                <MovieCard 
                                    {...movie} 
                                    movie={movie}
                                    id={movie.id || movie.tmdbId}
                                    tmdbId={movie.tmdbId}
                                />
                            </Col>
                        )
                    })}
                </Row>
            ) : (
                <div className="movies-list-view px-5 pb-5">
                    {activeMovies.map(movie => {
                        const uniqueKey = movie.id || movie._id || movie.tmdbId || `tmdb-${movie.tmdbId}`
                        return (
                            <MovieListItem 
                                key={uniqueKey} 
                                {...movie} 
                                movie={movie}
                                id={movie.id || movie.tmdbId}
                                tmdbId={movie.tmdbId}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}
export default MoviesList