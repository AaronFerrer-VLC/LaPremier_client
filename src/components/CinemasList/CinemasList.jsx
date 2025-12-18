import { useState, useEffect } from "react"
import CinemaCard from "../CinemaCard/CinemaCard"
import { Col, Row } from "react-bootstrap"
import "./CinemasList.css"
import { SkeletonCardList } from "../SkeletonLoader/SkeletonLoader"
import { cinemasService } from "../../services/cinemas.service"
import cinemasAPIService from "../../services/cinemas-api.service"
import apiClient from "../../services/api.service"
import { logError, formatErrorMessage } from "../../utils/errorHandler"
import { Alert, Button, Card } from "../UI"
import { notifySuccess, notifyError } from "../../utils/notifications"
import logger from "../../utils/logger"

const CinemasList = ({ city = null }) => {
    const [cinemas, setCinemas] = useState([])
    const [apiCinemas, setApiCinemas] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingAPI, setIsLoadingAPI] = useState(false)
    const [error, setError] = useState(null)
    const [syncingCinemas, setSyncingCinemas] = useState(new Set())

    useEffect(() => {
        fetchCinemas()
    }, [city])

    const fetchCinemas = async () => {
        try {
            setIsLoading(true)
            setError(null)
            setApiCinemas([]) // Reset API cinemas when fetching local
            
            // SIEMPRE filtrar por ciudad si está seleccionada - no mostrar todos los cines
            if (!city) {
                // Si no hay ciudad seleccionada, no mostrar cines
                setCinemas([])
                setIsLoading(false)
                return
            }
            
            // Filtrar por ciudad
            const response = await cinemasService.getByCity(city)
            const localCinemas = response.data.filter(c => !c.isDeleted)
            setCinemas(localCinemas)
            
            // Si hay ciudad seleccionada y no hay cines locales, buscar desde API
            if (localCinemas.length === 0) {
                await fetchCinemasFromAPI(city)
            }
        } catch (err) {
            logError(err, 'CinemasList')
            setError(formatErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCinemasFromAPI = async (cityToSearch) => {
        try {
            setIsLoadingAPI(true)
            const results = await cinemasAPIService.searchCinemas(cityToSearch)
            setApiCinemas(results)
            if (results.length > 0) {
                notifySuccess(`Se encontraron ${results.length} cines en ${cityToSearch} desde APIs externas`)
            }
        } catch (err) {
            logger.error('Failed to fetch cinemas from API', err, 'CinemasList')
            // No mostrar error si falla la API, solo log
        } finally {
            setIsLoadingAPI(false)
        }
    }

    const handleSyncCinema = async (apiCinema) => {
        if (syncingCinemas.has(apiCinema.placeId)) return

        try {
            setSyncingCinemas(prev => new Set(prev).add(apiCinema.placeId))

            let cinemaData = {
                name: apiCinema.name,
                address: {
                    street: apiCinema.address.street || '',
                    city: apiCinema.address.city || city || '',
                    zipcode: parseInt(apiCinema.address.zipcode) || 0,
                    country: apiCinema.address.country || 'Spain',
                },
                location: apiCinema.location ? {
                    lat: apiCinema.location.lat,
                    lng: apiCinema.location.lng
                } : null,
                cover: [],
                url: apiCinema.website || '',
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
            }

            // If we have a Google Places placeId, get detailed information
            if (apiCinema.placeId && apiCinema.source === 'google_places') {
                try {
                    const detailsResponse = await apiClient.get(`/api/external/cinemas/details/${apiCinema.placeId}`)
                    const details = detailsResponse.data.data
                    
                    // Merge detailed information
                    cinemaData = {
                        ...cinemaData,
                        name: details.name || cinemaData.name,
                        address: {
                            street: details.address.street || cinemaData.address.street,
                            city: details.address.city || cinemaData.address.city,
                            zipcode: parseInt(details.address.zipcode) || cinemaData.address.zipcode,
                            country: details.address.country || cinemaData.address.country,
                        },
                        location: details.location || cinemaData.location,
                        cover: details.cover || cinemaData.cover,
                        url: details.url || cinemaData.url,
                    }
                } catch (error) {
                    logger.warn('Failed to get cinema details, using basic info', error, 'CinemasList')
                }
            }

            // Create cinema in local database
            const response = await cinemasService.create(cinemaData)
            const newCinema = response.data

            notifySuccess(`Cine "${newCinema.name}" agregado correctamente`)
            logger.info('Cinema synced from API', { cinemaId: newCinema.id || newCinema._id, source: apiCinema.source }, 'CinemasList')

            // Remove from API list
            setApiCinemas(prev => prev.filter(c => c.placeId !== apiCinema.placeId))
            
            // Refresh local cinemas list to ensure we have the latest data
            await fetchCinemas()
        } catch (error) {
            logger.error('Failed to sync cinema', error, 'CinemasList')
            notifyError('Error al agregar el cine')
        } finally {
            setSyncingCinemas(prev => {
                const newSet = new Set(prev)
                newSet.delete(apiCinema.placeId)
                return newSet
            })
        }
    }

    if (isLoading) {
        return (
            <div className="CinemaList">
                <SkeletonCardList count={6} />
            </div>
        )
    }

    if (error) {
        return (
            <div className="CinemaList">
                <Alert variant="danger" className="m-5" title="Error al cargar cines">
                    <p>{error}</p>
                    <Button variant="outline" onClick={fetchCinemas} className="mt-3">
                        Reintentar
                    </Button>
                </Alert>
            </div>
        )
    }

    const activeCinemas = cinemas.filter(cinema => !cinema.isDeleted)

    return (
        <div className="CinemaList">
            {/* Cines locales */}
            {activeCinemas.length > 0 && (
                <>
                    <Row>
                        {activeCinemas.map(cinema => {
                            const uniqueKey = cinema.id || cinema._id || `cinema-${cinema.name}`;
                            const cinemaData = {
                                ...cinema,
                                id: cinema.id || cinema._id
                            };
                            return (
                                <Col className="mb-5" md={{ span: 4 }} key={uniqueKey}>
                                    <CinemaCard {...cinemaData} />
                                </Col>
                            );
                        })}
                    </Row>
                </>
            )}

            {/* Cines desde API cuando no hay locales */}
            {city && activeCinemas.length === 0 && (
                <div className="mt-4">
                    {isLoadingAPI ? (
                        <div className="text-center py-5">
                            <SkeletonCardList count={3} />
                            <p className="text-secondary mt-3">Buscando cines en {city}...</p>
                        </div>
                    ) : apiCinemas.length > 0 ? (
                        <>
                            <Alert variant="info" className="mb-4" title="Cines encontrados desde APIs externas">
                                <p className="text-primary">
                                    Se encontraron {apiCinemas.length} cines en {city}. 
                                    Puedes agregarlos a la base de datos haciendo clic en "Agregar Cine".
                                </p>
                            </Alert>
                            <Row>
                                {apiCinemas.map((apiCinema, index) => {
                                    const isSyncing = syncingCinemas.has(apiCinema.placeId)
                                    return (
                                        <Col className="mb-4" md={{ span: 4 }} key={apiCinema.placeId || index}>
                                            <Card variant="elevated" className="h-100">
                                                {apiCinema.photoUrl && (
                                                    <div style={{ height: '150px', overflow: 'hidden' }}>
                                                        <img 
                                                            src={apiCinema.photoUrl} 
                                                            alt={apiCinema.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                )}
                                                <Card.Body>
                                                    <Card.Title>{apiCinema.name}</Card.Title>
                                                    <Card.Text className="text-secondary small">
                                                        📍 {apiCinema.address.street}, {apiCinema.address.city}
                                                        {apiCinema.address.zipcode && ` ${apiCinema.address.zipcode}`}
                                                    </Card.Text>
                                                    {apiCinema.rating > 0 && (
                                                        <Card.Text className="text-secondary small">
                                                            ⭐ {apiCinema.rating.toFixed(1)}/5
                                                            {apiCinema.ratingCount > 0 && (
                                                                <span className="ms-2">({apiCinema.ratingCount} valoraciones)</span>
                                                            )}
                                                        </Card.Text>
                                                    )}
                                                    <div className="mt-3">
                                                        <Button
                                                            variant="accent"
                                                            size="sm"
                                                            onClick={() => handleSyncCinema(apiCinema)}
                                                            disabled={isSyncing}
                                                            className="w-100"
                                                        >
                                                            {isSyncing ? 'Agregando...' : '➕ Agregar Cine'}
                                                        </Button>
                                                    </div>
                                                    <small className="text-muted d-block mt-2">
                                                        Fuente: {
                                                            apiCinema.source === 'google_places' ? 'Google Places' :
                                                            apiCinema.source === 'foursquare' ? 'Foursquare' :
                                                            'OpenStreetMap'
                                                        }
                                                    </small>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    )
                                })}
                            </Row>
                        </>
                    ) : (
                        <Alert variant="info" className="m-5">
                            {city 
                                ? `No se encontraron cines disponibles en ${city} ni en las APIs externas.`
                                : 'No se encontraron cines disponibles.'
                            }
                        </Alert>
                    )}
                </div>
            )}

            {/* Mensaje cuando no hay ciudad seleccionada */}
            {!city && (
                <Alert variant="info" className="m-5">
                    Por favor, selecciona una ciudad para ver los cines disponibles.
                </Alert>
            )}
            
            {/* Mensaje cuando hay ciudad pero no hay cines */}
            {city && activeCinemas.length === 0 && !isLoading && !isLoadingAPI && apiCinemas.length === 0 && (
                <Alert variant="info" className="m-5">
                    No se encontraron cines disponibles en {city}.
                </Alert>
            )}
        </div>
    )
}

export default CinemasList