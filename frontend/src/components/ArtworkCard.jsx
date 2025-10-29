import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import '../styles/components/ArtworkCard.css';

export default function ArtworkCard({ artwork }) {
  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await apiRequest('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ artworkId: artwork.id }),
      });

      alert('Added to wishlist!');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Error adding to wishlist');
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
          className="wishlist-btn"
          title="Add to Wishlist"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <button className="buy-button">Buy</button>
        </div>
      </div>
    </div>
  );
}
