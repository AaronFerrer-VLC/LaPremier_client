import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import tmdbService from '../../services/tmdb.service';
import { moviesService } from '../../services/movies.service';
import MovieCard from '../../components/MovieCard/MovieCard';
import { SkeletonCardList } from '../../components/SkeletonLoader/SkeletonLoader';
import { Button, Alert } from '../../components/UI';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import './GenresPage.css';

const GenresPage = () => {
  const { genreId } = useParams();
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [error, setError] = useState(null);

  // Load all genres
  useEffect(() => {
    const loadGenres = async () => {
      if (!ENV.HAS_TMDB) {
        setLoadingGenres(false);
        return;
      }

      try {
        setLoadingGenres(true);
        const genresList = await tmdbService.getGenres();
        setGenres(genresList);
        
        // If genreId is in URL, select it
        if (genreId) {
          const genre = genresList.find(g => g.id === parseInt(genreId));
          if (genre) {
            setSelectedGenre(genre);
          }
        }
      } catch (err) {
        logger.error('Failed to load genres', err, 'GenresPage');
        setError('No se pudieron cargar los géneros');
      } finally {
        setLoadingGenres(false);
      }
    };

    loadGenres();
  }, [genreId]);

  // Load movies for selected genre
  useEffect(() => {
    const loadMovies = async () => {
      if (!selectedGenre || !ENV.HAS_TMDB) {
        setLoadingMovies(false);
        return;
      }

      try {
        setLoadingMovies(true);
        setError(null);
        
        // Use Discover API to get movies by genre
        const discoveredMovies = await moviesService.discoverMoviesFromTMDB({
          with_genres: selectedGenre.id.toString(),
          sort_by: 'popularity.desc',
        }, 1);
        
        setMovies(discoveredMovies);
        logger.info('Movies loaded for genre', { genre: selectedGenre.name, count: discoveredMovies.length }, 'GenresPage');
      } catch (err) {
        logger.error('Failed to load movies for genre', err, 'GenresPage');
        setError('No se pudieron cargar las películas');
      } finally {
        setLoadingMovies(false);
      }
    };

    loadMovies();
  }, [selectedGenre]);

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    // Update URL without navigation
    window.history.pushState({}, '', `/generos/${genre.id}`);
  };

  if (!ENV.HAS_TMDB) {
    return (
      <Container className="GenresPage py-5">
        <Alert variant="warning">
          TMDB API no está configurada. Por favor, configura VITE_TMDB_API_KEY en tu archivo .env
        </Alert>
      </Container>
    );
  }

  return (
    <div className="GenresPage">
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h1 className="page-title">Géneros de Películas</h1>
            <p className="text-secondary">Explora películas por género</p>
          </Col>
          <Col xs="auto">
            <Button variant="secondary" as={Link} to="/">
              Volver a la Home
            </Button>
          </Col>
        </Row>

        {/* Genres Grid */}
        {loadingGenres ? (
          <SkeletonCardList count={6} />
        ) : (
          <Row className="g-3 mb-5">
            {genres.map(genre => (
              <Col key={genre.id} xs={6} sm={4} md={3} lg={2}>
                <div
                  className={`genre-card ${selectedGenre?.id === genre.id ? 'active' : ''}`}
                  onClick={() => handleGenreClick(genre)}
                >
                  <h3 className="genre-name">{genre.name}</h3>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {/* Movies for selected genre */}
        {selectedGenre && (
          <div className="genre-movies-section">
            <Row className="mb-4">
              <Col>
                <h2 className="section-title">
                  Películas de {selectedGenre.name}
                </h2>
              </Col>
            </Row>

            {loadingMovies ? (
              <SkeletonCardList count={8} />
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : movies.length === 0 ? (
              <Alert variant="info">
                No se encontraron películas para este género.
              </Alert>
            ) : (
              <Row className="g-4">
                {movies.map(movie => {
                  const uniqueKey = movie.id || movie._id || movie.tmdbId || `tmdb-${movie.tmdbId}`;
                  return (
                    <Col key={uniqueKey} xs={12} sm={6} md={4} lg={3}>
                      <MovieCard
                        movie={movie}
                        id={movie.id || movie.tmdbId}
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
            )}
          </div>
        )}

        {!selectedGenre && !loadingGenres && (
          <Alert variant="info">
            Selecciona un género para ver las películas disponibles.
          </Alert>
        )}
      </Container>
    </div>
  );
};

export default GenresPage;

