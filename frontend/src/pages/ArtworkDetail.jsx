import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArtwork();
  }, [id]);

  const fetchArtwork = async () => {
    try {
      const response = await fetch(`/api/artwork/${id}`);
      if (response.ok) {
        const data = await response.json();
        setArtwork(data);
      } else {
        setError('Artwork not found');
      }
    } catch (err) {
      setError('Error loading artwork');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artworkId: id }),
      });

      if (response.ok) {
        alert('Added to cart!');
        navigate('/cart');
      } else {
        alert('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artworkId: id }),
      });

      if (response.ok) {
        alert('Added to wishlist!');
      } else {
        alert('Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Error adding to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="artwork-detail-page">
        <div className="loading">Loading artwork...</div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="artwork-detail-page">
        <div className="error">{error || 'Artwork not found'}</div>
      </div>
    );
  }

  return (
    <div className="artwork-detail-page">
      <div className="artwork-detail-container">
        <div className="artwork-detail-image">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            onError={(e) => {
              e.target.src = '/placeholder-artwork.png';
            }}
          />
        </div>

        <div className="artwork-detail-info">
          <h1 className="artwork-detail-title">{artwork.title}</h1>
          <p className="artwork-detail-artist">by {artwork.artist}</p>
          <p className="artwork-detail-category">{artwork.category}</p>
          <p className="artwork-detail-description">{artwork.description}</p>
          <p className="artwork-detail-price">${artwork.price}</p>

          <div className="artwork-detail-actions">
            {role === 'Collector' && (
              <>
                <button onClick={handleAddToCart} className="btn-primary">
                  Add to Cart
                </button>
                <button onClick={handleAddToWishlist} className="btn-secondary">
                  Add to Wishlist
                </button>
              </>
            )}
            {role === 'Artist' && artwork.artistId === user?.id && (
              <button onClick={() => navigate(`/edit-artwork/${id}`)} className="btn-secondary">
                Edit Artwork
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
