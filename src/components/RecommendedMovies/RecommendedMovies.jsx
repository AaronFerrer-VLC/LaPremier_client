import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MovieCard from '../MovieCard/MovieCard';
import { moviesService } from '../../services/movies.service';
import { SkeletonCardList } from '../SkeletonLoader/SkeletonLoader';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import { Alert } from '../UI';
import './RecommendedMovies.css';

const RecommendedMovies = ({ currentMovie, limit = 4 }) => {
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendedMovies = async () => {
      if (!currentMovie) {
        setLoading(false);
        return;
      }

      // Get TMDB ID from current movie
      const tmdbId = currentMovie.tmdbId || (currentMovie.id && /^\d+$/.test(currentMovie.id.toString()) ? Number(currentMovie.id) : null);

      if (!tmdbId || !ENV.HAS_TMDB) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch recommended movies from TMDB
        const movies = await moviesService.getRecommendationsFromTMDB(tmdbId, 1);
        
        // Transform to include id for routing
        const transformedMovies = movies.slice(0, limit).map(movie => ({
          ...movie,
          id: movie.tmdbId,
          _id: movie.tmdbId,
        }));
        
        setRecommendedMovies(transformedMovies);
        logger.info('Recommended movies loaded from TMDB', { tmdbId, count: transformedMovies.length }, 'RecommendedMovies');
      } catch (err) {
        logger.error('Failed to fetch recommended movies', err, 'RecommendedMovies');
        setError('No se pudieron cargar recomendaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedMovies();
  }, [currentMovie, limit]);

  if (loading) {
    return (
      <Container className="RecommendedMovies py-4">
        <SkeletonCardList count={limit} />
      </Container>
    );
  }

  if (error || recommendedMovies.length === 0) {
    return null;
  }

  return (
    <Container className="RecommendedMovies py-4">
      <h3 className="recommended-movies-title">Recomendaciones para ti</h3>
      <Row>
        {recommendedMovies.map(movie => {
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

export default RecommendedMovies;

