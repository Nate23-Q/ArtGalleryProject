import React, { useState } from 'react';

const CategoryFilter = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const categories = [
    'All Categories',
    'Painting',
    'Sculpture',
    'Photography',
    'Digital',
    'Mixed Media'
  ];

  return (
    <div className="gallery-filter">
      <button 
        className="filter-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        All Categories
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 8l4 4 4-4" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="filter-dropdown">
          {categories.map((category) => (
            <button
              key={category}
              className="filter-option"
              onClick={() => {
                onSelect(category);
                setIsOpen(false);
              }}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;