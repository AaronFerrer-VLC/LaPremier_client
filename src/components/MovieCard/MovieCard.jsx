import PropTypes from "prop-types"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Accordion } from "react-bootstrap"
import FlagIcon from "../FlagIcon/FlagIcon"
import { Card, Badge } from "../UI"
import LazyImage from "../LazyImage/LazyImage"
import FavoriteButton from "../FavoriteButton/FavoriteButton"
import ShareButton from "../ShareButton/ShareButton"
import StreamingPlatforms from "../StreamingPlatforms/StreamingPlatforms"
import { FaClock, FaFlag, FaLanguage, FaCalendarAlt, FaChevronDown, FaPlay } from "react-icons/fa"
import logger from "../../utils/logger"
import "../MovieCard/MovieCard.css"

const countryNameToCode = {
    "Estados Unidos": "US",
    "United States of America": "US",
    "España": "ES",
    "Spain": "ES",
    "Reino Unido": "GB",
    "United Kingdom": "GB",
    "Canada": "CA",
    "México": "MX",
    "Mexico": "MX",
    "Alemania": "DE",
    "Germany": "DE",
    "Japón": "JP",
    "Japan": "JP",
    "Australia": "AU",
    "Austria": "AT",
    "New Zealand": "NZ",
    "Nueva Zelanda": "NZ",
    "Finland": "FI",
    "Finlandia": "FI",          
    "Francia": "FR",   
    "France": "FR",
    "Polonia": "PL",
    "Poland": "PL",
    "Italia": "IT",
    "Italy": "IT", 
}

const MovieCard = ({ id, tmdbId, movie, title, country, duration, language, calification, poster, date }) => {
    // Support both direct props and movie object
    const movieData = movie || {
        id,
        tmdbId,
        title,
        country,
        duration,
        language,
        calification,
        poster,
        date
    };

    const movieId = movieData.id || movieData.tmdbId;
    const movieTitle = movieData.title?.spanish || movieData.title || 'Película';
    const movieCountry = movieData.country || '';
    const movieDuration = movieData.duration || 0;
    const movieLanguage = movieData.language || '';
    const movieCalification = movieData.calification || '';
    const moviePoster = movieData.poster || '';
    const movieDate = movieData.date || '';

    // Extract year from date
    const getYear = () => {
        if (!movieDate) return null;
        try {
            const dateObj = new Date(movieDate);
            return dateObj.getFullYear();
        } catch {
            return null;
        }
    };

    const year = getYear();
    const countryCode = countryNameToCode[movieCountry] || null;
    const posterAlt = `Poster de ${movieTitle}`;

    // If no local ID, we'll need to sync from TMDB first
    const linkTo = movieId ? `/peliculas/detalles/${movieId}` : '#';

    return (
        <article className="MovieCard" aria-label={`Tarjeta de película: ${movieTitle}`}>
            <Link 
                to={linkTo}
                className="movie-card-link"
                aria-label={`Ver detalles de ${movieTitle}`}
                onClick={(e) => {
                    if (!movieId) {
                        e.preventDefault();
                        logger.warn('MovieCard: No valid ID for movie', { title: movieTitle }, 'MovieCard');
                    }
                }}
            >
                <Card variant="elevated" hover className="movie-card h-100">
                    <div className="movie-poster-container">
                        <LazyImage
                            src={moviePoster}
                            alt={posterAlt}
                            className="movie-poster"
                        />
                        <div className="movie-poster-overlay">
                            {movieCalification && (
                                <div className="movie-calification-badge">
                                    {movieCalification}
                                </div>
                            )}
                            <div className="movie-poster-actions">
                                <div className="movie-favorite-button">
                                    <FavoriteButton movieId={movieId} type="favorite" size="sm" />
                                </div>
                                <div className="movie-share-button">
                                    <ShareButton 
                                        url={typeof window !== 'undefined' ? `${window.location.origin}${linkTo}` : linkTo}
                                        title={movieTitle}
                                        type="movie"
                                        size="sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Card.Body className="movie-card-body">
                        <Card.Title className="movie-title">
                            {movieTitle}
                        </Card.Title>
                        <div className="movie-meta">
                            {year && (
                                <div className="movie-meta-item">
                                    <FaCalendarAlt className="meta-icon" />
                                    <span>{year}</span>
                                </div>
                            )}
                            {movieDuration > 0 && (
                                <div className="movie-meta-item">
                                    <FaClock className="meta-icon" />
                                    <span>{movieDuration} min</span>
                                </div>
                            )}
                        </div>
                        <div className="movie-info">
                            {movieCountry && (
                                <div className="movie-info-item">
                                    <FaFlag className="info-icon" />
                                    {countryCode ? (
                                        <>
                                            <FlagIcon countryCode={countryCode} size="small" />
                                            <span className="info-text">{movieCountry}</span>
                                        </>
                                    ) : (
                                        <span className="info-text">{movieCountry}</span>
                                    )}
                                </div>
                            )}
                            {movieLanguage && (
                                <div className="movie-info-item">
                                    <FaLanguage className="info-icon" />
                                    <Badge variant="medium" className="language-badge">
                                        {movieLanguage.toUpperCase()}
                                    </Badge>
                                </div>
                            )}
                        </div>
                        {movieData.watchProviders && (
                            <div className="movie-streaming-platforms">
                                <Accordion defaultActiveKey="" className="streaming-accordion">
                                    <Accordion.Item eventKey="streaming" className="border-0">
                                        <Accordion.Header className="streaming-accordion-header">
                                            <span className="streaming-toggle-text">
                                                <FaPlay className="me-2" />
                                                Ver en streaming
                                                <span className="ms-2">
                                                    <FaChevronDown className="accordion-icon" />
                                                </span>
                                            </span>
                                        </Accordion.Header>
                                        <Accordion.Body className="streaming-accordion-body">
                                            <StreamingPlatforms 
                                                watchProviders={movieData.watchProviders} 
                                                showLabel={false}
                                                movieTitle={movieTitle}
                                            />
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Link>
        </article>
    )
}

MovieCard.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tmdbId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    movie: PropTypes.object,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            original: PropTypes.string,
            spanish: PropTypes.string
        })
    ]),
    country: PropTypes.string,
    duration: PropTypes.number,
    language: PropTypes.string,
    calification: PropTypes.string,
    poster: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
}

export default MovieCard
