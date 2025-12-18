import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import FlagIcon from '../FlagIcon/FlagIcon';
import { Badge, Card } from '../UI';
import LazyImage from '../LazyImage/LazyImage';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import ShareButton from '../ShareButton/ShareButton';
import { FaClock, FaFlag, FaLanguage, FaCalendarAlt } from 'react-icons/fa';
import './MovieListItem.css';

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
};

const MovieListItem = ({ id, tmdbId, movie, title, country, duration, language, calification, poster, date }) => {
    const movieData = movie || {
        id, tmdbId, title, country, duration, language, calification, poster, date
    };

    const movieId = movieData.id || movieData.tmdbId;
    const movieTitle = movieData.title?.spanish || movieData.title || 'Película';
    const movieCountry = movieData.country || '';
    const movieDuration = movieData.duration || 0;
    const movieLanguage = movieData.language || '';
    const movieCalification = movieData.calification || '';
    const moviePoster = movieData.poster || '';
    const movieDate = movieData.date || '';

    const getYear = () => {
        if (!movieDate) return null;
        try {
            return new Date(movieDate).getFullYear();
        } catch {
            return null;
        }
    };

    const year = getYear();
    const countryCode = countryNameToCode[movieCountry] || null;
    const linkTo = movieId ? `/peliculas/detalles/${movieId}` : '#';

    return (
        <Card className="MovieListItem">
            <Link to={linkTo} className="movie-list-item-link">
                <div className="movie-list-content">
                    <div className="movie-list-poster">
                        <LazyImage
                            src={moviePoster}
                            alt={movieTitle}
                            className="movie-list-poster-img"
                        />
                        {movieCalification && (
                            <div className="movie-list-calification">
                                {movieCalification}
                            </div>
                        )}
                    </div>
                    <div className="movie-list-info">
                        <h3 className="movie-list-title">{movieTitle}</h3>
                        <div className="movie-list-meta">
                            {year && (
                                <span className="meta-item">
                                    <FaCalendarAlt className="meta-icon" />
                                    {year}
                                </span>
                            )}
                            {movieDuration > 0 && (
                                <span className="meta-item">
                                    <FaClock className="meta-icon" />
                                    {movieDuration} min
                                </span>
                            )}
                            {movieLanguage && (
                                <span className="meta-item">
                                    <FaLanguage className="meta-icon" />
                                    <Badge variant="medium">{movieLanguage.toUpperCase()}</Badge>
                                </span>
                            )}
                        </div>
                        {movieCountry && (
                            <div className="movie-list-country">
                                <FaFlag className="info-icon" />
                                {countryCode && <FlagIcon countryCode={countryCode} size="small" />}
                                <span>{movieCountry}</span>
                            </div>
                        )}
                    </div>
                    <div className="movie-list-actions">
                        <FavoriteButton movieId={movieId} type="favorite" size="sm" />
                        <ShareButton 
                            url={typeof window !== 'undefined' ? `${window.location.origin}${linkTo}` : linkTo}
                            title={movieTitle}
                            type="movie"
                        />
                    </div>
                </div>
            </Link>
        </Card>
    );
};

MovieListItem.propTypes = {
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
};

export default MovieListItem;

