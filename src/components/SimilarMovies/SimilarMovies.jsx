import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MovieCard from '../MovieCard/MovieCard';
import { moviesService } from '../../services/movies.service';
import { SkeletonCardList } from '../SkeletonLoader/SkeletonLoader';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import { Alert } from '../UI';
import './SimilarMovies.css';

const SimilarMovies = ({ currentMovie, limit = 4 }) => {
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      if (!currentMovie) {
        setLoading(false);
        return;
      }

      // Get TMDB ID from current movie
      const tmdbId = currentMovie.tmdbId || (currentMovie.id && /^\d+$/.test(currentMovie.id.toString()) ? Number(currentMovie.id) : null);

      if (!tmdbId || !ENV.HAS_TMDB) {
        // If no TMDB ID or TMDB not available, don't show similar movies
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch similar movies from TMDB
        const movies = await moviesService.getSimilarMoviesFromTMDB(tmdbId, 1);
        
        // Transform to include id for routing
        const transformedMovies = movies.slice(0, limit).map(movie => ({
          ...movie,
          id: movie.tmdbId,
          _id: movie.tmdbId,
        }));
        
        setSimilarMovies(transformedMovies);
        logger.info('Similar movies loaded from TMDB', { tmdbId, count: transformedMovies.length }, 'SimilarMovies');
      } catch (err) {
        logger.error('Failed to fetch similar movies', err, 'SimilarMovies');
        setError('No se pudieron cargar películas similares');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarMovies();
  }, [currentMovie, limit]);

  if (loading) {
    return (
      <Container className="SimilarMovies py-4">
        <SkeletonCardList count={limit} />
      </Container>
    );
  }

  if (error || similarMovies.length === 0) {
    return null;
  }

  return (
    <Container className="SimilarMovies py-4">
      <h3 className="similar-movies-title">Películas Similares</h3>
      <Row>
        {similarMovies.map(movie => {
          const uniqueKey = movie.id || movie._id || movie.tmdbId || `tmdb-${movie.tmdbId}`;
          return (
            <Col key={uniqueKey} md={3} className="mb-4">
              <MovieCard 
                {...movie} 
                movie={movie}
                id={movie.id || movie.tmdbId}
                tmdbId={movie.tmdbId}
              />
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default SimilarMovies;

