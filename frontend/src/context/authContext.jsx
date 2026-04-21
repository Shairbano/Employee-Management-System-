/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Loading from "../components/Loading"; 

const UserContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
     
      const timer = new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          // Even if no token, we wait for the timer to finish the 5 seconds
          await timer;
          setUser(null);
          setLoading(false);
          return;
        }

        // We run the API call and the timer at the same time
        const [response] = await Promise.all([
          axios.get('http://localhost:3000/api/auth/verify', {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          timer // This ensures the code below waits at least 3 seconds
        ]);

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("User verification failed", err);
        // Wait for the timer even on error
        await timer;
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {loading ? <Loading /> : children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
export default AuthContext;