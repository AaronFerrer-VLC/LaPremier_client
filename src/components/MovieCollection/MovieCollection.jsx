import { useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MovieCard from '../MovieCard/MovieCard';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import './MovieCollection.css';

/**
 * MovieCollection Component
 * Displays movies from a collection/saga
 * Note: Collection endpoint is not available through proxy backend.
 * The belongs_to_collection field in movie details only contains basic info (id, name),
 * not the full collection with all movies. This component will only render if
 * collectionData with parts is provided, otherwise it returns null silently.
 */
const MovieCollection = ({ collectionId, collectionName, collectionData }) => {
  // Transform movies from collection data if provided
  const movies = useMemo(() => {
    if (!collectionData?.parts || !Array.isArray(collectionData.parts)) {
      return [];
    }

    return collectionData.parts.map(movie => {
      try {
        return {
          tmdbId: movie.id,
          id: movie.id,
          _id: movie.id,
          title: {
            original: movie.original_title || '',
            spanish: movie.title || movie.original_title || ''
          },
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
          country: movie.original_language || 'Desconocido',
          language: movie.original_language || 'en',
          date: movie.release_date || '',
          calification: movie.release_date ? movie.release_date.split('-')[0] : '',
          description: movie.overview || '',
          rating: movie.vote_average || 0,
        };
      } catch (err) {
        logger.warn('Failed to transform collection movie', { movieId: movie.id, error: err }, 'MovieCollection');
        return null;
      }
    }).filter(Boolean);
  }, [collectionData]);

  // Use collection data if provided
  const collection = collectionData || null;

  // Don't render if no collection data with movies or if TMDB is disabled
  // Note: belongs_to_collection from TMDB only has id/name, not the full collection with parts
  // So this component will only render if collectionData with parts is explicitly provided
  if (!ENV.HAS_TMDB || !collection || !collection.parts || movies.length === 0) {
    return null;
  }

  return (
    <Container className="MovieCollection py-4">
      <Row className="mb-4">
        <Col>
          <h3 className="collection-title">
            {collection.name || collectionName || 'Colección'}
          </h3>
          {collection.overview && (
            <p className="collection-overview text-secondary">{collection.overview}</p>
          )}
        </Col>
      </Row>
      <Row className="g-4">
        {movies.map(movie => {
          const uniqueKey = movie.id || movie._id || movie.tmdbId || `tmdb-${movie.tmdbId}`;
          return (
            <Col key={uniqueKey} md={3} className="mb-4">
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
    </Container>
  );
};

export default MovieCollection;

