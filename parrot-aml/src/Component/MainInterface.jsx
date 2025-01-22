import React, { useState, useEffect } from 'react';
import '../StyleSheet/MainInterface.css'; // Import the CSS file
import ChatBot from './ChatBot'; // Import the ChatBot component
import MainLayout from './MainLayout'; // Import the MainLayout component
import LoginSection from './LoginSection'; // Import the reusable LoginSection component
import ChatHistory from './ChatHistory'; // Import the ChatHistory component
import SearchResult from './SearchResult'; // Import the SearchResult component
import NewReport from './NewReport'; // Import the NewReport component
import { useNavigate, useParams } from 'react-router-dom'; // To handle redirection and params
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase authentication

const MainInterface = ({ submitted, saveData, resetApp }) => {
  const navigate = useNavigate();
  const { chatId } = useParams(); // Get chatId from URL params
  const [user, setUser] = useState(null); // Store authenticated user information
  const [report, setReport] = useState(''); // Store the generated report
  const [searchParams, setSearchParams] = useState({
    name: '',
    age: '',
    occupation: '',
    gender: ''
  });

  useEffect(() => {
    const auth = getAuth(); // Initialize Firebase authentication
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // If the user is not logged in, redirect to the login page
        navigate('/login');
      } else {
        setUser(currentUser); // Set user data
      }
    });

    return () => unsubscribe(); // Clean up the subscription
  }, [navigate]);

  const handleReportGenerated = (generatedReport) => {
    setReport(generatedReport); // Update the report state
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value
    }));
  };

  return (
    <MainLayout>
      {/* Login Section */}
      <div className="login-section">
        <LoginSection 
          loginText={user ? `Welcome, ${user.displayName || "User"}` : "Please Log In"}
          onClick={() => console.log("Login section clicked!")}
          onReset={resetApp} // Pass the resetApp function
        />
      </div>

      {/* Main Content */}
      {report ? (
        <SearchResult 
          name={searchParams.name}
          occupation={searchParams.occupation}
          age={searchParams.age}
          gender={searchParams.gender}
          clientId="CompanyXYZ" // Replace with actual client ID
          sessionId="1234abcd-efgh-5678-ijkl-9012mnop3456" // Replace with actual session ID
          onReportGenerated={handleReportGenerated}
          report={report}
        />
      ) : (
        <NewReport 
          searchParams={searchParams}
          handleInputChange={handleInputChange}
          saveData={saveData}
          setReport={setReport}
        />
      )}
    </MainLayout>
  );
};

export default MainInterface;