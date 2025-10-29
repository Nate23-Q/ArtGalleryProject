import React, { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import ArtCard from '../components/ArtworkCard';
import '../styles/pages/Wishlist.css';

const Wishlist = () => {
  const { wishlist } = useContext(WishlistContext);

  return (
    <div className="wishlist-container">
      <h2 className="wishlist-title">My Wishlist</h2>
      {wishlist.length > 0 ? (
        <div className="wishlist-grid">
          {wishlist.map(artwork => (
            <ArtCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      ) : (
        <p className="wishlist-empty-message">Your wishlist is empty.</p>
      )}
    </div>
  );
};

export default Wishlist;