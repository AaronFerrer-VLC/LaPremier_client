import { Link } from "react-router-dom"
import { Container, Row, Col } from "react-bootstrap"
import { Button } from "../../../components/UI"
import MoviesList from "../../../components/MoviesList/MoviesList"
import MovieSearch from "../../../components/MovieSearch/MovieSearch"
import { useState, useEffect } from "react"
import locationService from "../../../services/location.service"
import logger from "../../../utils/logger"
import { ENV } from "../../../config/env"
import "./MoviesPage.css"


const MoviesPage = () => {
    const [userCity, setUserCity] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Load user city on mount
    useEffect(() => {
        const loadUserCity = async () => {
            try {
                const city = await locationService.getUserCity();
                setUserCity(city);
            } catch (error) {
                logger.error('Failed to load user city', error, 'MoviesPage');
                setUserCity(null);
            }
        };
        loadUserCity();
    }, []);

    const handleSearch = (query) => {
        setSearchQuery(query)
    }
    
    return (
        <div className="MoviesPage">
            <Container className="text-center">
                <Row className="mt-5">
                    <Col>
                        <h3 className="section-title">
                            {searchQuery ? `RESULTADOS DE BÚSQUEDA: "${searchQuery}"` : (userCity ? `PELÍCULAS EN CARTELERA - ${userCity.toUpperCase()}` : 'PELÍCULAS EN CARTELERA')}
                        </h3>
                        <hr className="border-secondary" />
                        
                        {/* Search Bar */}
                        {ENV.HAS_TMDB && (
                            <Row className="mb-4">
                                <Col md={{ span: 8, offset: 2 }}>
                                    <MovieSearch 
                                        onSearch={handleSearch}
                                        placeholder="Buscar películas en TMDB..."
                                    />
                                </Col>
                            </Row>
                        )}
                    </Col>
                </Row>
                <Row>
                    <MoviesList searchQuery={searchQuery} city={userCity} />
                </Row>
                <Button variant="secondary" as={Link} to={'/'} className="mt-4">Volver a la Home</Button>
            </Container>
        </div>
    )
}
export default MoviesPage