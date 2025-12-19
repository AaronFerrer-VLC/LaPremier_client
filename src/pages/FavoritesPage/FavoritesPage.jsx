import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useApi } from '../../hooks/useApi';
import { favoritesService } from '../../services/favorites.service';
import { moviesService } from '../../services/movies.service';
import { AuthContext } from '../../contexts/auth.context';
import MovieCard from '../../components/MovieCard/MovieCard';
import { SkeletonCardList } from '../../components/SkeletonLoader/SkeletonLoader';
import { Alert, Button } from '../../components/UI';
import { FaHeart, FaBookmark, FaTrash } from 'react-icons/fa';
import { notifySuccess, notifyError } from '../../utils/notifications';
import { safeGetItem, safeSetItem } from '../../utils/storage';
import logger from '../../utils/logger';
import { ENV } from '../../config/env';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const { loggedUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener userId
  const getUserId = () => {
    if (loggedUser) {
      return loggedUser.username || loggedUser.id || 'guest';
    }
    let sessionId = safeGetItem('session_id');
    if (!sessionId) {
      sessionId = `guest_${Date.now()}`;
      safeSetItem('session_id', sessionId);
    }
    return sessionId;
  };

  // Cargar favoritos
  const { data: favoritesData, loading: loadingFavorites, refetch: refetchFavorites } = useApi(
    () => {
      const userId = getUserId();
      return favoritesService.getUserFavorites(userId, 'favorite');
    },
    [activeTab]
  );

  // Cargar watchlist
  const { data: watchlistData, loading: loadingWatchlist, refetch: refetchWatchlist } = useApi(
    () => {
      const userId = getUserId();
      return favoritesService.getUserFavorites(userId, 'watchlist');
    },
    [activeTab]
  );

  // Cargar detalles de películas
  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const response = await moviesService.getAll();
        // apiClient.get() returns axios response: { data: [...], status: 200, ... }
        // Extract the data array from the response
        const allMovies = response?.data || (Array.isArray(response) ? response : []);
        
        if (!Array.isArray(allMovies)) {
          logger.error('allMovies is not an array', { allMovies, response, responseType: typeof response }, 'FavoritesPage');
          setFavorites([]);
          setWatchlist([]);
          setLoading(false);
          return;
        }
        
        // Create map of local movies by ID
        const moviesMap = new Map();
        allMovies.forEach(m => {
          if (m.id) moviesMap.set(m.id.toString(), m);
          if (m._id) moviesMap.set(m._id.toString(), m);
          if (m.tmdbId) moviesMap.set(m.tmdbId.toString(), m);
        });

        // Helper function to load a movie (local or TMDB)
        const loadMovie = async (fav) => {
          const movieId = fav.movieId?.toString() || fav.movieId;
          const tmdbId = fav.tmdbId || (fav.movieId && /^\d+$/.test(fav.movieId.toString()) ? Number(fav.movieId) : null);
          
          // Try to find in local database first
          let movie = moviesMap.get(movieId);
          
          // If not found and it's a numeric ID (TMDB), try to fetch from TMDB
          if (!movie && tmdbId && ENV.HAS_TMDB) {
            try {
              movie = await moviesService.getFromTMDB(tmdbId);
              // Ensure TMDB movies have an id for routing and keys
              if (movie && !movie.id && movie.tmdbId) {
                movie.id = movie.tmdbId.toString();
              }
              logger.info('Loaded TMDB movie for favorite', { tmdbId, movieId, hasId: !!movie?.id }, 'FavoritesPage');
            } catch (tmdbError) {
              logger.warn('Failed to load TMDB movie for favorite', { tmdbId, error: tmdbError }, 'FavoritesPage');
              return null; // Skip this favorite if we can't load it
            }
          }
          
          // Only return if it's a valid movie object (not string, number, or array)
          if (movie && typeof movie === 'object' && !Array.isArray(movie)) {
            // Ensure movie has an id for keys
            if (!movie.id && !movie._id) {
              if (movie.tmdbId) {
                movie.id = movie.tmdbId.toString();
              } else {
                logger.warn('Movie object missing id', { movie }, 'FavoritesPage');
                return null;
              }
            }
            return movie;
          }
          
          return null;
        };

        // Load favorites
        if (favoritesData && Array.isArray(favoritesData)) {
          const favoritesPromises = favoritesData.map(loadMovie);
          const favoritesResults = await Promise.all(favoritesPromises);
          const validFavorites = favoritesResults.filter(movie => movie !== null && typeof movie === 'object');
          setFavorites(validFavorites);
        } else {
          setFavorites([]);
        }

        // Load watchlist
        if (watchlistData && Array.isArray(watchlistData)) {
          const watchlistPromises = watchlistData.map(loadMovie);
          const watchlistResults = await Promise.all(watchlistPromises);
          const validWatchlist = watchlistResults.filter(movie => movie !== null && typeof movie === 'object');
          setWatchlist(validWatchlist);
        } else {
          setWatchlist([]);
        }
      } catch (error) {
        logger.error('Failed to load favorite movies', error, 'FavoritesPage');
        notifyError('Error al cargar las películas');
        setFavorites([]);
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    };

    if (favoritesData || watchlistData) {
      loadMovies();
    }
  }, [favoritesData, watchlistData]);

  const handleRemoveAll = async (type) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar todas las películas de ${type === 'favorite' ? 'favoritos' : 'ver más tarde'}?`)) {
      return;
    }

    try {
      const userId = getUserId();
      const items = type === 'favorite' ? favorites : watchlist;
      
      await Promise.all(
        items.map(item => {
          const movieId = item.id || item._id || item.movieId;
          return favoritesService.removeFavorite(userId, movieId, type);
        })
      );

      notifySuccess(`Todas las películas han sido eliminadas de ${type === 'favorite' ? 'favoritos' : 'ver más tarde'}`);
      
      if (type === 'favorite') {
        refetchFavorites();
      } else {
        refetchWatchlist();
      }
    } catch (error) {
      logger.error('Failed to remove all favorites', error, 'FavoritesPage');
      notifyError('Error al eliminar las películas');
    }
  };

  const currentItems = activeTab === 'favorites' ? favorites : watchlist;
  const isLoading = loading || (activeTab === 'favorites' ? loadingFavorites : loadingWatchlist);

  return (
    <Container className="FavoritesPage py-5">
      <div className="favorites-header mb-4">
        <h1 className="page-title">Mis Listas</h1>
        <p className="page-subtitle">Gestiona tus películas favoritas y tu lista de ver más tarde</p>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="favorites-tabs mb-4"
      >
        <Tab
          eventKey="favorites"
          title={
            <span className="tab-title">
              <FaHeart className="me-2" />
              Favoritos
              {favorites.length > 0 && (
                <span className="tab-badge">{favorites.length}</span>
              )}
            </span>
          }
        >
          <div className="favorites-content">
            {isLoading ? (
              <SkeletonCardList count={6} />
            ) : currentItems.length === 0 ? (
              <Alert variant="info" className="empty-state">
                <FaHeart size={48} className="mb-3" />
                <h3>No tienes películas favoritas</h3>
                <p>Agrega películas a tus favoritos haciendo clic en el corazón en las tarjetas de películas.</p>
                <Button as="a" href="/peliculas" variant="primary" className="mt-3">
                  Explorar Películas
                </Button>
              </Alert>
            ) : (
              <>
                <div className="favorites-actions mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveAll('favorite')}
                  >
                    <FaTrash className="me-2" />
                    Eliminar Todas
                  </Button>
                </div>
                <Row>
                  {currentItems.map((movie, index) => {
                    const movieKey = movie.id || movie._id || movie.tmdbId || `movie-${index}`;
                    return (
                      <Col key={movieKey} md={3} className="mb-4">
                        <MovieCard {...movie} movie={movie} />
                      </Col>
                    );
                  })}
                </Row>
              </>
            )}
          </div>
        </Tab>

        <Tab
          eventKey="watchlist"
          title={
            <span className="tab-title">
              <FaBookmark className="me-2" />
              Ver Más Tarde
              {watchlist.length > 0 && (
                <span className="tab-badge">{watchlist.length}</span>
              )}
            </span>
          }
        >
          <div className="favorites-content">
            {isLoading ? (
              <SkeletonCardList count={6} />
            ) : currentItems.length === 0 ? (
              <Alert variant="info" className="empty-state">
                <FaBookmark size={48} className="mb-3" />
                <h3>Tu lista está vacía</h3>
                <p>Agrega películas a "Ver más tarde" haciendo clic en el marcador en las tarjetas de películas.</p>
                <Button as="a" href="/peliculas" variant="primary" className="mt-3">
                  Explorar Películas
                </Button>
              </Alert>
            ) : (
              <>
                <div className="favorites-actions mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveAll('watchlist')}
                  >
                    <FaTrash className="me-2" />
                    Eliminar Todas
                  </Button>
                </div>
                <Row>
                  {currentItems.map((movie, index) => {
                    const movieKey = movie.id || movie._id || movie.tmdbId || `movie-${index}`;
                    return (
                      <Col key={movieKey} md={3} className="mb-4">
                        <MovieCard {...movie} movie={movie} />
                      </Col>
                    );
                  })}
                </Row>
              </>
            )}
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default FavoritesPage;

