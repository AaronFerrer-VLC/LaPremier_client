import { useState, useEffect, useMemo } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Button, Badge } from '../UI';
import { FaRoute, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import logger from '../../utils/logger';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import './EnhancedMap.css';

const EnhancedMap = ({ cinema, userLocation = null, showRoute = false }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [showDirections, setShowDirections] = useState(showRoute);

  const { isLoaded } = useGoogleMaps();

  // Obtener coordenadas del cine
  useEffect(() => {
    // First, try to use saved coordinates if available
    if (cinema?.location?.lat && cinema?.location?.lng) {
      setCoordinates({ 
        lat: cinema.location.lat, 
        lng: cinema.location.lng 
      });
      return;
    }

    // If no saved coordinates, geocode from address
    if (!cinema?.address) return;

    const fullAddress = `${cinema.address.street}, ${cinema.address.city}, ${cinema.address.country}`;
    
    if (isLoaded && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          setCoordinates({ lat: location.lat(), lng: location.lng() });
        } else {
          logger.error('Geocodificación fallida', { status, address: fullAddress }, 'EnhancedMap');
        }
      });
    }
  }, [cinema, isLoaded]);

  // Calcular ruta si hay ubicación del usuario
  useEffect(() => {
    if (!showDirections || !userLocation || !coordinates || !isLoaded || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: userLocation,
        destination: coordinates,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          const route = result.routes[0];
          if (route.legs[0]) {
            setDistance(route.legs[0].distance.text);
            setDuration(route.legs[0].duration.text);
          }
        } else {
          logger.error('Error al calcular ruta', { status }, 'EnhancedMap');
        }
      }
    );
  }, [showDirections, userLocation, coordinates, isLoaded]);

  const handleGetRoute = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setShowDirections(true);
          // El efecto calculará la ruta automáticamente
        },
        (error) => {
          logger.error('Error al obtener ubicación', error, 'EnhancedMap');
          alert('No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  const openInGoogleMaps = () => {
    if (coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  if (!isLoaded || !coordinates) {
    return (
      <div className="EnhancedMap loading">
        <div className="map-placeholder">
          <FaMapMarkerAlt size={48} />
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="EnhancedMap">
      <div className="map-header">
        <div className="map-info">
          {distance && duration && (
            <div className="route-info">
              <Badge variant="accent" className="me-2">
                📍 {distance}
              </Badge>
              <Badge variant="medium">
                ⏱️ {duration}
              </Badge>
            </div>
          )}
        </div>
        <div className="map-actions">
          {!showDirections && (
            <Button variant="outline" size="sm" onClick={handleGetRoute}>
              <FaRoute className="me-2" />
              Obtener Ruta
            </Button>
          )}
          {showDirections && (
            <Button variant="ghost" size="sm" onClick={() => setShowDirections(false)}>
              <FaTimes className="me-2" />
              Ocultar Ruta
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
            Abrir en Google Maps
          </Button>
        </div>
      </div>
      
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '400px' }}
          zoom={15}
          center={coordinates}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          <Marker 
            position={coordinates}
            title={cinema?.name}
          />
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>
    </div>
  );
};

export default EnhancedMap;

