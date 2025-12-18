import React, { useState, useMemo } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Button, Select } from '../UI';
import { moviesService } from '../../services/movies.service';
import { useApi } from '../../hooks/useApi';
import logger from '../../utils/logger';
import "./FiltersMovies.css"

const Filters = ({ handleFilterData }) => {
    const [filters, setFilters] = useState({
        gender: '',
        country: '',
        language: ''
    });

    // Fetch movies using useApi hook
    const { data: movies } = useApi(
        () => moviesService.getAll(),
        []
    )

    // Extract unique values from movies
    const activeMovies = movies?.filter(movie => !movie.isDeleted) || []
    
    const genders = useMemo(() => {
        return [...new Set(activeMovies.flatMap(movie => movie.gender || []))].filter(Boolean)
    }, [activeMovies])

    const countries = useMemo(() => {
        return [...new Set(activeMovies.map(movie => movie.country).filter(Boolean))]
    }, [activeMovies])

    const languages = useMemo(() => {
        return [...new Set(activeMovies.map(movie => movie.language).filter(Boolean))]
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

