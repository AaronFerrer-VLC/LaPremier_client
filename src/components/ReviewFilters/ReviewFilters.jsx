import { useState, useMemo, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { Badge, Button } from '../UI';
import { FaFilter, FaTimes } from 'react-icons/fa';
import './ReviewFilters.css';

const ReviewFilters = ({ reviews, onFilteredReviewsChange }) => {
  const [filterRating, setFilterRating] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filtrar por rating
    if (filterRating !== null) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id);
        case 'oldest':
          return new Date(a.createdAt || a.id) - new Date(b.createdAt || b.id);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, filterRating, sortBy]);

  // Notificar cambios - usar useEffect en lugar de useMemo para evitar warning
  useEffect(() => {
    if (onFilteredReviewsChange) {
      onFilteredReviewsChange(filteredAndSortedReviews);
    }
  }, [filteredAndSortedReviews, onFilteredReviewsChange]);

  const clearFilters = () => {
    setFilterRating(null);
    setSortBy('newest');
  };

  const hasActiveFilters = filterRating !== null || sortBy !== 'newest';

  // Estadísticas de reseñas
  const ratingStats = useMemo(() => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        stats[review.rating]++;
      }
    });
    return stats;
  }, [reviews]);

  return (
    <div className="ReviewFilters">
      <div className="filters-header">
        <h4 className="filters-title">
          <FaFilter className="me-2" />
          Filtros de Reseñas
        </h4>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <FaTimes className="me-2" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="filters-content">
        {/* Filtro por rating */}
        <div className="filter-group">
          <Form.Label><strong>Filtrar por calificación:</strong></Form.Label>
          <div className="rating-filters">
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                className={`rating-filter-btn ${filterRating === rating ? 'active' : ''}`}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                type="button"
              >
                <span className="rating-stars">{'★'.repeat(rating)}</span>
                <span className="rating-count">({ratingStats[rating]})</span>
              </button>
            ))}
            <button
              className={`rating-filter-btn ${filterRating === null ? 'active' : ''}`}
              onClick={() => setFilterRating(null)}
              type="button"
            >
              Todas ({reviews.length})
            </button>
          </div>
        </div>

        {/* Ordenar */}
        <div className="filter-group">
          <Form.Label><strong>Ordenar por:</strong></Form.Label>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            size="sm"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="highest">Mayor calificación</option>
            <option value="lowest">Menor calificación</option>
          </Form.Select>
        </div>
      </div>
    </div>
  );
};

export default ReviewFilters;

