import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import '../StyleSheet/SearchResult.css';
import { generateReport } from '../apiService'; // Ensure this path is correct

const SearchResult = ({ name, occupation, age, gender, clientId, sessionId, onReportGenerated, report }) => {
  const [description, setDescription] = useState(report || '');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const report = await generateReport(sessionId, clientId, name, occupation, age, gender);
        setDescription(report);
        onReportGenerated(report); // Pass the report to the parent component
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };

    if (!report) {
      fetchReport();
    }
  }, [name, occupation, age, gender, clientId, sessionId, onReportGenerated, report]);

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
    </div>
  );
};

export default SearchResult;