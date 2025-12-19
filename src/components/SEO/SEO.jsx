/**
 * SEO Component
 * Dynamic SEO metadata management using react-helmet-async
 * Provides meta tags, Open Graph, Twitter Cards, and structured data
 */

import { Helmet } from 'react-helmet-async';

/**
 * SEO component for dynamic meta tags
 * @param {Object} props - SEO configuration
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.keywords - Meta keywords (comma-separated)
 * @param {string} props.image - Open Graph image URL
 * @param {string} props.url - Canonical URL
 * @param {string} props.type - Open Graph type (default: 'website')
 * @param {Object} props.movie - Movie data for structured data (optional)
 * @param {Object} props.cinema - Cinema data for structured data (optional)
 */
const SEO = ({
  title = 'LA PREMIERE - Encuentra tu peli favorita, en tu cine favorito',
  description = 'Descubre las mejores películas y cines. Busca tu película favorita y encuentra el cine perfecto para disfrutarla.',
  keywords = 'cine, películas, cartelera, cines Madrid, estrenos, películas en cines',
  image = 'https://res.cloudinary.com/dhluctrie/image/upload/v1731516947/favicon.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://lapremiere.com/',
  type = 'website',
  movie = null,
  cinema = null,
}) => {
  // Build full title
  const fullTitle = title.includes('LA PREMIERE') ? title : `${title} | LA PREMIERE`;
  
  // Generate structured data (JSON-LD)
  const structuredData = [];
  
  if (movie) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Movie',
      name: movie.title?.spanish || movie.title || '',
      alternateName: movie.title?.original || '',
      image: movie.poster || movie.backdrop || image,
      description: movie.overview || description,
      datePublished: movie.release_date || movie.date || '',
      aggregateRating: movie.vote_average ? {
        '@type': 'AggregateRating',
        ratingValue: movie.vote_average,
        ratingCount: movie.vote_count || 0,
      } : undefined,
      duration: movie.duration ? `PT${movie.duration}M` : undefined,
      genre: movie.gender || [],
      inLanguage: movie.language || 'es',
      ...(movie.vote_average && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: movie.vote_average,
          ratingCount: movie.vote_count || 0,
        },
      }),
    });
  }
  
  if (cinema) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'MovieTheater',
      name: cinema.name || '',
      image: cinema.cover?.[0] || image,
      address: {
        '@type': 'PostalAddress',
        streetAddress: cinema.address?.street || '',
        addressLocality: cinema.address?.city || '',
        postalCode: cinema.address?.zipcode?.toString() || '',
        addressCountry: cinema.address?.country || 'ES',
      },
      ...(cinema.location && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: cinema.location.lat,
          longitude: cinema.location.lng,
        },
      }),
      ...(cinema.url && { url: cinema.url }),
    });
  }
  
  // If no specific structured data, add general website schema
  if (structuredData.length === 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'LA PREMIERE',
      description: description,
      url: 'https://lapremiere.com/',
    });
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="LA PREMIERE" />
      <meta property="og:locale" content="es_ES" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Helmet>
  );
};

export default SEO;

