import { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes, FaStar } from 'react-icons/fa';
import { moviesService } from '../../services/movies.service';
import tmdbService from '../../services/tmdb.service';
import { useApi } from '../../hooks/useApi';
import MovieCard from '../MovieCard/MovieCard';
import { Input, Button, Badge } from '../UI';
import { SkeletonCardList } from '../SkeletonLoader/SkeletonLoader';
import { Alert } from '../UI';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import { debounce } from '../../utils/debounce';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onResultsChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [showFilters, setShowFilters] = useState(false);
  const [tmdbResults, setTmdbResults] = useState([]);
  const [isSearchingTMDB, setIsSearchingTMDB] = useState(false);
  const [tmdbGenres, setTmdbGenres] = useState([]);

  // Load TMDB genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      if (!ENV.HAS_TMDB) return;
      try {
        const genres = await tmdbService.getGenres();
        setTmdbGenres(genres);
      } catch (error) {
        logger.error('Failed to load TMDB genres', error, 'AdvancedSearch');
      }
    };
    loadGenres();
  }, []);

  // Search TMDB using Discover or Search API
  useEffect(() => {
    const searchTMDB = async () => {
      if (!ENV.HAS_TMDB) {
        setTmdbResults([]);
        return;
      }

      // Use Discover if we have filters but no search query, or if we have filters + query
      const hasFilters = selectedGenres.length > 0 || selectedLanguage || selectedCountry || yearFrom || yearTo || minRating;
      const useDiscover = hasFilters || (!searchQuery || searchQuery.trim().length < 2);

      setIsSearchingTMDB(true);
      try {
        let results;
        
        if (useDiscover) {
          // Use Discover API with filters
          const discoverFilters = {};
          
          if (selectedGenres.length > 0) {
            // Map genre names to IDs
            const genreIds = selectedGenres.map(genreName => {
              const genre = tmdbGenres.find(g => g.name === genreName);
              return genre?.id;
            }).filter(Boolean);
            if (genreIds.length > 0) {
              discoverFilters.with_genres = genreIds.join(',');
            }
          }
          
          if (selectedLanguage) {
            discoverFilters.with_original_language = selectedLanguage;
          }
          
          if (yearFrom) {
            discoverFilters['primary_release_date.gte'] = `${yearFrom}-01-01`;
          }
          
          if (yearTo) {
            discoverFilters['primary_release_date.lte'] = `${yearTo}-12-31`;
          }
          
          if (minRating) {
            discoverFilters['vote_average.gte'] = minRating;
          }
          
          if (searchQuery && searchQuery.trim().length >= 2) {
            // Use search query in Discover
            discoverFilters.query = searchQuery.trim();
          }
          
          discoverFilters.sort_by = sortBy;
          
          results = await moviesService.discoverMoviesFromTMDB(discoverFilters, 1);
          setTmdbResults(results);
        } else {
          // Use regular search API
          const searchResults = await moviesService.searchTMDB(searchQuery.trim(), 1);
          const transformedMovies = (searchResults.results || []).map(movie => {
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
              gender: (movie.genre_ids || []).map(id => {
                const genre = tmdbGenres.find(g => g.id === id);
                return genre?.name || `Género ${id}`;
              }),
              description: movie.overview || '',
              rating: movie.vote_average || 0,
              released: !!movie.release_date
            };
          });
          setTmdbResults(transformedMovies);
        }
        
        logger.info('TMDB search/discover completed', { 
          query: searchQuery, 
          useDiscover, 
          results: Array.isArray(results) ? results.length : results?.results?.length || 0 
        }, 'AdvancedSearch');
      } catch (error) {
        logger.error('TMDB search/discover failed', error, 'AdvancedSearch');
        setTmdbResults([]);
      } finally {
        setIsSearchingTMDB(false);
      }
    };

    const debouncedSearch = debounce(searchTMDB, 500);
    debouncedSearch();
  }, [searchQuery, selectedGenres, selectedLanguage, selectedCountry, yearFrom, yearTo, minRating, sortBy, tmdbGenres]);

  // Use TMDB results (from Discover or Search)
  const allMovies = tmdbResults;
  const loading = isSearchingTMDB;

  // Use TMDB genres list instead of extracting from results
  const availableGenres = useMemo(() => {
    return tmdbGenres.map(g => g.name).sort();
  }, [tmdbGenres]);

  // Obtener idiomas únicos
  const availableLanguages = useMemo(() => {
    if (!allMovies || allMovies.length === 0) return [];
    const languagesSet = new Set();
    allMovies.forEach(movie => {
      if (movie.language) {
        languagesSet.add(movie.language);
      }
    });
    return Array.from(languagesSet).sort();
  }, [allMovies]);

  // Obtener países únicos
  const availableCountries = useMemo(() => {
    if (!allMovies || allMovies.length === 0) return [];
    const countriesSet = new Set();
    allMovies.forEach(movie => {
      if (movie.country) {
        countriesSet.add(movie.country);
      }
    });
    return Array.from(countriesSet).sort();
  }, [allMovies]);

  // Filtered movies - Discover already applies filters, so we just use results directly
  const filteredMovies = useMemo(() => {
    // Discover API already applies all filters server-side
    // Just return the results as-is
    return allMovies || [];
  }, [allMovies]);

  // Notificar cambios en resultados
  useEffect(() => {
    if (onResultsChange) {
      onResultsChange(filteredMovies.length);
    }
  }, [filteredMovies.length, onResultsChange]);

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setSelectedLanguage('');
    setSelectedCountry('');
    setYearFrom('');
    setYearTo('');
    setMinRating('');
    setSortBy('popularity.desc');
  };

  const hasActiveFilters = searchQuery || selectedGenres.length > 0 || selectedLanguage || selectedCountry || yearFrom || yearTo || minRating;

  return (
    <div className="AdvancedSearch">
      <Container>
        <Row className="mb-4">
          <Col>
            <div className="search-header">
              <h2 className="search-title">Búsqueda Avanzada</h2>
              <p className="search-subtitle">Encuentra películas usando múltiples criterios</p>
            </div>
          </Col>
        </Row>

        {/* Barra de búsqueda principal */}
        <Row className="mb-4">
          <Col md={10}>
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <Input
                type="text"
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </Col>
          <Col md={2}>
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="w-100"
            >
              <FaFilter className="me-2" />
              Filtros
            </Button>
          </Col>
        </Row>

        {/* Filtros avanzados */}
        {showFilters && (
          <div className="filters-panel">
            <Row className="mb-3">
              <Col>
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="filters-title">Filtros</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <FaTimes className="me-2" />
                      Limpiar Filtros
                    </Button>
                  )}
                </div>
              </Col>
            </Row>

            {/* Géneros */}
            <Row className="mb-3">
              <Col>
                <Form.Label><strong>Géneros</strong></Form.Label>
                <div className="genre-badges">
                  {availableGenres.map(genre => (
                    <Badge
                      key={genre}
                      variant={selectedGenres.includes(genre) ? 'accent' : 'medium'}
                      className="genre-badge"
                      onClick={() => handleGenreToggle(genre)}
                      style={{ cursor: 'pointer' }}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>

            {/* Idioma y País */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label><strong>Idioma</strong></Form.Label>
                <Form.Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="">Todos los idiomas</option>
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label><strong>País</strong></Form.Label>
                <Form.Select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="">Todos los países</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            {/* Año y Rating */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label><strong>Año desde</strong></Form.Label>
                <Input
                  type="number"
                  placeholder="Ej: 2020"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </Col>
              <Col md={4}>
                <Form.Label><strong>Año hasta</strong></Form.Label>
                <Input
                  type="number"
                  placeholder="Ej: 2025"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </Col>
              <Col md={4}>
                <Form.Label><strong>Rating mínimo</strong></Form.Label>
                <Input
                  type="number"
                  placeholder="Ej: 7.0"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                />
              </Col>
            </Row>

            {/* Ordenar por */}
            <Row>
              <Col>
                <Form.Label><strong>Ordenar por</strong></Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularity.desc">Más populares</option>
                  <option value="popularity.asc">Menos populares</option>
                  <option value="vote_average.desc">Mejor valoradas</option>
                  <option value="vote_average.asc">Peor valoradas</option>
                  <option value="release_date.desc">Más recientes</option>
                  <option value="release_date.asc">Más antiguas</option>
                  <option value="title.asc">Título A-Z</option>
                  <option value="title.desc">Título Z-A</option>
                </Form.Select>
              </Col>
            </Row>
          </div>
        )}

        {/* Resultados */}
        <Row className="mt-4">
          <Col>
            <div className="results-header mb-3">
              <h3>
                Resultados: {filteredMovies.length} {filteredMovies.length === 1 ? 'película' : 'películas'}
              </h3>
            </div>

            {!ENV.HAS_TMDB ? (
              <Alert variant="warning">
                La búsqueda de TMDB no está disponible. Por favor, configura la API key de TMDB.
              </Alert>
            ) : loading ? (
              <SkeletonCardList count={8} />
            ) : !searchQuery || searchQuery.trim().length < 2 ? (
              <Alert variant="info">
                <FaSearch className="me-2" />
                Escribe al menos 2 caracteres para buscar películas en TMDB.
              </Alert>
            ) : filteredMovies.length === 0 ? (
              <Alert variant="info">
                <FaSearch className="me-2" />
                No se encontraron películas con los criterios seleccionados.
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </Alert>
            ) : (
              <Row>
                {filteredMovies.map(movie => {
                  const uniqueKey = movie.id || movie._id || movie.tmdbId || `movie-${movie.title?.spanish || movie.title}`;
                  return (
                    <Col key={uniqueKey} md={3} className="mb-4">
                      <MovieCard 
                        movie={movie} 
                        id={movie.id || movie.tmdbId}
                        tmdbId={movie.tmdbId}
                        title={movie.title?.spanish || movie.title}
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
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdvancedSearch;

