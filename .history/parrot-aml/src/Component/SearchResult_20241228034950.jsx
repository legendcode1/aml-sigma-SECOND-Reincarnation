import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import '../StyleSheet/SearchResult.css';
import markdownP from '../markdown/markdown.md';

const SearchResult = ({ name }) => {
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch(markdownP)
      .then(response => response.text())
      .then(text => setDescription(text));
  }, []);

  return (
    <div className="search-result">
      
      <div className="search-section-padding">
        <div className="search-section">
          <h1 className="name-title">OSINT Results For: {name}</h1>
        </div>
        
        <div className="description-container">
          <ReactMarkdown className="description-text">{description}</ReactMarkdown>
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