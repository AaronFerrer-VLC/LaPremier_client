/**
 * NowPlayingPage
 * Shows movies currently playing in theaters, filtered by user's city
 */

import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { moviesService } from '../../services/movies.service';
import { cinemasService } from '../../services/cinemas.service';
import locationService from '../../services/location.service';
import { useApi } from '../../hooks/useApi';
import { SkeletonCardList } from '../../components/SkeletonLoader/SkeletonLoader';
import { Button, Alert as UIAlert } from '../../components/UI';
import CitySelector from '../../components/CitySelector/CitySelector';
import MovieCard from '../../components/MovieCard/MovieCard';
import { notifyError } from '../../utils/notifications';
import logger from '../../utils/logger';
import { ENV } from '../../config/env';
import './NowPlayingPage.css';

const NowPlayingPage = () => {
  const [userCity, setUserCity] = useState(null);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [error, setError] = useState(null);

  // Fetch local cinemas
  const { data: localCinemas, loading: loadingCinemas } = useApi(
    () => cinemasService.getAll(),
    []
  );

  // Get cinemas in user's city
  const cinemasInCity = useMemo(() => {
    if (!localCinemas || !userCity) return [];
    return localCinemas.filter(
      (cinema) =>
        !cinema.isDeleted &&
        cinema.address?.city?.toLowerCase() === userCity.toLowerCase()
    );
  }, [localCinemas, userCity]);

  // Load user city on mount
  useEffect(() => {
    const loadUserCity = async () => {
      try {
        const city = await locationService.getUserCity();
        setUserCity(city);
      } catch (error) {
        logger.error('Failed to load user city', error, 'NowPlayingPage');
        setUserCity('Madrid'); // Default
      }
    };
    loadUserCity();
  }, []);

  // Fetch now playing movies from TMDB
  useEffect(() => {
    const fetchNowPlaying = async () => {
      if (!ENV.HAS_TMDB) {
        setError('TMDB API key no configurada');
        setLoadingMovies(false);
        return;
      }

      try {
        setLoadingMovies(true);
        setError(null);
        const movies = await moviesService.getNowPlayingFromTMDB(1);
        setNowPlayingMovies(movies);
      } catch (err) {
        logger.error('Failed to fetch now playing movies', err, 'NowPlayingPage');
        setError('No se pudieron cargar las películas en cartelera');
        notifyError('Error al cargar películas en cartelera');
      } finally {
        setLoadingMovies(false);
      }
    };

    if (userCity) {
      fetchNowPlaying();
    }
  }, [userCity]);

  // Filter movies that are in cinemas of the user's city
  const moviesInCityCinemas = useMemo(() => {
    if (!nowPlayingMovies.length || !cinemasInCity.length) return [];

    // Get all movie IDs from cinemas in city
    const movieIdsInCity = new Set();
    cinemasInCity.forEach((cinema) => {
      if (Array.isArray(cinema.movieId)) {
        cinema.movieId.forEach((id) => movieIdsInCity.add(id));
      } else if (cinema.movieId) {
        movieIdsInCity.add(cinema.movieId);
      }
    });

    // Match TMDB movies with local movies by checking if they exist in local DB
    // For now, show all now playing movies (we'll improve this later)
    return nowPlayingMovies;
  }, [nowPlayingMovies, cinemasInCity]);

  const handleCityChange = (newCity) => {
    setUserCity(newCity);
  };

  if (!userCity) {
    return (
      <div className="NowPlayingPage">
        <Container className="py-5">
          <SkeletonCardList count={6} />
        </Container>
      </div>
    );
  }

  return (
    <div className="NowPlayingPage">
      <Container className="py-5">
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="section-title">Películas en Cartelera</h1>
            <p className="text-secondary">
              {userCity && `En cines de ${userCity}`}
            </p>
          </Col>
          <Col xs="auto">
            <CitySelector
              currentCity={userCity}
              onCityChange={handleCityChange}
            />
          </Col>
        </Row>

        {error && (
          <UIAlert variant="danger" className="mb-4" title="Error">
            <p className="text-primary">{error}</p>
          </UIAlert>
        )}

        {!ENV.HAS_TMDB && (
          <UIAlert variant="warning" className="mb-4" title="Configuración requerida">
            <p className="text-primary">
              Para mostrar películas en cartelera, necesitas configurar VITE_TMDB_API_KEY en tu archivo .env
            </p>
          </UIAlert>
        )}

        {loadingMovies ? (
          <SkeletonCardList count={6} />
        ) : moviesInCityCinemas.length === 0 ? (
          <UIAlert variant="info" className="mb-4" title="No hay películas">
            <p className="text-primary">
              No se encontraron películas en cartelera para {userCity}. 
              Intenta con otra ciudad o verifica que haya cines configurados.
            </p>
            <Button
              variant="primary"
              as={Link}
              to="/cines"
              className="mt-3"
            >
              Ver Cines
            </Button>
          </UIAlert>
        ) : (
          <>
            <Row className="mb-3">
              <Col>
                <p className="text-secondary">
                  Mostrando {moviesInCityCinemas.length} película{moviesInCityCinemas.length !== 1 ? 's' : ''} en cartelera
                </p>
              </Col>
            </Row>
            <Row className="g-4">
              {moviesInCityCinemas.map((movie, index) => (
                <Col key={movie.tmdbId || index} xs={12} sm={6} md={4} lg={3}>
                  <MovieCard
                    movie={movie}
                    id={movie.id}
                    tmdbId={movie.tmdbId}
                    title={movie.title}
                    country={movie.country}
                    duration={movie.duration}
                    language={movie.language}
                    calification={movie.calification}
                    poster={movie.poster}
                  />
                </Col>
              ))}
            </Row>
          </>
        )}

        <Row className="mt-5">
          <Col className="text-center">
            <Button variant="secondary" as={Link} to="/">
              Volver a la Home
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NowPlayingPage;

