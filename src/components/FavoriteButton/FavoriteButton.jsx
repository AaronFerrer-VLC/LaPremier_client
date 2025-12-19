import { useState, useEffect, useContext, useMemo } from 'react';
import { FaHeart, FaBookmark } from 'react-icons/fa';
import { favoritesService } from '../../services/favorites.service';
import { AuthContext } from '../../contexts/auth.context';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { safeGetItem, safeSetItem } from '../../utils/storage';
import logger from '../../utils/logger';
import './FavoriteButton.css';

const FavoriteButton = ({ movieId, tmdbId, type = 'favorite', size = 'md', showLabel = false }) => {
  const { loggedUser } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine effective movie ID - prioritize tmdbId for TMDB movies
  const effectiveMovieId = useMemo(() => {
    // If tmdbId is provided, use it (for TMDB movies)
    if (tmdbId) {
      return tmdbId;
    }
    // Otherwise use movieId
    return movieId;
  }, [movieId, tmdbId]);

  // Obtener userId - usar loggedUser o un ID temporal del localStorage
  const getUserId = () => {
    if (loggedUser) {
      return loggedUser.username || loggedUser.id || 'guest';
    }
    // Si no hay usuario logueado, usar un ID de sesión del localStorage
    let sessionId = safeGetItem('session_id');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}`;
      safeSetItem('session_id', sessionId);
    }
    return sessionId;
  };

  // Get favorite ID in the correct format
  const getFavoriteId = () => {
    // If tmdbId is provided, use TMDB format: "tmdb_123456"
    if (tmdbId) {
      return `tmdb_${tmdbId}`;
    }
    // Otherwise use movieId as-is
    return effectiveMovieId;
  };

  // Verificar si está en favoritos al cargar
  useEffect(() => {
    const checkFavorite = async () => {
      if (!effectiveMovieId) {
        logger.warn('FavoriteButton: No effective movie ID', { movieId, tmdbId, effectiveMovieId }, 'FavoriteButton');
        return;
      }
      
      try {
        const userId = getUserId();
        const favoriteId = getFavoriteId();
        logger.info('FavoriteButton: Checking favorite status', { userId, favoriteId, movieId, tmdbId, effectiveMovieId }, 'FavoriteButton');
        const response = await favoritesService.checkFavorite(userId, favoriteId, type);
        setIsFavorite(response.data?.exists || false);
        logger.info('FavoriteButton: Favorite status checked', { exists: response.data?.exists }, 'FavoriteButton');
      } catch (error) {
        logger.error('Failed to check favorite status', error, 'FavoriteButton');
        // Don't set isFavorite to false on error, keep current state
      }
    };

    checkFavorite();
  }, [effectiveMovieId, tmdbId, type, movieId]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!effectiveMovieId) {
      logger.warn('FavoriteButton: Cannot toggle favorite, no effective movie ID', { movieId, tmdbId, effectiveMovieId }, 'FavoriteButton');
      notifyError('No se pudo identificar la película');
      return;
    }

    const userId = getUserId();
    const favoriteId = getFavoriteId();
    
    logger.info('FavoriteButton: Toggling favorite', { userId, favoriteId, movieId, tmdbId, effectiveMovieId, isFavorite }, 'FavoriteButton');
    setIsLoading(true);

    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(userId, favoriteId, type);
        setIsFavorite(false);
        notifySuccess(
          type === 'favorite' 
            ? 'Eliminado de favoritos' 
            : 'Eliminado de ver más tarde'
        );
        logger.info('FavoriteButton: Removed from favorites', { userId, favoriteId }, 'FavoriteButton');
      } else {
        await favoritesService.addFavorite(userId, favoriteId, type);
        setIsFavorite(true);
        notifySuccess(
          type === 'favorite' 
            ? 'Agregado a favoritos' 
            : 'Agregado a ver más tarde'
        );
        logger.info('FavoriteButton: Added to favorites', { userId, favoriteId }, 'FavoriteButton');
      }
    } catch (error) {
      logger.error('Failed to toggle favorite', error, 'FavoriteButton');
      notifyError('Error al actualizar favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  if (!effectiveMovieId) return null;

  const Icon = type === 'favorite' ? FaHeart : FaBookmark;
  const label = type === 'favorite' ? 'Favorito' : 'Ver más tarde';

  return (
    <button
      className={`favorite-button favorite-button--${size} ${isFavorite ? 'favorite-button--active' : ''}`}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFavorite ? `Quitar de ${label}` : `Agregar a ${label}`}
      title={isFavorite ? `Quitar de ${label}` : `Agregar a ${label}`}
    >
      <Icon className="favorite-button__icon" />
      {showLabel && <span className="favorite-button__label">{label}</span>}
    </button>
  );
};

export default FavoriteButton;

