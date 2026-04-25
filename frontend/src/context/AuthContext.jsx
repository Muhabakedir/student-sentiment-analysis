import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

/**
 * Auth uses sessionStorage (not localStorage) so the token is:
 * - Isolated per browser tab — opening a new tab requires login
 * - Cleared automatically when the tab/browser is closed
 * - Not shared across different browsers or incognito windows
 *
 * Both admin and student sessions use sessionStorage.
 * student_session_id stays in localStorage so feedback history persists.
 */
export function AuthProvider({ children }) {
  const [token, setToken]               = useState(() => sessionStorage.getItem("admin_token") || null);
  const [email, setEmail]               = useState(() => sessionStorage.getItem("admin_email") || null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => sessionStorage.getItem("admin_super") === "true");

  const login = (accessToken, adminEmail, superAdmin = false) => {
    // Clear any old localStorage tokens from previous versions
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_super");
    sessionStorage.setItem("admin_token", accessToken);
    sessionStorage.setItem("admin_email", adminEmail);
    sessionStorage.setItem("admin_super", String(superAdmin));
    setToken(accessToken);
    setEmail(adminEmail);
    setIsSuperAdmin(superAdmin);
  };

  const logout = () => {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_email");
    sessionStorage.removeItem("admin_super");
    setToken(null);
    setEmail(null);
    setIsSuperAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ token, email, isSuperAdmin, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
