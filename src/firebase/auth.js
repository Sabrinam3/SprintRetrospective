import React, { useEffect, useState } from "react";
import { app } from "../firebase";
import { useHistory } from "react-router-dom";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const history = useHistory();

  useEffect(() => {
    app.onAuthStateChanged(setCurrentUser);
    if (currentUser) {
      history.push("/home");
    } else {
      history.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        refresh,
        setRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
