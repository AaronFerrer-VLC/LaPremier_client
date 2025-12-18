/**
 * CitySelector Component
 * Allows user to select or change their city
 */

import { useState, useEffect } from 'react';
import { Button, Modal, Input } from '../UI';
import locationService from '../../services/location.service';
import { notifySuccess, notifyError } from '../../utils/notifications';
import logger from '../../utils/logger';
import './CitySelector.css';

const CitySelector = ({ onCityChange, currentCity }) => {
  const [showModal, setShowModal] = useState(false);
  const [city, setCity] = useState(currentCity || '');
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    // Load saved city on mount
    const savedCity = locationService.getSavedCity();
    if (savedCity && !currentCity) {
      setCity(savedCity);
      if (onCityChange) {
        onCityChange(savedCity);
      }
    }
  }, [currentCity, onCityChange]);

  const handleDetectCity = async () => {
    try {
      setIsDetecting(true);
      const detectedCity = await locationService.getUserCity();
      setCity(detectedCity);
      if (onCityChange) {
        onCityChange(detectedCity);
      }
      notifySuccess(`Ciudad detectada: ${detectedCity}`);
      setShowModal(false);
    } catch (error) {
      logger.error('Failed to detect city', error, 'CitySelector');
      notifyError('No se pudo detectar tu ciudad. Por favor, selecciónala manualmente.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSaveCity = () => {
    if (!city.trim()) {
      notifyError('Por favor, ingresa una ciudad');
      return;
    }

    locationService.setUserCity(city.trim());
    if (onCityChange) {
      onCityChange(city.trim());
    }
    notifySuccess(`Ciudad actualizada: ${city}`);
    setShowModal(false);
  };

  const popularCities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Zaragoza', 'Murcia'];

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setShowModal(true)}
        className="city-selector-btn"
        aria-label="Cambiar ciudad"
      >
        📍 {currentCity || city || 'Seleccionar ciudad'}
      </Button>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Seleccionar Ciudad"
        size="md"
      >
        <div className="CitySelector">
          <div className="mb-4">
            <Input
              label="Ciudad"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ej: Madrid, Barcelona..."
              className="mb-3"
            />

            <Button
              variant="primary"
              onClick={handleSaveCity}
              className="w-100 mb-3"
            >
              Guardar Ciudad
            </Button>

            <div className="text-center mb-3">
              <span className="text-secondary">o</span>
            </div>

            <Button
              variant="outline"
              onClick={handleDetectCity}
              disabled={isDetecting}
              className="w-100 mb-4"
            >
              {isDetecting ? 'Detectando...' : '📍 Detectar mi ciudad automáticamente'}
            </Button>
          </div>

          <div>
            <p className="text-secondary mb-2">Ciudades populares:</p>
            <div className="popular-cities">
              {popularCities.map((popularCity) => (
                <Button
                  key={popularCity}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCity(popularCity);
                    locationService.setUserCity(popularCity);
                    if (onCityChange) {
                      onCityChange(popularCity);
                    }
                    notifySuccess(`Ciudad actualizada: ${popularCity}`);
                    setShowModal(false);
                  }}
                  className="city-chip"
                >
                  {popularCity}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CitySelector;

