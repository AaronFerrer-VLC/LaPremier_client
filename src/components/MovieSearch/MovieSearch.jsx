import { useState, useEffect, useCallback } from 'react';
import { Form, InputGroup, ListGroup, Spinner } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { moviesService } from '../../services/movies.service';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import { Card } from '../UI';
import LazyImage from '../LazyImage/LazyImage';
import { Link } from 'react-router-dom';
import './MovieSearch.css';

const MovieSearch = ({ onMovieSelect, onSearch, placeholder = "Buscar películas..." }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    // Debounced search
    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        if (!query.trim() || query.length < 2) {
            setResults([]);
            setShowResults(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                // Always use TMDB if available
                if (!ENV.HAS_TMDB) {
                    setResults([]);
                    setShowResults(false);
                    setIsSearching(false);
                    return;
                }

                const searchResults = await moviesService.searchTMDB(query);
                const transformedResults = (searchResults.results || []).slice(0, 8).map(movie => ({
                    ...movie,
                    id: movie.id, // TMDB ID
                    tmdbId: movie.id,
                    title: {
                        spanish: movie.title,
                        original: movie.original_title
                    },
                    poster: movie.poster_path 
                        ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` 
                        : null,
                    releaseDate: movie.release_date,
                    rating: movie.vote_average,
                }));
                setResults(transformedResults);
                setShowResults(true);
                
                // Call onSearch callback if provided (for updating parent component)
                if (onSearch) {
                    onSearch(query);
                }
            } catch (error) {
                logger.error('Movie search failed', error, 'MovieSearch');
                setResults([]);
                if (onSearch) {
                    onSearch('');
                }
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce

        setDebounceTimer(timer);

        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [query]);

    const handleSelect = (movie) => {
        if (onMovieSelect) {
            onMovieSelect(movie);
        }
        setQuery('');
        setShowResults(false);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
        if (onSearch) {
            onSearch('');
        }
    };

    return (
        <div className="MovieSearch position-relative">
            <InputGroup>
                <InputGroup.Text className="search-icon">
                    <FaSearch />
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        const newQuery = e.target.value;
                        setQuery(newQuery);
                        if (!newQuery.trim() && onSearch) {
                            onSearch('');
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && query.trim().length >= 2 && onSearch) {
                            onSearch(query);
                            setShowResults(false);
                        }
                    }}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                    onBlur={() => {
                        // Delay hiding results to allow clicks on results
                        setTimeout(() => setShowResults(false), 200);
                    }}
                    className="search-input"
                />
                {query && (
                    <InputGroup.Text 
                        className="clear-icon" 
                        onClick={handleClear}
                        style={{ cursor: 'pointer' }}
                    >
                        <FaTimes />
                    </InputGroup.Text>
                )}
            </InputGroup>

            {showResults && (
                <div className="search-results">
                    {isSearching ? (
                        <div className="search-loading">
                            <Spinner animation="border" size="sm" variant="primary" />
                            <span className="ms-2">Buscando...</span>
                        </div>
                    ) : results.length > 0 ? (
                        <ListGroup variant="flush">
                            {results.map((movie) => {
                                const movieTitle = movie.title?.spanish || movie.title || 'Sin título';
                                const movieId = movie.tmdbId || movie.id;
                                return (
                                    <ListGroup.Item
                                        key={movieId}
                                        className="search-result-item"
                                        onClick={() => handleSelect(movie)}
                                    >
                                        <Link 
                                            to={`/peliculas/detalles/${movieId}`}
                                            className="d-flex align-items-center text-decoration-none text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(movie);
                                            }}
                                        >
                                            {movie.poster && (
                                                <LazyImage
                                                    src={movie.poster}
                                                    alt={movieTitle}
                                                    className="search-result-poster"
                                                    style={{ width: '50px', height: '75px', objectFit: 'cover', marginRight: '1rem' }}
                                                />
                                            )}
                                            <div className="flex-grow-1">
                                                <div className="fw-bold">{movieTitle}</div>
                                                {movie.releaseDate && (
                                                    <small className="text-secondary">
                                                        {new Date(movie.releaseDate).getFullYear()}
                                                    </small>
                                                )}
                                                {movie.rating > 0 && (
                                                    <div className="mt-1">
                                                        <small className="text-warning">⭐ {movie.rating.toFixed(1)}</small>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                    ) : query.length >= 2 ? (
                        <div className="search-no-results">
                            <p className="text-secondary mb-0">No se encontraron películas</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default MovieSearch;

