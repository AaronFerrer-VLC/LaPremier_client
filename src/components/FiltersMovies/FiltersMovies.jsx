import React, { useState, useMemo, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Button, Select } from '../UI';
import { moviesService } from '../../services/movies.service';
import { useApi } from '../../hooks/useApi';
import { ENV } from '../../config/env';
import logger from '../../utils/logger';
import "./FiltersMovies.css"

const Filters = ({ handleFilterData }) => {
    const [filters, setFilters] = useState({
        gender: '',
        country: '',
        language: ''
    });
    const [tmdbMovies, setTmdbMovies] = useState([]);

    // Fetch local movies using useApi hook (fallback)
    const { data: localMovies } = useApi(
        () => moviesService.getAll(),
        []
    )

    // Fetch TMDB movies if available
    useEffect(() => {
        const loadTMDBMovies = async () => {
            if (ENV.HAS_TMDB) {
                try {
                    const movies = await moviesService.getAllNowPlayingFromTMDB();
                    setTmdbMovies(movies);
                } catch (error) {
                    logger.error('Failed to load TMDB movies for filters', error, 'FiltersMovies');
                    setTmdbMovies([]);
                }
            }
        };
        loadTMDBMovies();
    }, []);

    // Use TMDB movies if available, otherwise use local movies
    const activeMovies = ENV.HAS_TMDB && tmdbMovies.length > 0 
        ? tmdbMovies 
        : (localMovies?.filter(movie => !movie.isDeleted) || []);
    
    const genders = useMemo(() => {
        const allGenders = activeMovies.flatMap(movie => {
            if (Array.isArray(movie.gender)) {
                return movie.gender;
            }
            return movie.gender ? [movie.gender] : [];
        });
        return [...new Set(allGenders)].filter(Boolean).sort();
    }, [activeMovies])

    const countries = useMemo(() => {
        const allCountries = activeMovies
            .map(movie => movie.country)
            .filter(Boolean);
        return [...new Set(allCountries)].sort();
    }, [activeMovies])

    const languages = useMemo(() => {
        const allLanguages = activeMovies
            .map(movie => {
                // Use displayLanguage if available, otherwise use language
                return movie.displayLanguage || movie.language;
            })
            .filter(Boolean);
        return [...new Set(allLanguages)].sort();
    }, [activeMovies])

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleFilterData(filters);
    };

    const handleResetFilters = () => {
        setFilters({
            gender: '',
            country: '',
            language: ''
        });

        handleFilterData(undefined)
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Row>
                <Col>
                    <Select
                        label="Género"
                        name="gender"
                        value={filters.gender}
                        onChange={handleFilterChange}
                        options={[
                            { value: '', label: 'Selecciona género' },
                            ...genders.map(gender => ({ value: gender, label: gender }))
                        ]}
                    />
                </Col>
                <Col>
                    <Select
                        label="País"
                        name="country"
                        value={filters.country}
                        onChange={handleFilterChange}
                        options={[
                            { value: '', label: 'Selecciona un país' },
                            ...countries.map(country => ({ value: country, label: country }))
                        ]}
                    />
                </Col>
                <Col>
                    <Select
                        label="Idioma"
                        name="language"
                        value={filters.language}
                        onChange={handleFilterChange}
                        options={[
                            { value: '', label: 'Selecciona idioma' },
                            ...languages.map(language => ({ value: language, label: language }))
                        ]}
                    />
                </Col>
            </Row>

            <Button variant="primary" className="me-3" type="submit">
                Aplicar Filtros
            </Button>
            <Button variant="secondary" type="button" onClick={handleResetFilters} >
                Limpiar Filtros
            </Button>
        </Form>
    );
};

export default Filters;

