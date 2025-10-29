import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import '../styles/components/ArtworkCard.css';

export default function ArtworkCard({ artwork }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addOrder } = useOrders();
  const { isLoggedIn, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist(artwork.id)) {
      removeFromWishlist(artwork.id);
    } else {
      addToWishlist(artwork);
    }
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }

    if (role !== 'Collector') {
      alert('Only collectors can purchase artworks');
      return;
    }

    setLoading(true);
    try {
      addOrder(artwork);
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="art-gallery-card">
      <div className="card-image-container">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="card-image"
          onError={(e) => {
            e.target.src = '/placeholder-artwork.png';
          }}
        />
        <button
          onClick={handleAddToWishlist}
          className={`wishlist-btn ${isInWishlist(artwork.id) ? 'active' : ''}`}
          title={isInWishlist(artwork.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isInWishlist(artwork.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div className="category-tag">{artwork.category}</div>
      </div>
      <div className="card-content">
        <Link to={`/artwork/${artwork.id}`}>
          <h3 className="card-title">{artwork.title}</h3>
        </Link>
        <p className="card-description">{artwork.description}</p>
        <div className="card-footer">
          <p className="artwork-price">${artwork.price.toLocaleString()}</p>
          <button
            className="buy-button"
            onClick={handleBuy}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Buy'}
          </button>
        </div>
      </div>
    </div>
  );
}
