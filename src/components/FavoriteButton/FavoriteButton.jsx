import { useState, useEffect, useContext } from 'react';
import { FaHeart, FaBookmark } from 'react-icons/fa';
import { favoritesService } from '../../services/favorites.service';
import { AuthContext } from '../../contexts/auth.context';
import { notifySuccess, notifyError } from '../../utils/notifications';
import logger from '../../utils/logger';
import './FavoriteButton.css';

const FavoriteButton = ({ movieId, tmdbId, type = 'favorite', size = 'md', showLabel = false }) => {
  const { loggedUser } = useContext(AuthContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use tmdbId if movieId is not available (for TMDB movies)
  const effectiveMovieId = movieId || tmdbId;

  // Obtener userId - usar loggedUser o un ID temporal del localStorage
  const getUserId = () => {
    if (loggedUser) {
      return loggedUser.username || loggedUser.id || 'guest';
    }
    // Si no hay usuario logueado, usar un ID de sesión del localStorage
    let sessionId = localStorage.getItem('lapremier_session_id');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}`;
      localStorage.setItem('lapremier_session_id', sessionId);
    }
    return sessionId;
  };

  // Verificar si está en favoritos al cargar
  useEffect(() => {
    const checkFavorite = async () => {
      if (!effectiveMovieId) return;
      
      try {
        const userId = getUserId();
        // Use tmdbId format for TMDB movies: "tmdb_123456"
        const favoriteId = tmdbId ? `tmdb_${tmdbId}` : effectiveMovieId;
        const response = await favoritesService.checkFavorite(userId, favoriteId, type);
        setIsFavorite(response.data.exists);
      } catch (error) {
        logger.error('Failed to check favorite status', error, 'FavoriteButton');
      }
    };

    checkFavorite();
  }, [effectiveMovieId, tmdbId, type]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!effectiveMovieId) return;

    const userId = getUserId();
    setIsLoading(true);

    try {
      // Use tmdbId format for TMDB movies: "tmdb_123456"
      const favoriteId = tmdbId ? `tmdb_${tmdbId}` : effectiveMovieId;
      
      if (isFavorite) {
        await favoritesService.removeFavorite(userId, favoriteId, type);
        setIsFavorite(false);
        notifySuccess(
          type === 'favorite' 
            ? 'Eliminado de favoritos' 
            : 'Eliminado de ver más tarde'
        );
      } else {
        await favoritesService.addFavorite(userId, favoriteId, type);
        setIsFavorite(true);
        notifySuccess(
          type === 'favorite' 
            ? 'Agregado a favoritos' 
            : 'Agregado a ver más tarde'
        );
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

