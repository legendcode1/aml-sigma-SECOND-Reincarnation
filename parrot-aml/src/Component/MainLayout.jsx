import React from 'react';
import '../StyleSheet/MainLayout.css'; // Import the CSS file

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      {children}
    </div>
  );
};

export default MainLayout;
