import React, { useState } from 'react';
import ArtworkCard from '../components/ArtworkCard';
import CategoryFilter from '../components/CategoryFilter';
import { artworks } from '../data/artworks';
import '../styles/components/Gallery.css';

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  const filteredArtworks = selectedCategory === 'All Categories'
    ? artworks
    : artworks.filter(artwork => 
        artwork.category.toLowerCase() === selectedCategory.toLowerCase()
      );

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <div>
          <h1 className="gallery-title">Art Gallery</h1>
          <p className="gallery-description">Discover unique artworks from talented artisans</p>
        </div>
        <CategoryFilter onSelect={setSelectedCategory} />
      </div>

      <div className="art-gallery">
        <div className="grid">
          {filteredArtworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      </div>
    </div>
  );
}
