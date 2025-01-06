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
    <div className="main-parent">
      <div className="left-bar">
        <LeftBar savedItems={savedItems} />
      </div>
      <MainInterface
        submitted={submitted}
        searchParams={searchParams}
        handleInputChange={handleInputChange}
        saveData={saveData}
      />
    </div>
  );
};

export default App;