export const loginUser = async (email, password) => {
  try {
    // Authenticate the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user) {
      throw new Error('Authentication failed.');
    }
    console.log('User successfully authenticated:', user.uid);

    // Fetch user data from Firestore using UID
    const userData = await fetchUserDataByUID(user.uid);

    // Fetch company data using the 'company id' field in the user document
    const companyId = userData['company id'];
    if (!companyId) {
      console.warn('Company ID is missing for user:', user.uid);
      console.log('Fetched user data:', userData); // Log user data for debugging
      // Handle missing company ID (e.g., return partial data or fallback to a default value)
      return { user, userData, companyData: null };
    }

    const companyData = await fetchCompanyDataByID(companyId);

    // Store only minimal data in localStorage for security
    localStorage.setItem('user_id', user.uid); // Store user ID
    localStorage.setItem('company_name', companyData['name'] || 'Unknown'); // Store company name if available

    console.log('Login process completed successfully.');
    return { user, userData, companyData };
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
};
