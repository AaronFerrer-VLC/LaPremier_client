/**
 * SyncCinemasPage
 * Page to search and sync cinemas from external APIs to local database
 */

import { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CinemaAPISearch from '../../../components/CinemaAPISearch/CinemaAPISearch';
import { cinemasService } from '../../../services/cinemas.service';
import locationService from '../../../services/location.service';
import { notifySuccess, notifyError } from '../../../utils/notifications';
import logger from '../../../utils/logger';
import { Button, Alert } from '../../../components/UI';
import './SyncCinemasPage.css';

const SyncCinemasPage = () => {
  const navigate = useNavigate();
  const [userCity, setUserCity] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const loadUserCity = async () => {
      try {
        const city = await locationService.getUserCity();
        setUserCity(city);
      } catch (error) {
        logger.error('Failed to load user city', error, 'SyncCinemasPage');
        setUserCity('Madrid');
      }
    };
    loadUserCity();
  }, []);

  const handleCinemaSelected = (cinema) => {
    setSelectedCinema(cinema);
  };

  const handleSyncCinema = async () => {
    if (!selectedCinema) {
      notifyError('Por favor, selecciona un cine primero');
      return;
    }

    try {
      setSyncing(true);

      // Transform API cinema data to our format
      const cinemaData = {
        name: selectedCinema.name,
        address: {
          street: selectedCinema.address.street || '',
          city: selectedCinema.address.city || userCity || '',
          zipcode: selectedCinema.address.zipcode || '',
          country: selectedCinema.address.country || 'Spain',
        },
        cover: [], // Will need to be added manually or from API if available
        url: selectedCinema.website || '', // From Google Places if available
        price: {
          regular: 0,
          weekend: 0,
          special: 0,
        },
        specs: {
          VO: false,
          is3D: false,
          accesibility: false,
        },
        services: [],
        capacity: {
          dicerooms: 0,
          seating: 0,
        },
        movieId: [],
        // Store API data for reference
        apiData: {
          placeId: selectedCinema.placeId,
          source: selectedCinema.source,
          location: selectedCinema.location,
          rating: selectedCinema.rating,
          ratingCount: selectedCinema.ratingCount || 0,
          formattedAddress: selectedCinema.formattedAddress || '',
          priceLevel: selectedCinema.priceLevel || null,
        },
      };

      // Create cinema in local database
      const response = await cinemasService.create(cinemaData);
      const newCinema = response.data;

      notifySuccess(`Cine "${newCinema.name}" sincronizado correctamente`);
      logger.info('Cinema synced from API', { cinemaId: newCinema.id, source: selectedCinema.source }, 'SyncCinemasPage');

      // Navigate to edit page to complete details
      navigate(`/cines/editar/${newCinema.id}`);
    } catch (error) {
      logger.error('Failed to sync cinema', error, 'SyncCinemasPage');
      notifyError('Error al sincronizar el cine');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="SyncCinemasPage">
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h1 className="section-title">Sincronizar Cines desde API</h1>
            <p className="text-secondary">
              Busca cines en tu ciudad usando APIs externas y sincronízalos con la base de datos local
            </p>
          </Col>
        </Row>

        <Tabs defaultActiveKey="search" className="mb-4">
          <Tab eventKey="search" title="🔍 Buscar Cines">
            <div className="mt-4">
              <CinemaAPISearch
                city={userCity}
                onCinemaSelected={handleCinemaSelected}
              />
            </div>
          </Tab>

          <Tab eventKey="selected" title="✅ Cine Seleccionado">
            <div className="mt-4">
              {selectedCinema ? (
                <div className="selected-cinema">
                  <Alert variant="success" className="mb-4" title="Cine Seleccionado">
                    <div className="text-primary">
                      <h5 className="mb-3">{selectedCinema.name}</h5>
                      <p>
                        <strong>Dirección:</strong> {selectedCinema.address.street}, {selectedCinema.address.city}
                        {selectedCinema.address.zipcode && ` ${selectedCinema.address.zipcode}`}
                      </p>
                      {selectedCinema.rating > 0 && (
                        <p>
                          <strong>Valoración:</strong> ⭐ {selectedCinema.rating.toFixed(1)}/5
                          {selectedCinema.ratingCount > 0 && (
                            <span className="ms-2">
                              ({selectedCinema.ratingCount.toLocaleString()} valoraciones)
                            </span>
                          )}
                        </p>
                      )}
                      {selectedCinema.formattedAddress && (
                        <p>
                          <strong>Dirección completa:</strong> {selectedCinema.formattedAddress}
                        </p>
                      )}
                      {selectedCinema.priceLevel !== null && selectedCinema.priceLevel !== undefined && (
                        <p>
                          <strong>Nivel de precio:</strong> {'€'.repeat(selectedCinema.priceLevel + 1)} ({
                            selectedCinema.priceLevel === 0 ? 'Gratis' : 
                            selectedCinema.priceLevel === 1 ? 'Económico' :
                            selectedCinema.priceLevel === 2 ? 'Moderado' :
                            selectedCinema.priceLevel === 3 ? 'Caro' : 'Muy caro'
                          })
                        </p>
                      )}
                      <p>
                        <strong>Fuente:</strong> {
                          selectedCinema.source === 'google_places' ? 'Google Places' :
                          selectedCinema.source === 'foursquare' ? 'Foursquare' :
                          'OpenStreetMap'
                        }
                      </p>
                    </div>
                  </Alert>

                  <div className="d-flex gap-3">
                    <Button
                      variant="accent"
                      onClick={handleSyncCinema}
                      disabled={syncing}
                    >
                      {syncing ? 'Sincronizando...' : '💾 Sincronizar a Base de Datos'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedCinema(null)}
                    >
                      Limpiar Selección
                    </Button>
                  </div>

                  <Alert variant="info" className="mt-4" title="Nota">
                    <p className="text-primary">
                      Al sincronizar, el cine se agregará a la base de datos local. 
                      Podrás editarlo después para agregar precios, servicios, horarios, etc.
                    </p>
                  </Alert>
                </div>
              ) : (
                <Alert variant="info" title="Sin selección">
                  <p className="text-primary">
                    Busca cines en la pestaña "Buscar Cines" y selecciona uno para sincronizarlo.
                  </p>
                </Alert>
              )}
            </div>
          </Tab>
        </Tabs>

        <Row className="mt-5">
          <Col className="text-center">
            <Button variant="secondary" onClick={() => navigate('/cines')}>
              Volver a Cines
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SyncCinemasPage;

