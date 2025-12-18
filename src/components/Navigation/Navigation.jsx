import "./Navigation.css"

import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';

import CinemasGlobalFilter from '../CinemasGlobalFilter/CinemasGlobalFilter';
import MoviesGlobalFilter from '../MoviesGlobalFilter/MoviesGlobalFilter';
import ThemeToggle from '../UI/ThemeToggle/ThemeToggle';

import { Link } from 'react-router-dom';
import { useContext } from "react";
import { AuthContext } from "../../contexts/auth.context";

const Navigation = ({ currentFamilyPath, setShowModal }) => {

    const { loggedUser, isAuthenticated, logout } = useContext(AuthContext)

    if (currentFamilyPath) {

        return (
            <nav className="Navigation" role="navigation" aria-label="Navegación principal">
                <Navbar sticky="top" collapseOnSelect expand="lg">
                    <Container>
                        <Navbar.Brand 
                            to="/" 
                            as={Link} 
                            className="logo text-primary"
                            aria-label="Ir a la página de inicio - LA PREMIERE"
                        >
                            LA PREMIERE
                        </Navbar.Brand>

                        <Navbar.Toggle 
                            aria-controls="responsive-navbar-nav" 
                            aria-label="Alternar menú de navegación"
                            aria-expanded="false"
                        />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="me-auto" role="navigation" aria-label="Búsqueda">
                                {
                                    currentFamilyPath === 'cines' ?
                                        <CinemasGlobalFilter currentFamilyPath={currentFamilyPath} />
                                        : currentFamilyPath === 'peliculas' ?
                                            <MoviesGlobalFilter currentFamilyPath={currentFamilyPath} />
                                            :
                                            null
                                }
                            </Nav>
                            <Nav className="ms-auto d-flex align-items-center gap-2" role="navigation" aria-label="Enlaces principales">

                                <Nav.Link 
                                    to="/cines" 
                                    className="text-primary" 
                                    as={Link}
                                    aria-label="Ver todos los cines"
                                >
                                    <span>Cines</span>
                                </Nav.Link>
                                <Nav.Link 
                                    to="/peliculas" 
                                    className="text-primary" 
                                    as={Link}
                                    aria-label="Ver todas las películas"
                                >
                                    <span>Películas</span>
                                </Nav.Link>
                                <Nav.Link 
                                    to="/buscar" 
                                    className="text-primary" 
                                    as={Link}
                                    aria-label="Búsqueda avanzada"
                                >
                                    <span>Buscar</span>
                                </Nav.Link>
                                <Nav.Link 
                                    to="/favoritos" 
                                    className="text-primary" 
                                    as={Link}
                                    aria-label="Mis favoritos"
                                >
                                    <span>Favoritos</span>
                                </Nav.Link>
                                <Nav.Link 
                                    to="/comparar" 
                                    className="text-primary" 
                                    as={Link}
                                    aria-label="Comparar películas"
                                >
                                    <span>Comparar</span>
                                </Nav.Link>
                                <Nav.Link 
                                    to="/calendario" 
                                    className="text-primary" 
                                    as={Link}
                                    aria-label="Calendario de estrenos"
                                >
                                    <span>Calendario</span>
                                </Nav.Link>
                                
                                {/* Theme Toggle */}
                                <ThemeToggle />

                                {
                                    !isAuthenticated &&

                                    <Nav.Link 
                                        as="button" 
                                        onClick={() => setShowModal(true)} 
                                        className="text-primary me-auto fw-bold"
                                        aria-label="Iniciar sesión"
                                        type="button"
                                    >
                                        Iniciar sesión
                                    </Nav.Link>
                                }

                                {
                                    isAuthenticated &&

                                    <NavDropdown 
                                        title="Administrar" 
                                        id="collapsible-nav-dropdown"
                                        aria-label="Menú de administración"
                                    >

                                        <NavDropdown.Item 
                                            to="/cines/crear" 
                                            as={Link}
                                            aria-label="Añadir nuevo cine"
                                        >
                                            Añadir nuevo cine
                                        </NavDropdown.Item>
                                        <NavDropdown.Item 
                                            to="/cines/sincronizar" 
                                            as={Link}
                                            aria-label="Sincronizar cines desde API"
                                        >
                                            Sincronizar cines (API)
                                        </NavDropdown.Item>
                                        <NavDropdown.Item 
                                            to="/peliculas/crear" 
                                            as={Link}
                                            aria-label="Añadir nueva película"
                                        >
                                            Añadir nueva película
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item 
                                            to="/cines/eliminados" 
                                            as={Link}
                                            aria-label="Recuperar cines eliminados"
                                        >
                                            Recuperar Cine
                                        </NavDropdown.Item>
                                        <NavDropdown.Item 
                                            to="/peliculas/eliminados" 
                                            as={Link}
                                            aria-label="Recuperar películas eliminadas"
                                        >
                                            Recuperar Película
                                        </NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item 
                                            to="/datos" 
                                            as={Link}
                                            aria-label="Ver estadísticas"
                                        >
                                            Estadísticas
                                        </NavDropdown.Item>
                                        <NavDropdown.Item 
                                            className="delete-button" 
                                            as="button" 
                                            onClick={logout}
                                            aria-label="Cerrar sesión"
                                            type="button"
                                        >
                                            Cerrar sesión
                                        </NavDropdown.Item>

                                    </NavDropdown>
                                }


                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </nav>
        )
    }
}

export default Navigation