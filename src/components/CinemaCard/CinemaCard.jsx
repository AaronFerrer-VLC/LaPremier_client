import { Link } from "react-router-dom"
import PropTypes from "prop-types"
import { Row, Col } from 'react-bootstrap/'
import { FaGlasses, FaClosedCaptioning, FaWheelchair } from 'react-icons/fa'
import { Card } from '../UI'
import LazyImage from '../LazyImage/LazyImage'
import ShareButton from '../ShareButton/ShareButton'
import logger from '../../utils/logger'
import "./CinemaCard.css"

const CinemaCard = ({ id, _id, cover, name, address, specs, ...rest }) => {
    // Use _id if id is not available (MongoDB)
    // Also check if _id is passed directly as a prop
    const cinemaId = id || _id || (rest && rest._id) || null;
    
    // Don't render link if no valid ID
    if (!cinemaId) {
        logger.warn('CinemaCard: No valid ID for cinema', { name, id }, 'CinemaCard');
    }

    const { street, city, zipcode, country } = address || {}
    const { is3D, VO, accesibility } = specs || {}

    const coverAlt = `Imagen del cine ${name}`

    const cardContent = (
        <Card variant="elevated" hover className="h-100">
            <div style={{ height: "15rem", overflow: "hidden" }}>
                <LazyImage
                    src={cover?.[0] || ''}
                    alt={coverAlt}
                    style={{ height: "15rem", objectFit: "cover", width: "100%" }}
                    className="w-100"
                />
            </div>
            <Card.Body style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title style={{ color: '#ffffff' }} className="mb-0">{name}</Card.Title>
                    {cinemaId && (
                        <ShareButton 
                            url={typeof window !== 'undefined' ? `${window.location.origin}/cines/detalles/${cinemaId}` : `/cines/detalles/${cinemaId}`}
                            title={name}
                            type="cinema"
                            size="sm"
                        />
                    )}
                </div>
                <Card.Text style={{ color: '#a0a0a0' }} className="mb-3">
                    📍 {country} | {city} | {street}, {zipcode != null ? String(zipcode) : ''}
                </Card.Text>
                <Row className="justify-content-center mt-3">
                    <Col md={{ span: "auto" }}>
                        <Row className="g-2 justify-content-center align-items-center">
                            {is3D && (
                                <Col xs="auto" className="cinema-icon-container">
                                    <FaGlasses className="cinema-icon" size={28} />
                                    <span className="cinema-icon-label">3D</span>
                                </Col>
                            )}
                            {VO && (
                                <Col xs="auto" className="cinema-icon-container">
                                    <FaClosedCaptioning className="cinema-icon" size={28} />
                                    <span className="cinema-icon-label">VO</span>
                                </Col>
                            )}
                            {accesibility && (
                                <Col xs="auto" className="cinema-icon-container">
                                    <FaWheelchair className="cinema-icon" size={28} />
                                    <span className="cinema-icon-label">Acc.</span>
                                </Col>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );

    return (
        <article className="CinemaCard" aria-label={`Tarjeta de cine: ${name}`}>
            {cinemaId ? (
                <Link 
                    to={`detalles/${cinemaId}`} 
                    style={{ textDecoration: 'none' }}
                    aria-label={`Ver detalles del cine ${name}`}
                >
                    {cardContent}
                </Link>
            ) : (
                <div style={{ textDecoration: 'none', cursor: 'not-allowed', opacity: 0.6 }}>
                    {cardContent}
                </div>
            )}
        </article>
    )
}

CinemaCard.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cover: PropTypes.array,
    name: PropTypes.string.isRequired,
    address: PropTypes.shape({
        street: PropTypes.string,
        city: PropTypes.string,
        zipcode: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Can be number from MongoDB
        country: PropTypes.string,
        _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    specs: PropTypes.shape({
        is3D: PropTypes.bool,
        VO: PropTypes.bool,
        accesibility: PropTypes.bool
    })
}

export default CinemaCard