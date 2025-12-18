/**
 * Skeleton Loader Components
 * Reusable skeleton loaders for different content types
 */

import { Card, Row, Col } from 'react-bootstrap';
import './SkeletonLoader.css';

/**
 * Skeleton for movie/cinema card
 */
export const SkeletonCard = () => (
  <Card className="skeleton-card">
    <div className="skeleton-image" />
    <Card.Body>
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-text" />
      <div className="skeleton-line skeleton-text-short" />
    </Card.Body>
  </Card>
);

/**
 * Skeleton for list of cards
 */
export const SkeletonCardList = ({ count = 4 }) => (
  <Row>
    {Array.from({ length: count }).map((_, index) => (
      <Col key={index} md={3} className="mb-4">
        <SkeletonCard />
      </Col>
    ))}
  </Row>
);

/**
 * Skeleton for details page
 */
export const SkeletonDetails = () => (
  <div className="skeleton-details">
    <div className="skeleton-line skeleton-title-large mb-3" />
    <Row>
      <Col md={6}>
        <div className="skeleton-image-large mb-3" />
      </Col>
      <Col md={6}>
        <div className="skeleton-line mb-2" />
        <div className="skeleton-line mb-2" />
        <div className="skeleton-line mb-2" />
        <div className="skeleton-line skeleton-text-short" />
      </Col>
    </Row>
  </div>
);

/**
 * Skeleton for form
 */
export const SkeletonForm = () => (
  <div className="skeleton-form">
    <div className="skeleton-line skeleton-title mb-4" />
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="mb-3">
        <div className="skeleton-line skeleton-label mb-2" />
        <div className="skeleton-input" />
      </div>
    ))}
    <div className="skeleton-button" />
  </div>
);

export default SkeletonCard;

