import { useState, useEffect } from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import tmdbService from '../../services/tmdb.service';
import { getTMDBImageUrl } from '../../services/tmdb.service';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import { Button, Spinner, Alert } from '../UI';
import './PersonModal.css';

const PersonModal = ({ show, onHide, personId, personName }) => {
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPerson = async () => {
      if (!show || !personId || !ENV.HAS_TMDB) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const personData = await tmdbService.getPersonDetails(personId);
        setPerson(personData);
        logger.info('Person details loaded', { personId, name: personData.name }, 'PersonModal');
      } catch (err) {
        logger.error('Failed to load person details', err, 'PersonModal');
        setError('No se pudieron cargar los detalles de la persona');
      } finally {
        setLoading(false);
      }
    };

    loadPerson();
  }, [show, personId]);

  if (!show) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{personName || person?.name || 'Información'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner size="lg" />
            <p className="mt-3">Cargando información...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : person ? (
          <div className="person-details">
            <Row className="mb-4">
              <Col md={4}>
                {person.profile_path ? (
                  <img
                    src={getTMDBImageUrl(person.profile_path, 'w500')}
                    alt={person.name}
                    className="person-photo"
                  />
                ) : (
                  <div className="person-photo-placeholder">
                    <span>Sin foto</span>
                  </div>
                )}
              </Col>
              <Col md={8}>
                <h3>{person.name}</h3>
                {person.known_for_department && (
                  <p className="text-secondary mb-2">
                    <strong>Departamento:</strong> {person.known_for_department}
                  </p>
                )}
                {person.birthday && (
                  <p className="text-secondary mb-2">
                    <strong>Fecha de nacimiento:</strong> {new Date(person.birthday).toLocaleDateString('es-ES')}
                    {person.deathday && (
                      <span> - Fallecido: {new Date(person.deathday).toLocaleDateString('es-ES')}</span>
                    )}
                  </p>
                )}
                {person.place_of_birth && (
                  <p className="text-secondary mb-2">
                    <strong>Lugar de nacimiento:</strong> {person.place_of_birth}
                  </p>
                )}
                {person.popularity && (
                  <p className="text-secondary mb-2">
                    <strong>Popularidad:</strong> {person.popularity.toFixed(1)}
                  </p>
                )}
              </Col>
            </Row>

            {person.biography && (
              <div className="biography-section">
                <h4>Biografía</h4>
                <p className="biography-text">{person.biography}</p>
              </div>
            )}

            {person.also_known_as && person.also_known_as.length > 0 && (
              <div className="also-known-section">
                <h4>También conocido como</h4>
                <div className="also-known-badges">
                  {person.also_known_as.map((name, idx) => (
                    <span key={idx} className="badge bg-secondary me-2 mb-2">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PersonModal;

