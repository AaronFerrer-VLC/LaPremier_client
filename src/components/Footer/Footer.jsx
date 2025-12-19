import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from '../UI';

import "./Footer.css"

const Footer = ({ currentFamilyPath }) => {

        if (currentFamilyPath) {
            return (
                <footer id="footer" className="Footer text-center text-primary p-5 mt-5" role="contentinfo">
                    <Row>
                        <h2 className="text-primary">LA PREMIERE</h2>
                    </Row>
                    <Row>
                        <p className="text-primary">Copyright © 2024 La Premiere | Built by Aaron & Lucas.</p>
                    </Row>
                    <Row>
                        <Col md={{ span: 4 }}>
                            <Button variant="ghost" as={Link} to="/aviso-legal" className="text-primary">Aviso Legal</Button>
                        </Col>
                        <Col md={{ span: 4 }}>
                            <Button variant="ghost" as={Link} to="/politica-privacidad" className="text-primary">Política de Privacidad</Button>
                        </Col>
                        <Col md={{ span: 4 }}>
                            <Button variant="ghost" as={Link} to="/politica-cookies" className="text-primary">Política de Cookies</Button>
                        </Col>
                    </Row>

                </footer>
            )
        }
}

export default Footer