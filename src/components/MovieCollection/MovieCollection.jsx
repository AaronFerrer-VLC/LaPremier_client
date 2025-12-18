import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import tmdbService from '../../services/tmdb.service';
import { moviesService } from '../../services/movies.service';
import MovieCard from '../MovieCard/MovieCard';
import { SkeletonCardList } from '../SkeletonLoader/SkeletonLoader';
import { Alert } from '../UI';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import './MovieCollection.css';

const MovieCollection = ({ collectionId, collectionName }) => {
  const [collection, setCollection] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCollection = async () => {
      if (!collectionId || !ENV.HAS_TMDB) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get collection details
        const collectionData = await tmdbService.getCollection(collectionId);
        setCollection(collectionData);
        
        // Transform movies from collection
        const transformedMovies = (collectionData.parts || []).map(movie => {
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
        
        setMovies(transformedMovies);
        logger.info('Collection loaded', { collectionId, name: collectionData.name, count: transformedMovies.length }, 'MovieCollection');
      } catch (err) {
        logger.error('Failed to load collection', err, 'MovieCollection');
        setError('No se pudo cargar la colección');
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionId]);

  if (!collectionId || !ENV.HAS_TMDB) {
    return null;
  }

  if (loading) {
    return (
      <Container className="MovieCollection py-4">
        <SkeletonCardList count={4} />
      </Container>
    );
  }

  if (error || !collection || movies.length === 0) {
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

