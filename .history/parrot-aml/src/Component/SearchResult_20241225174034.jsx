import React from 'react';
import '../StyleSheet/SearchResult.css';

const SearchResult = ({ name }) => {
  return (
    <div className="search-result">
      
      <div className="search-section-padding">
        <div className="search-section">
          <h1 className="name-title">{name}</h1>
        </div>
        
        <div className="description-container">
          <p className="description-text">Description goes here...</p>
        </div>
      </div>

      <div className="search-bars">
        <div className="name-bar">
          <div className="search-frame">
            <span className="search-placeholder">Search Something about this human...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
