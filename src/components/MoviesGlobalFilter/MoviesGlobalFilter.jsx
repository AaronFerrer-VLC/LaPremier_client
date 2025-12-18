import { useEffect, useState, useCallback } from "react"
import { Form, ListGroup } from "react-bootstrap"
import { Link } from "react-router-dom"
import { moviesService } from "../../services/movies.service"
import { logError } from "../../utils/errorHandler"
import { debounce } from "../../utils/debounce"
import { ENV } from "../../config/env"
import logger from "../../utils/logger"
import "./MoviesGlobalFilter.css"

const MoviesGlobalFilter = ({ filterSelected, handleFilterSelected }) => {
    const [filterValue, setFilterValue] = useState('')
    const [filterResults, setFilterResults] = useState([])
    const [showFilterResults, setShowFilterResults] = useState(false)

    const searchMovies = useCallback(async (query) => {
        if (!query || query.trim().length < 2) {
            setFilterResults([])
            return
        }

        try {
            // Use TMDB search if available, otherwise fallback to local
            if (ENV.HAS_TMDB) {
                const searchResults = await moviesService.searchTMDB(query)
                const transformedResults = (searchResults.results || []).slice(0, 5).map(movie => ({
                    id: movie.id,
                    tmdbId: movie.id,
                    title: {
                        spanish: movie.title,
                        original: movie.original_title
                    },
                }))
                setFilterResults(transformedResults)
            } else {
                const response = await moviesService.searchByTitle(query)
                setFilterResults(response.data.filter(movie => !movie.isDeleted))
            }
        } catch (err) {
            logError(err, 'MoviesGlobalFilter')
            logger.error('Movie search failed in MoviesGlobalFilter', err, 'MoviesGlobalFilter')
            setFilterResults([])
        }
    }, [])

    const debouncedSearch = useCallback(
        debounce((query) => searchMovies(query), 300),
        [searchMovies]
    )

    useEffect(() => {
        if (filterValue && filterValue.trim().length >= 2) {
            debouncedSearch(filterValue)
            setShowFilterResults(true)
        } else {
            setFilterResults([])
            setShowFilterResults(false)
        }
    }, [filterValue, debouncedSearch])


    const handleFilterChange = (e) => {
        const { value } = e.target
        setFilterValue(value)
        setShowFilterResults(true)
    }

    const handleFocus = () => {
        handleFilterSelected("pelis")
        // Si hay texto, mostrar resultados
        if (filterValue && filterValue.trim().length >= 2) {
            setShowFilterResults(true)
        }
    }

    const handleBlur = () => {
        // Delay para permitir clicks en los items
        setTimeout(() => {
            setShowFilterResults(false)
            handleFilterSelected("")
        }, 200)
    }

    const handleItemClick = (movie) => {
        setFilterValue(movie.title?.spanish || movie.title || '')
        setShowFilterResults(false)
    }

    if (filterSelected === 'cines') {
        return (
            <Form.Control
                disabled
                type="text"
                placeholder="Buscar película"
            />
        )
    }

    return (
        <div className="MoviesGlobalFilter position-relative">
            <Form.Control
                type="text"
                placeholder="Buscar película"
                className="mr-sm-2"
                onChange={handleFilterChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={filterValue}
            />

            {showFilterResults && filterResults.length > 0 && (
                <ListGroup 
                    className="position-absolute w-100 mt-1 autocomplete-dropdown" 
                    style={{ 
                        zIndex: 1000, 
                        maxHeight: '300px', 
                        overflowY: 'auto'
                    }}
                >
                    {filterResults.map(movie => {
                        const movieId = movie.tmdbId || movie.id;
                        const uniqueKey = movieId || `movie-${movie.title?.spanish || movie.title || 'unknown'}`;
                        return (
                            <ListGroup.Item
                                key={uniqueKey}
                                as={Link}
                                to={`/peliculas/detalles/${movieId}`}
                                onClick={() => handleItemClick(movie)}
                                action
                                className="autocomplete-item"
                                style={{
                                    cursor: 'pointer',
                                    border: 'none',
                                    borderBottom: '1px solid var(--border-color-light)',
                                    padding: '0.75rem 1rem'
                                }}
                            >
                                {movie.title?.spanish || movie.title || 'Sin título'}
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            )}
        </div>
    )

}

export default MoviesGlobalFilter