import { useState, useEffect } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api';
import logger from '../../utils/logger';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

const CustomMap = (address) => {
    const [addressValue, setAddressValue] = useState(address)
    const [coordinates, setCoordinates] = useState()
    const [marker, setMarker] = useState(false)

    const { isLoaded } = useGoogleMaps()

    const getCoordinates = addressCorrected => {
        if (!isLoaded || !window.google || !window.google.maps) {
            logger.error('Google Maps API not loaded', {}, 'CustomMap');
            return;
        }

        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({ address: addressCorrected }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK) {
                const location = results[0].geometry.location;
                setCoordinates({ lat: location.lat(), lng: location.lng() })
            } else {
                logger.error('Geocodificación fallida', { status, address: addressCorrected }, 'CustomMap');
            }
        });
    }

    const handleMap = () => {
        const fullAddress = `${addressValue.address.street} ${addressValue.address.city} ${addressValue.address.country}`
        const addressCorrected = fullAddress.replaceAll(" ", "");
        getCoordinates(addressCorrected)
    }

    useEffect(() => { 
        if (isLoaded) {
            handleMap();
        }
    }, [isLoaded])

    const [map, setMap] = useState(null)

    const onLoad = (map) => handleMarker()
    const onUnmount = () => setMap(null)

    const handleMarker = () => {
        setMarker(true)
    }

    return isLoaded && coordinates && (
        <div>
            <GoogleMap
                mapContainerStyle={{ height: '300px' }}
                zoom={15}
                onLoad={onLoad}
                center={{ lat: coordinates.lat, lng: coordinates.lng }}
                onUnmount={onUnmount}
            >
                {
                    marker &&
                    <Marker position={{ lat: coordinates.lat, lng: coordinates.lng }} />
                }
            </GoogleMap>
        </div>
    )
}

export default CustomMap
