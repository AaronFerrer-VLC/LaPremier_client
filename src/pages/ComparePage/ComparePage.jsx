import { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes, FaSearch, FaTrash } from 'react-icons/fa';
import { moviesService } from '../../services/movies.service';
import { useApi } from '../../hooks/useApi';
import { Card, Button, Badge, Alert } from '../../components/UI';
import { SkeletonDetails } from '../../components/SkeletonLoader/SkeletonLoader';
import FlagIcon from '../../components/FlagIcon/FlagIcon';
import LazyImage from '../../components/LazyImage/LazyImage';
import { notifyError } from '../../utils/notifications';
import logger from '../../utils/logger';
import { ENV } from '../../config/env';
import { getCountryCode } from '../../utils/countryCodes';
import './ComparePage.css';

const MAX_COMPARISONS = 3;

const ComparePage = () => {
  const navigate = useNavigate();
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Cargar todas las películas
  const { data: allMovies, loading } = useApi(
    () => moviesService.getAll(),
    []
  );

  // Filtrar películas para búsqueda (local y TMDB)
  useEffect(() => {
    const searchMovies = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }

      const query = searchQuery.toLowerCase();
      const results = [];

      // Buscar en películas locales
      if (allMovies) {
        const localFiltered = allMovies
          .filter(movie => {
            if (movie.isDeleted) return false;
            // Verificar que no esté ya seleccionada
            if (selectedMovies.some(sm => (sm.id || sm._id) === (movie.id || movie._id))) {
              return false;
            }
            const title = movie.title?.spanish || movie.title?.original || movie.title || '';
            return title.toLowerCase().includes(query);
          })
          .slice(0, 5);
        results.push(...localFiltered);
      }

      // Si hay menos de 5 resultados y TMDB está disponible, buscar en TMDB
      if (results.length < 5 && ENV.HAS_TMDB && query.length >= 2) {
        try {
          const tmdbResults = await moviesService.searchTMDB(query, 1);
          const tmdbMovies = (tmdbResults.results || [])
            .slice(0, 5 - results.length)
            .map(tmdbMovie => {
              // Transformar a formato de nuestra app
              const transformed = {
                tmdbId: tmdbMovie.id,
                title: {
                  spanish: tmdbMovie.title || tmdbMovie.original_title,
                  original: tmdbMovie.original_title || tmdbMovie.title
                },
                poster: tmdbMovie.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` 
                  : '',
                country: tmdbMovie.original_language || 'en',
                duration: 0,
                language: tmdbMovie.original_language || 'en',
                date: tmdbMovie.release_date || '',
                calification: tmdbMovie.release_date?.split('-')[0] || '',
                rating: tmdbMovie.vote_average || 0,
              };
              return transformed;
            })
            .filter(tmdbMovie => {
              // Verificar que no esté ya seleccionada
              return !selectedMovies.some(sm => 
                (sm.tmdbId === tmdbMovie.tmdbId) || 
                (sm.id === tmdbMovie.tmdbId) ||
                (sm._id === tmdbMovie.tmdbId)
              );
            });
          results.push(...tmdbMovies);
        } catch (error) {
          logger.error('Failed to search TMDB movies', error, 'ComparePage');
        }
      }

      setSearchResults(results.slice(0, 5));
    };

    searchMovies();
  }, [searchQuery, allMovies, selectedMovies]);

  const handleAddMovie = (movie) => {
    if (selectedMovies.length >= MAX_COMPARISONS) {
      notifyError(`Solo puedes comparar hasta ${MAX_COMPARISONS} películas`);
      return;
    }
    setSelectedMovies([...selectedMovies, movie]);
    setSearchQuery('');
    setShowSearch(false);
  };

  const handleRemoveMovie = (index) => {
    setSelectedMovies(selectedMovies.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todas las comparaciones?')) {
      setSelectedMovies([]);
    }
  };

  const getYear = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).getFullYear();
    } catch {
      return 'N/A';
    }
  };


  return (
    <Container className="ComparePage py-5">
      <div className="compare-header mb-4">
        <h1 className="page-title">Comparar Películas</h1>
        <p className="page-subtitle">Compara hasta {MAX_COMPARISONS} películas lado a lado</p>
      </div>

      {/* Selector de películas */}
      <div className="movie-selector mb-4">
        <Row>
          {Array.from({ length: MAX_COMPARISONS }).map((_, index) => {
            const movie = selectedMovies[index];
            return (
              <Col key={index} md={4} className="mb-3">
                <Card className="selector-card h-100">
                  <Card.Body className="text-center">
                    {movie ? (
                      <>
                        <div className="selected-movie">
                          <div className="movie-poster-small mb-3">
                            <LazyImage
                              src={movie.poster}
                              alt={movie.title?.spanish || movie.title}
                              className="w-100"
                              style={{ borderRadius: '8px', maxHeight: '200px', objectFit: 'cover' }}
                            />
                          </div>
                          <h5 className="movie-title-small">
                            {movie.title?.spanish || movie.title?.original || movie.title}
                          </h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMovie(index)}
                            className="mt-2"
                          >
                            <FaTimes className="me-2" />
                            Eliminar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="empty-slot">
                        <Button
                          variant="outline"
                          onClick={() => setShowSearch(true)}
                          className="w-100"
                        >
                          <FaSearch className="me-2" />
                          Agregar Película
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {selectedMovies.length > 0 && (
          <div className="text-center mt-3">
            <Button variant="outline" onClick={handleClearAll}>
              <FaTrash className="me-2" />
              Limpiar Todas
            </Button>
          </div>
        )}
      </div>

      {/* Búsqueda de películas */}
      {showSearch && (
        <div className="movie-search mb-4">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Buscar Película</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowSearch(false)}>
                  <FaTimes />
                </Button>
              </div>
              <Form.Control
                type="text"
                placeholder="Escribe el nombre de la película..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-3"
              />
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(movie => {
                    const uniqueKey = movie.tmdbId || movie.id || movie._id || `movie-${movie.title?.spanish || movie.title}`;
                    return (
                      <div
                        key={uniqueKey}
                        className="search-result-item"
                        onClick={() => handleAddMovie(movie)}
                      >
                      <img
                        src={movie.poster}
                        alt={movie.title?.spanish}
                        className="result-poster"
                      />
                      <div className="result-info">
                        <h6>{movie.title?.spanish || movie.title?.original || movie.title}</h6>
                        <small className="text-muted">{getYear(movie.date)}</small>
                        {movie.tmdbId && (
                          <Badge variant="medium" className="ms-2">TMDB</Badge>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <Alert variant="info" className="mb-0">
                  No se encontraron películas con ese nombre
                </Alert>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Comparación */}
      {selectedMovies.length > 0 && (
        <div className="comparison-section">
          <h2 className="comparison-title mb-4">Comparación</h2>
          
          {loading ? (
            <SkeletonDetails />
          ) : (
            <div className="comparison-table">
              <table className="w-100">
                <thead>
                  <tr>
                    <th></th>
                    {selectedMovies.map((movie, index) => (
                      <th key={index} className="comparison-header">
                        <div className="comparison-poster">
                          <LazyImage
                            src={movie.poster}
                            alt={movie.title?.spanish}
                            className="w-100"
                          />
                        </div>
                        <h4 className="mt-3">{movie.title?.spanish || movie.title?.original}</h4>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Año</strong></td>
                    {selectedMovies.map((movie, index) => (
                      <td key={index}>{getYear(movie.date)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Duración</strong></td>
                    {selectedMovies.map((movie, index) => (
                      <td key={index}>{movie.duration ? `${movie.duration} min` : 'N/A'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>País</strong></td>
                    {selectedMovies.map((movie, index) => (
                      <td key={index}>
                        {movie.country && (
                          <>
                            <FlagIcon countryCode={getCountryCode(movie.country)} size="small" />
                            <span className="ms-2">{movie.country}</span>
                          </>
                        )}
                        {!movie.country && 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Idioma</strong></td>
                    {selectedMovies.map((movie, index) => (
                      <td key={index}>
                        <Badge variant="medium">{movie.language || 'N/A'}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Calificación</strong></td>
                    {selectedMovies.map((movie, index) => (
                      <td key={index}>
                        <Badge variant="accent">{movie.calification || 'N/A'}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Géneros</strong></td>
                    {selectedMovies.map((movie, index) => (
                      <td key={index}>
                        <div className="genres-list">
                          {movie.gender && movie.gender.length > 0 ? (
                            movie.gender.map((genre, gIndex) => (
                              <Badge key={gIndex} variant="light" className="me-1 mb-1">
                                {genre}
                              </Badge>
                            ))
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Director</strong></td>
                    {selectedMovies.map((movie, index) => (
                      <td key={index}>{movie.director || 'N/A'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Acciones</strong></td>
                    {selectedMovies.map((movie, index) => {
                      // Use tmdbId if available, otherwise use id or _id
                      const movieId = movie.tmdbId || movie.id || movie._id;
                      return (
                        <td key={index}>
                          <Button
                            variant="primary"
                            size="sm"
                            as={Link}
                            to={`/peliculas/detalles/${movieId}`}
                          >
                            Ver Detalles
                          </Button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedMovies.length === 0 && !showSearch && (
        <Alert variant="info" className="text-center">
          <h4>Comienza a comparar</h4>
          <p>Agrega hasta {MAX_COMPARISONS} películas para compararlas lado a lado</p>
          <Button variant="primary" onClick={() => setShowSearch(true)}>
            Agregar Primera Película
          </Button>
        </Alert>
      )}
    </Container>
  );
};

export default ComparePage;

