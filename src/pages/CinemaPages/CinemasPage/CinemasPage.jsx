import { Link } from "react-router-dom"
import { Container, Row, Col } from 'react-bootstrap'
import { Button } from "../../../components/UI"
import { useState, useEffect } from "react"
import CinemasList from "../../../components/CinemasList/CinemasList"
import CitySelector from "../../../components/CitySelector/CitySelector"
import locationService from "../../../services/location.service"
import logger from "../../../utils/logger"
import "./CinemasPage.css"

const CinemasPage = () => {
    const [userCity, setUserCity] = useState(null)

    // Load user city on mount
    useEffect(() => {
        const loadUserCity = async () => {
            try {
                const city = await locationService.getUserCity();
                setUserCity(city);
            } catch (error) {
                logger.error('Failed to load user city', error, 'CinemasPage');
                setUserCity(null); // No default, show all cinemas
            }
        };
        loadUserCity();
    }, []);

    const handleCityChange = (city) => {
        setUserCity(city);
        locationService.setUserCity(city);
    }

    return (
        <div className="CinemasPage">
            <Container className="text-center">
                <Row className="mt-5 d-flex align-items-center justify-content-between">
                    <Col md="auto">
                        <h3 className="section-title mb-0">
                            {userCity ? `CINES EN ${userCity.toUpperCase()}` : 'ENCUENTRA TU CINE'}
                        </h3>
                    </Col>
                    <Col md="auto">
                        <CitySelector
                            currentCity={userCity}
                            onCityChange={handleCityChange}
                        />
                    </Col>
                </Row>
                <hr className="border-secondary" />
                <Row className="mt-5">
                    <CinemasList city={userCity} />
                </Row>
                <Button variant="secondary" to={'/'} as={Link} className="mt-4">Volver a la Home</Button>
            </Container>
        </div>
    )
}

export default CinemasPage