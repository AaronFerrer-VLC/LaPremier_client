/**
 * CinemaAPISearch Component
 * Searches and displays cinemas from external APIs (Google Places, Foursquare, OpenStreetMap)
 */

import { useState, useEffect } from 'react';
import { Row, Col, ListGroup } from 'react-bootstrap';
import { Button, Card, Alert, Spinner } from '../UI';
import cinemasAPIService from '../../services/cinemas-api.service';
import locationService from '../../services/location.service';
import { notifySuccess, notifyError } from '../../utils/notifications';
import logger from '../../utils/logger';
import { ENV } from '../../config/env';
import './CinemaAPISearch.css';

const CinemaAPISearch = ({ city, onCinemaSelected, onCinemasLoaded }) => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchCity, setSearchCity] = useState(city || '');

  useEffect(() => {
    if (city) {
      setSearchCity(city);
      searchCinemas(city);
    }
  }, [city]);

  const searchCinemas = async (cityToSearch) => {
    if (!cityToSearch || cityToSearch.trim().length < 2) {
      setError('Por favor, ingresa una ciudad válida');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to get coordinates for better accuracy
      let lat = null;
      let lng = null;
      try {
        const position = await locationService.getCurrentPosition();
        lat = position.lat;
        lng = position.lng;
      } catch (err) {
        // If geolocation fails, continue without coordinates
        logger.warn('Could not get coordinates, using city name only', err, 'CinemaAPISearch');
      }

      const results = await cinemasAPIService.searchCinemas(cityToSearch.trim(), lat, lng);
      setCinemas(results);

      if (onCinemasLoaded) {
        onCinemasLoaded(results);
      }

      if (results.length === 0) {
        setError(`No se encontraron cines en ${cityToSearch}`);
      } else {
        notifySuccess(`Se encontraron ${results.length} cines en ${cityToSearch}`);
      }
    } catch (err) {
      logger.error('Failed to search cinemas', err, 'CinemaAPISearch');
      setError(err.message || 'Error al buscar cines');
      notifyError('Error al buscar cines');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchCinemas(searchCity);
  };

  const handleCinemaSelect = (cinema) => {
    if (onCinemaSelected) {
      onCinemaSelected(cinema);
    }
  };

  return (
    <div className="CinemaAPISearch">
      <form onSubmit={handleSearch} className="mb-4">
        <Row className="g-2 align-items-end">
          <Col xs={12} md={8}>
            <label htmlFor="city-search" className="form-label text-primary">
              Buscar cines en:
            </label>
            <input
              id="city-search"
              type="text"
              className="form-control"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Ej: Madrid, Barcelona..."
              disabled={loading}
            />
          </Col>
          <Col xs={12} md={4}>
            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={loading || !searchCity.trim()}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Buscando...
                </>
              ) : (
                '🔍 Buscar Cines'
              )}
            </Button>
          </Col>
        </Row>
      </form>

      {error && (
        <Alert variant="danger" className="mb-4" title="Error">
          <p className="text-primary">{error}</p>
        </Alert>
      )}

      {ENV.HAS_GOOGLE_PLACES && (
        <Alert variant="success" className="mb-4" title="Google Places API activa">
          <p className="text-primary">
            ✅ Usando Google Places API para obtener información detallada de cines.
          </p>
        </Alert>
      )}
      
      {!ENV.HAS_GOOGLE_PLACES && ENV.HAS_FOURSQUARE && (
        <Alert variant="info" className="mb-4" title="Foursquare API activa">
          <p className="text-primary">
            Usando Foursquare Places API. Para mejores resultados, configura Google Places API.
          </p>
        </Alert>
      )}
      
      {!ENV.HAS_GOOGLE_PLACES && !ENV.HAS_FOURSQUARE && (
        <Alert variant="warning" className="mb-4" title="Usando OpenStreetMap">
          <p className="text-primary">
            ⚠️ Usando OpenStreetMap (gratis, información limitada). Para mejores resultados, configura Google Places API o Foursquare API.
          </p>
        </Alert>
      )}

      {loading && (
        <div className="text-center py-5">
          <Spinner size="lg" variant="primary" />
          <p className="text-secondary mt-3">Buscando cines...</p>
        </div>
      )}

      {!loading && cinemas.length > 0 && (
        <div className="cinemas-results">
          <h4 className="text-primary mb-3">
            Cines encontrados ({cinemas.length})
          </h4>
          <ListGroup>
            {cinemas.map((cinema, index) => (
              <ListGroup.Item
                key={cinema.placeId || index}
                className="cinema-result-item bg-secondary border-secondary"
              >
                <Row className="align-items-center">
                  <Col md={8}>
                    <h5 className="text-primary mb-2">{cinema.name}</h5>
                    <p className="text-secondary mb-1">
                      📍 {cinema.address.street}, {cinema.address.city}
                      {cinema.address.zipcode && ` ${cinema.address.zipcode}`}
                    </p>
                    {cinema.rating > 0 && (
                      <p className="text-secondary mb-1">
                        ⭐ {cinema.rating.toFixed(1)}/5
                        {cinema.ratingCount > 0 && (
                          <span className="ms-2 text-muted">
                            ({cinema.ratingCount.toLocaleString()} valoraciones)
                          </span>
                        )}
                      </p>
                    )}
                    {cinema.formattedAddress && cinema.formattedAddress !== `${cinema.address.street}, ${cinema.address.city}` && (
                      <p className="text-secondary mb-1 small">
                        {cinema.formattedAddress}
                      </p>
                    )}
                    {cinema.priceLevel !== null && cinema.priceLevel !== undefined && (
                      <p className="text-secondary mb-1 small">
                        Precio: {'€'.repeat(cinema.priceLevel + 1)} ({cinema.priceLevel === 0 ? 'Gratis' : 
                                                                        cinema.priceLevel === 1 ? 'Económico' :
                                                                        cinema.priceLevel === 2 ? 'Moderado' :
                                                                        cinema.priceLevel === 3 ? 'Caro' : 'Muy caro'})
                      </p>
                    )}
                    <small className="text-muted">
                      Fuente: {cinema.source === 'google_places' ? 'Google Places' : 
                               cinema.source === 'foursquare' ? 'Foursquare' : 
                               'OpenStreetMap'}
                    </small>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleCinemaSelect(cinema)}
                    >
                      Seleccionar
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}

      {!loading && cinemas.length === 0 && searchCity && !error && (
        <Alert variant="info" className="mb-4" title="Sin resultados">
          <p className="text-primary">
            No se encontraron cines en {searchCity}. Intenta con otra ciudad.
          </p>
        </Alert>
      )}
    </div>
  );
};

export default CinemaAPISearch;

