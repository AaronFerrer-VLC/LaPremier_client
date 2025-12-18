import { useState } from 'react';
import { FaShare, FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaCopy } from 'react-icons/fa';
import { Button } from '../UI';
import { notifySuccess, notifyError } from '../../utils/notifications';
import './ShareButton.css';

const ShareButton = ({ url, title, type = 'movie', size = 'sm' }) => {
  const [showMenu, setShowMenu] = useState(false);

  const shareData = {
    url: url || (typeof window !== 'undefined' ? window.location.href : ''),
    title: title || 'LA PREMIERE',
    text: type === 'movie' 
      ? `Mira esta película: ${title}` 
      : `Mira este cine: ${title}`
  };

  const handleShare = async (platform) => {
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedTitle = encodeURIComponent(shareData.title);
    const encodedText = encodeURIComponent(shareData.text);

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareData.url);
          notifySuccess('Enlace copiado al portapapeles');
          setShowMenu(false);
          return;
        } catch (err) {
          notifyError('Error al copiar el enlace');
          return;
        }
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowMenu(false);
    }
  };

  // Usar Web Share API si está disponible (móviles principalmente)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
        setShowMenu(false);
      } catch (err) {
        // Usuario canceló o hubo error
        if (err.name !== 'AbortError') {
          notifyError('Error al compartir');
        }
      }
    } else {
      // Fallback: mostrar menú
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className="ShareButton position-relative">
      <Button
        variant="outline"
        size={size}
        onClick={handleNativeShare}
        aria-label="Compartir"
        title="Compartir"
      >
        <FaShare />
      </Button>

      {showMenu && (
        <>
          <div 
            className="share-backdrop" 
            onClick={() => setShowMenu(false)}
          />
          <div className="share-menu">
            <button
              className="share-menu-item"
              onClick={() => handleShare('facebook')}
              aria-label="Compartir en Facebook"
            >
              <FaFacebook className="share-icon facebook" />
              <span>Facebook</span>
            </button>
            <button
              className="share-menu-item"
              onClick={() => handleShare('twitter')}
              aria-label="Compartir en Twitter"
            >
              <FaTwitter className="share-icon twitter" />
              <span>Twitter</span>
            </button>
            <button
              className="share-menu-item"
              onClick={() => handleShare('whatsapp')}
              aria-label="Compartir en WhatsApp"
            >
              <FaWhatsapp className="share-icon whatsapp" />
              <span>WhatsApp</span>
            </button>
            <button
              className="share-menu-item"
              onClick={() => handleShare('copy')}
              aria-label="Copiar enlace"
            >
              <FaCopy className="share-icon" />
              <span>Copiar enlace</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShareButton;

