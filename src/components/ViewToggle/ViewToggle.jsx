import { useState, useEffect } from 'react';
import { FaTh, FaList } from 'react-icons/fa';
import { Button } from '../UI';
import { safeGetItem, safeSetItem } from '../../utils/storage';
import './ViewToggle.css';

const ViewToggle = ({ onViewChange, defaultView = 'grid' }) => {
  const [view, setView] = useState(() => {
    return safeGetItem('view_preference', defaultView);
  });

  useEffect(() => {
    safeSetItem('view_preference', view);
    if (onViewChange) {
      onViewChange(view);
    }
  }, [view, onViewChange]);

  return (
    <div className="ViewToggle">
      <Button
        variant={view === 'grid' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setView('grid')}
        aria-label="Vista de cuadrícula"
        title="Vista de cuadrícula"
      >
        <FaTh />
      </Button>
      <Button
        variant={view === 'list' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setView('list')}
        aria-label="Vista de lista"
        title="Vista de lista"
      >
        <FaList />
      </Button>
    </div>
  );
};

export default ViewToggle;

