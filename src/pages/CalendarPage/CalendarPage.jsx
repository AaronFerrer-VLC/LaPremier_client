import { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { moviesService } from '../../services/movies.service';
import MovieCard from '../../components/MovieCard/MovieCard';
import { SkeletonCardList } from '../../components/SkeletonLoader/SkeletonLoader';
import { Alert, Button } from '../../components/UI';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaHome } from 'react-icons/fa';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import './CalendarPage.css';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tmdbMovies, setTmdbMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch movies from TMDB (now playing and upcoming)
  useEffect(() => {
    const fetchMovies = async () => {
      if (!ENV.HAS_TMDB) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch both now playing and upcoming movies
        const [nowPlayingData, upcomingData] = await Promise.all([
          moviesService.getNowPlayingFromTMDB(1).catch(() => []),
          moviesService.getUpcomingFromTMDB(1).catch(() => []),
        ]);

        // Transform movies to ensure they have date field
        const transformMovieForCalendar = (movie) => {
          // Ensure date field exists - TMDB uses release_date
          const releaseDate = movie.date || movie.release_date;
          if (!releaseDate) return null;

          return {
            ...movie,
            date: releaseDate,
            release_date: releaseDate,
            id: movie.id || movie.tmdbId,
            tmdbId: movie.tmdbId || movie.id,
            _id: movie._id || movie.tmdbId || movie.id,
          };
        };

        // Combine and deduplicate by tmdbId, filtering out movies without dates
        const allMoviesMap = new Map();
        [...nowPlayingData, ...upcomingData].forEach(movie => {
          const transformed = transformMovieForCalendar(movie);
          if (!transformed) return; // Skip movies without dates
          
          const tmdbId = transformed.tmdbId || transformed.id;
          if (tmdbId && !allMoviesMap.has(tmdbId)) {
            allMoviesMap.set(tmdbId, transformed);
          }
        });

        const finalMovies = Array.from(allMoviesMap.values());
        setTmdbMovies(finalMovies);
        logger.info('Movies loaded for calendar', { 
          nowPlaying: nowPlayingData.length, 
          upcoming: upcomingData.length,
          total: finalMovies.length,
          withDates: finalMovies.filter(m => m.date).length
        }, 'CalendarPage');
      } catch (error) {
        logger.error('Failed to load movies for calendar', error, 'CalendarPage');
        setTmdbMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Obtener películas por mes/año desde TMDB
  const moviesByMonth = useMemo(() => {
    if (!tmdbMovies || tmdbMovies.length === 0) return {};

    const grouped = {};
    tmdbMovies
      .filter(movie => {
        // TMDB movies have release_date in format "YYYY-MM-DD"
        // Check both date and release_date fields
        const releaseDate = movie.date || movie.release_date;
        return releaseDate && releaseDate.trim() !== '' && releaseDate !== 'null';
      })
      .forEach(movie => {
        try {
          // TMDB uses release_date format: "YYYY-MM-DD"
          const releaseDate = movie.date || movie.release_date;
          if (!releaseDate || releaseDate === 'null') return;

          // Parse the date - TMDB format is "YYYY-MM-DD"
          let movieDate;
          if (typeof releaseDate === 'string' && releaseDate.includes('-')) {
            // Format: "YYYY-MM-DD"
            movieDate = new Date(releaseDate);
          } else {
            movieDate = new Date(releaseDate);
          }
          
          // Check if date is valid
          if (isNaN(movieDate.getTime())) {
            logger.warn('Invalid date format', { releaseDate, movie }, 'CalendarPage');
            return;
          }

          const monthKey = `${movieDate.getFullYear()}-${String(movieDate.getMonth() + 1).padStart(2, '0')}`;
          const day = movieDate.getDate();

          if (!grouped[monthKey]) {
            grouped[monthKey] = {};
          }
          if (!grouped[monthKey][day]) {
            grouped[monthKey][day] = [];
          }
          grouped[monthKey][day].push(movie);
        } catch (e) {
          logger.warn('Failed to process movie date for calendar', { movie, error: e }, 'CalendarPage');
        }
      });

    return grouped;
  }, [tmdbMovies]);

  // Navegar meses
  const changeMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null);
  };

  // Obtener días del mes
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthMovies = moviesByMonth[monthKey] || {};
  const days = getDaysInMonth(currentDate);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const selectedMovies = selectedDate ? (monthMovies[selectedDate] || []) : [];

  return (
    <Container className="CalendarPage py-5">
      <div className="calendar-header mb-4">
        <Row className="align-items-center">
          <Col>
            <h1 className="page-title">
              <FaCalendarAlt className="me-2" />
              Calendario de Estrenos
            </h1>
            <p className="page-subtitle">Descubre qué películas se estrenan cada día</p>
          </Col>
        </Row>
      </div>

      {/* Controles del calendario */}
      <div className="calendar-controls mb-4">
        <Row className="align-items-center">
          <Col md={6}>
            <div className="d-flex align-items-center gap-3">
              <Button variant="outline" onClick={() => changeMonth(-1)}>
                <FaChevronLeft />
              </Button>
              <h3 className="mb-0">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <Button variant="outline" onClick={() => changeMonth(1)}>
                <FaChevronRight />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Hoy
              </Button>
            </div>
          </Col>
          <Col md={6} className="text-end">
            <Form.Select
              value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setCurrentDate(new Date(parseInt(year), parseInt(month) - 1));
                setSelectedDate(null);
              }}
              style={{ maxWidth: '200px', display: 'inline-block' }}
            >
              {Array.from({ length: 24 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - 12 + i);
                const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                return (
                  <option key={value} value={value}>{label}</option>
                );
              })}
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Mensaje si TMDB no está disponible */}
      {!ENV.HAS_TMDB && (
        <Alert variant="warning" className="mb-4">
          TMDB API no está configurada. Por favor, configura VITE_TMDB_API_KEY en tu archivo .env para ver el calendario de estrenos.
        </Alert>
      )}

      {/* Calendario */}
      {loading ? (
        <SkeletonCardList count={8} />
      ) : (
        <>
          {!ENV.HAS_TMDB ? (
            <Alert variant="info">
              Configura la API de TMDB para ver el calendario de estrenos.
            </Alert>
          ) : (
            <>
              <div className="calendar-grid mb-4">
            <div className="calendar-weekdays">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {days.map((day, index) => {
                const isToday = day === new Date().getDate() && 
                               currentDate.getMonth() === new Date().getMonth() &&
                               currentDate.getFullYear() === new Date().getFullYear();
                const hasMovies = day && monthMovies[day] && monthMovies[day].length > 0;
                const isSelected = day === selectedDate;

                return (
                  <div
                    key={index}
                    className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${hasMovies ? 'has-movies' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => day && setSelectedDate(selectedDate === day ? null : day)}
                  >
                    {day && (
                      <>
                        <span className="day-number">{day}</span>
                        {hasMovies && (
                          <span className="movies-badge">{monthMovies[day].length}</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Películas del día seleccionado */}
          {selectedDate && (
            <div className="selected-day-movies">
              <h3 className="mb-3">
                Películas estrenadas el {selectedDate} de {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              {selectedMovies.length > 0 ? (
                <Row>
                  {selectedMovies.map(movie => {
                    const uniqueKey = movie.id || movie._id || movie.tmdbId || `movie-${movie.title?.spanish || movie.title}`;
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
              ) : (
                <Alert variant="info">
                  No hay películas estrenadas en esta fecha.
                </Alert>
              )}
            </div>
          )}
            </>
          )}
        </>
      )}

      {/* Botón de volver a la home al final */}
      <div className="text-center mt-5 mb-4">
        <Button variant="secondary" as={Link} to="/" size="lg">
          <FaHome className="me-2" />
          Volver a la Home
        </Button>
      </div>
    </Container>
  );
};

export default CalendarPage;

