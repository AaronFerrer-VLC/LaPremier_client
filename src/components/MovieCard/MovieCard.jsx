import PropTypes from "prop-types"
import { memo } from "react"
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
import { getCountryCode } from "../../utils/countryCodes"
import "../MovieCard/MovieCard.css"

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

    // Determine movieId and effectiveTmdbId
    // If movieData has both id and tmdbId, prefer id for movieId and keep tmdbId separate
    // If only tmdbId exists, use it for both
    const movieId = movieData.id || movieData._id || movieData.tmdbId;
    const effectiveTmdbId = movieData.tmdbId || tmdbId || (movieData.id && /^\d+$/.test(movieData.id.toString()) ? Number(movieData.id) : null);
    
    const movieTitle = movieData.title?.spanish || movieData.title || 'Película';
    const movieCountry = movieData.country || '';
    const movieDuration = movieData.duration || 0;
    // Use displayLanguage if available (ES, V.O., or ES + V.O.), otherwise use language
    const movieLanguage = movieData.displayLanguage || movieData.language || '';
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
    // Use countryCode from movieData if available (from TMDB), otherwise try to get it from country name
    const countryCode = movieData.countryCode || getCountryCode(movieCountry);
    const posterAlt = `Poster de ${movieTitle}`;

    // If no local ID, we'll need to sync from TMDB first
    const linkTo = movieId ? `/peliculas/detalles/${movieId}` : '#';

    return (
        <article className="MovieCard" aria-label={`Tarjeta de película: ${movieTitle}`}>
            <Card variant="elevated" hover className="movie-card h-100">
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
                                    <FavoriteButton 
                                        movieId={movieId} 
                                        tmdbId={effectiveTmdbId}
                                        type="favorite" 
                                        size="sm" 
                                    />
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
                            {movieCountry && movieCountry !== 'Desconocido' && (
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
                    </Card.Body>
                </Link>
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
            </Card>
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

// Memoize component to prevent unnecessary re-renders
export default memo(MovieCard, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  const prevId = prevProps.id || prevProps.tmdbId || prevProps.movie?.id || prevProps.movie?.tmdbId;
  const nextId = nextProps.id || nextProps.tmdbId || nextProps.movie?.id || nextProps.movie?.tmdbId;
  
  // If IDs are different, re-render
  if (prevId !== nextId) return false;
  
  // Compare other important props
  const prevTitle = prevProps.title?.spanish || prevProps.title || prevProps.movie?.title?.spanish || prevProps.movie?.title;
  const nextTitle = nextProps.title?.spanish || nextProps.title || nextProps.movie?.title?.spanish || nextProps.movie?.title;
  
  if (prevTitle !== nextTitle) return false;
  if (prevProps.poster !== nextProps.poster && prevProps.movie?.poster !== nextProps.movie?.poster) return false;
  
  // If all important props are the same, skip re-render
  return true;
});
