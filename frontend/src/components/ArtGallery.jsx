import React from 'react';
import ArtCard from './ArtCard';
import '../styles/components/ArtGallery.css';

const artData = [
  {
    id: 1,
    title: 'Vibrant Exploration',
    description: 'A vibrant exploration of color and form...',
    price: '$1250',
    image: 'https://via.placeholder.com/300x200.png?text=Vibrant+Exploration'
  },
  {
    id: 2,
    title: 'Bronze Guardian',
    description: 'A powerful bronze sculpture...',
    price: '$3500',
    image: 'https://via.placeholder.com/300x200.png?text=Bronze+Guardian'
  },
  {
    id: 3,
    title: 'Soul in Shadows',
    description: 'An evocative portrait...',
    price: '$850',
    image: 'https://via.placeholder.com/300x200.png?text=Soul+in+Shadows'
  },
  {
    id: 4,
    title: 'Neon Dreams',
    description: 'A stunning digital artwork...',
    price: '$650',
    image: 'https://via.placeholder.com/300x200.png?text=Neon+Dreams'
  }
];

const ArtGallery = () => {
  return (
    <div className="art-gallery">
      {artData.map(artwork => (
        <ArtCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
};

export default ArtGallery;