import { useState, useEffect, useCallback } from 'react';
import { Row, Col } from 'react-bootstrap';
import { moviesService } from '../../services/movies.service';
import { debounce } from '../../utils/debounce';
import { Button, Input, Card, Spinner, Alert } from '../UI';
import { notifySuccess, notifyError } from '../../utils/notifications';
import logger from '../../utils/logger';
import './TMDBMovieSearch.css';

/**
 * Component for searching and syncing movies from TMDB
 */
const TMDBMovieSearch = ({ onMovieSelected, onMovieSynced }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 2) {
        setSearchResults({ results: [], total_results: 0 });
        setSearching(false);
        return;
      }

      setSearching(true);
      setSearchError(null);
      
      try {
        const results = await moviesService.searchTMDB(query);
        setSearchResults(results);
        logger.info('TMDB search successful', { query, count: results.results?.length }, 'TMDBMovieSearch');
      } catch (error) {
        logger.error('TMDB search failed', error, 'TMDBMovieSearch');
        const errorMessage = error?.message || error?.toString() || 'Error desconocido al buscar en TMDB';
        setSearchError(errorMessage);
        setSearchResults({ results: [], total_results: 0 });
      } finally {
        setSearching(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedMovie(null);
  };

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    if (onMovieSelected) {
      onMovieSelected(movie);
    }
  };

  const handleSyncMovie = async () => {
    if (!selectedMovie) return;

    setIsSyncing(true);
    try {
      const syncedMovie = await moviesService.syncFromTMDB(selectedMovie.id);
      notifySuccess('Película sincronizada correctamente desde TMDB');
      logger.info('Movie synced from TMDB', { tmdbId: selectedMovie.id }, 'TMDBMovieSearch');
      
      if (onMovieSynced) {
        onMovieSynced(syncedMovie);
      }
      
      // Reset
      setSearchQuery('');
      setSelectedMovie(null);
    } catch (error) {
      logger.error('Failed to sync movie from TMDB', error, 'TMDBMovieSearch');
      notifyError('Error al sincronizar la película desde TMDB');
    } finally {
      setIsSyncing(false);
    }
  };

  const getPosterUrl = (posterPath) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w200${posterPath}`;
  };

  return (
    <div className="TMDBMovieSearch">
      <Row>
        <Col>
          <h4 className="mb-3 text-primary">Buscar Película en TMDB</h4>
          
          <Input
            type="text"
            placeholder="Buscar película (mínimo 2 caracteres)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="mb-3"
            aria-label="Buscar película en TMDB"
          />

          {searching && (
            <div className="d-flex justify-content-center my-3">
              <Spinner variant="primary" />
            </div>
          )}

          {searchError && (
            <Alert variant="danger" className="my-3">
              Error al buscar en TMDB: {searchError.message || 'Error desconocido'}
            </Alert>
          )}

          {searchResults?.results && searchResults.results.length > 0 && (
            <div className="tmdb-results">
              <p className="text-secondary mb-3">
                {searchResults.total_results} resultados encontrados
              </p>
              
              <Row className="g-3">
                {searchResults.results.slice(0, 6).map((movie) => (
                  <Col key={movie.id} xs={12} sm={6} md={4}>
                    <Card
                      className={`tmdb-movie-card ${selectedMovie?.id === movie.id ? 'selected' : ''}`}
                      onClick={() => handleSelectMovie(movie)}
                      style={{ cursor: 'pointer' }}
                      aria-label={`Seleccionar película: ${movie.title}`}
                    >
                      {movie.poster_path && (
                        <Card.Img
                          variant="top"
                          src={getPosterUrl(movie.poster_path)}
                          alt={movie.title}
                          style={{ height: '300px', objectFit: 'cover' }}
                        />
                      )}
                      <Card.Body className="bg-secondary">
                        <Card.Title className="text-truncate text-primary" title={movie.title}>
                          {movie.title}
                        </Card.Title>
                        {movie.release_date && (
                          <Card.Text className="text-secondary small">
                            {new Date(movie.release_date).getFullYear()}
                          </Card.Text>
                        )}
                        {movie.vote_average > 0 && (
                          <Card.Text className="small text-primary">
                            ⭐ {movie.vote_average.toFixed(1)} / 10
                          </Card.Text>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {selectedMovie && (
            <div className="selected-movie-info mt-4 p-3 bg-secondary rounded">
              <h5 className="text-primary">Película Seleccionada:</h5>
              <p className="mb-2 text-primary">
                <strong>{selectedMovie.title}</strong>
                {selectedMovie.release_date && (
                  <span className="text-secondary ms-2">
                    ({new Date(selectedMovie.release_date).getFullYear()})
                  </span>
                )}
              </p>
              {selectedMovie.overview && (
                <p className="small text-primary">{selectedMovie.overview}</p>
              )}
              
              <Button
                variant="primary"
                onClick={handleSyncMovie}
                disabled={isSyncing}
                className="mt-2"
                aria-label="Sincronizar película desde TMDB"
              >
                {isSyncing ? (
                  <>
                    <Spinner size="sm" variant="white" className="me-2" />
                    Sincronizando...
                  </>
                ) : (
                  'Sincronizar a Base de Datos Local'
                )}
              </Button>
            </div>
          )}

          {searchQuery && searchQuery.length >= 2 && !searching && searchResults?.results?.length === 0 && (
            <Alert variant="info" className="my-3">
              No se encontraron películas para "{searchQuery}"
            </Alert>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TMDBMovieSearch;

