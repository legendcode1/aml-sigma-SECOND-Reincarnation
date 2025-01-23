import axios from 'axios';

// Frontend function to generate report
export const generateReport = async (session_id, client_id, pep_name, pep_occupation, pep_age, pep_gender) => {
  try {
    const payload = {
      session_id,
      client_id,
      pep_name,
      pep_occupation,
      pep_age,
      pep_gender
    };
    const response = await axios.post('http://localhost:3000/api/report', payload);
    return response.data.report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};