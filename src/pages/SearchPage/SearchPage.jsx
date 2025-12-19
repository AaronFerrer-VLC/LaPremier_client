import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import AdvancedSearch from '../../components/AdvancedSearch/AdvancedSearch';
import { Button } from '../../components/UI';
import './SearchPage.css';

const SearchPage = () => {
  return (
    <div className="SearchPage">
      <Container>
        <Row className="mt-4 mb-3">
          <Col>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                as={Link} 
                to="/"
                className="back-home-btn"
                aria-label="Volver a la página de inicio"
              >
                <FaHome className="me-2" />
                Volver a la Home
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.history.back()}
                className="back-btn"
                aria-label="Volver a la página anterior"
              >
                <FaArrowLeft className="me-2" />
                Volver
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
      <AdvancedSearch />
    </div>
  );
};

export default SearchPage;

