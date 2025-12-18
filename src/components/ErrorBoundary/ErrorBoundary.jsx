/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import { Component } from 'react';
import { Container } from 'react-bootstrap';
import { Alert, Button } from '../UI';
import logger from '../../utils/logger';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Error caught by boundary', { error, errorInfo }, 'ErrorBoundary');
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Use window.location instead of navigate since ErrorBoundary can be outside Router
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Alert variant="danger" title="¡Oops! Algo salió mal">
            <p>
              Ha ocurrido un error inesperado. Por favor, intenta recargar la
              página.
            </p>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleReset}
              >
                Ir al inicio
              </Button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-3">
                <summary>Detalles del error (solo en desarrollo)</summary>
                <pre className="mt-2 small">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

