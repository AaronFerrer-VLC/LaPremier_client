import { useMemo } from 'react';
import { Badge, Button } from '../UI';
import { FaPlay, FaExternalLinkAlt } from 'react-icons/fa';
import './StreamingPlatforms.css';

// Mapeo de nombres de plataformas a sus URLs y colores
const platformConfig = {
  'Netflix': { 
    color: '#E50914', 
    name: 'Netflix',
    baseUrl: 'https://www.netflix.com/search?q='
  },
  'Disney Plus': { 
    color: '#113CCF', 
    name: 'Disney+',
    baseUrl: 'https://www.disneyplus.com/search?q='
  },
  'HBO Max': { 
    color: '#000000', 
    name: 'HBO Max',
    baseUrl: 'https://www.hbomax.com/search?q='
  },
  'Amazon Prime Video': { 
    color: '#00A8E1', 
    name: 'Prime Video',
    baseUrl: 'https://www.primevideo.com/search/ref=atv_sr_sug_1?phrase='
  },
  'Apple TV Plus': { 
    color: '#000000', 
    name: 'Apple TV+',
    baseUrl: 'https://tv.apple.com/search?term='
  },
  'Movistar Plus': { 
    color: '#00B2E3', 
    name: 'Movistar+',
    baseUrl: 'https://www.movistarplus.es/buscador?q='
  },
  'Filmin': { 
    color: '#FF6B00', 
    name: 'Filmin',
    baseUrl: 'https://www.filmin.es/buscar?q='
  },
  'Rakuten TV': { 
    color: '#BF0000', 
    name: 'Rakuten TV',
    baseUrl: 'https://rakuten.tv/es/search?q='
  },
  'SkyShowtime': { 
    color: '#0070F3', 
    name: 'SkyShowtime',
    baseUrl: 'https://www.skyshowtime.com/search?q='
  },
  'Paramount Plus': { 
    color: '#0074C4', 
    name: 'Paramount+',
    baseUrl: 'https://www.paramountplus.com/search/?q='
  },
  'Crunchyroll': { 
    color: '#F47521', 
    name: 'Crunchyroll',
    baseUrl: 'https://www.crunchyroll.com/search?q='
  },
  'Google Play Movies': {
    color: '#4285F4',
    name: 'Google Play',
    baseUrl: 'https://play.google.com/store/search?q='
  },
  'Amazon Video': {
    color: '#FF9900',
    name: 'Amazon Video',
    baseUrl: 'https://www.amazon.es/s?k='
  },
  'YouTube': {
    color: '#FF0000',
    name: 'YouTube',
    baseUrl: 'https://www.youtube.com/results?search_query='
  },
};

const StreamingPlatforms = ({ watchProviders, region = 'ES', showLabel = true, movieTitle = null, compact = false }) => {
  const providers = useMemo(() => {
    if (!watchProviders || !watchProviders[region]) return null;
    
    const regionProviders = watchProviders[region];
    const flatrate = regionProviders.flatrate || [];
    const rent = regionProviders.rent || [];
    const buy = regionProviders.buy || [];
    
    return {
      flatrate: flatrate.slice(0, 6), // Max 6 platforms
      rent: rent.slice(0, 3),
      buy: buy.slice(0, 3),
    };
  }, [watchProviders, region]);

  if (!providers || (!providers.flatrate?.length && !providers.rent?.length && !providers.buy?.length)) {
    return null;
  }

  const getPlatformUrl = (providerName, movieTitle) => {
    const config = platformConfig[providerName];
    if (!config || !config.baseUrl) return null;
    
    // Encode movie title for URL
    const encodedTitle = encodeURIComponent(movieTitle || '');
    return `${config.baseUrl}${encodedTitle}`;
  };

  const handlePlatformClick = (provider, type) => {
    const url = getPlatformUrl(provider.provider_name, movieTitle);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderProvider = (provider, type) => {
    const config = platformConfig[provider.provider_name] || { 
      color: '#666', 
      name: provider.provider_name,
      baseUrl: null
    };
    
    const hasUrl = !!getPlatformUrl(provider.provider_name, movieTitle);
    
    const ProviderComponent = hasUrl ? Button : Badge;
    const componentProps = hasUrl ? {
      variant: 'accent',
      size: 'sm',
      onClick: () => handlePlatformClick(provider, type),
      className: 'streaming-platform-button',
      style: {
        backgroundColor: config.color,
        color: '#fff',
        border: 'none',
        marginRight: '0.5rem',
        marginBottom: '0.5rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.5rem 0.75rem',
        cursor: 'pointer',
      }
    } : {
      variant: 'medium',
      className: 'streaming-badge',
      style: { 
        backgroundColor: config.color,
        color: '#fff',
        marginRight: '0.5rem',
        marginBottom: '0.5rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.5rem 0.75rem',
      },
      title: `Disponible en ${config.name}`
    };
    
    return (
      <ProviderComponent
        key={provider.provider_id}
        {...componentProps}
      >
        <FaPlay size={12} />
        {config.name}
        {hasUrl && <FaExternalLinkAlt size={10} className="ms-1" />}
      </ProviderComponent>
    );
  };

  return (
    <div className="StreamingPlatforms">
      {showLabel && (
        <h5 className="streaming-title">
          <FaPlay className="me-2" />
          Dónde ver
        </h5>
      )}
      
      {providers.flatrate?.length > 0 && (
        <div className="streaming-section">
          {showLabel && <span className="streaming-label">Suscripción:</span>}
          <div className="streaming-list">
            {providers.flatrate.map(provider => renderProvider(provider, 'flatrate'))}
          </div>
        </div>
      )}
      
      {providers.rent?.length > 0 && (
        <div className="streaming-section">
          {showLabel && <span className="streaming-label">Alquiler:</span>}
          <div className="streaming-list">
            {providers.rent.map(provider => renderProvider(provider, 'rent'))}
          </div>
        </div>
      )}
      
      {providers.buy?.length > 0 && (
        <div className="streaming-section">
          {showLabel && <span className="streaming-label">Compra:</span>}
          <div className="streaming-list">
            {providers.buy.map(provider => renderProvider(provider, 'buy'))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingPlatforms;
