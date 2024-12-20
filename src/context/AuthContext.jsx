import { message, Spin } from "antd";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(null); // null means not fetched
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUserData(token);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(
        "https://airstate-server.vercel.app/api/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = response.data;
      setUser(userData);

      if (userData.role === "admin") {
        fetchUsers();
      } else {
        // non-admin does not need full users list
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      message.error("Failed to fetch user data. Please login again.");
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (user) {
      setUsersLoading(true);
      try {
        const response = await axios.get(
          "https://airstate-server.vercel.app/api/users"
        );
        setUsers(response.data);
      } catch (error) {
        message.error("Failed to fetch users");
        console.error(error);
      } finally {
        setUsersLoading(false);
      }
    } else {
      return;
    }
  };

  const editUser = async (userId, updatedData) => {
    try {
      await axios.put("https://airstate-server.vercel.app/api/admin/edituser", {
        userId,
        ...updatedData,
      });
      message.success("User updated successfully");
      fetchUsers();
    } catch (error) {
      message.error("Failed to update user");
      console.error(error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(
        "https://airstate-server.vercel.app/api/admin/deleteuser",
        {
          data: { userId },
        }
      );
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error("Error deleting user");
      console.error(
        "Error deleting user:",
        error.response?.data?.message || error.message
      );
    }
  };

  const login = async ({ BdNUmber, password }) => {
    try {
      const response = await axios.post(
        "https://airstate-server.vercel.app/api/auth",
        { BdNUmber, password, action: "login" }
      );

      const { user: userData, token: userToken } = response.data;

      setUser(userData);
      setToken(userToken);
      localStorage.setItem("token", userToken);
      message.success("Login successful!");

      if (userData.role === "admin") {
        fetchUsers();
      } else {
        setUsers([]);
      }

      return userData;
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error("Login failed. Please try again.");
      }
      throw error;
    }
  };

  /**
   * Handles user registration.
   * @param {object} userData - User's BdNUmber and password
   */
  const register = async ({ BdNUmber, password,rank,trade,fullName }) => {
    try {
      const response = await axios.post(
        "https://airstate-server.vercel.app/api/auth",
        {
          BdNUmber: BdNUmber.trim(),
          password: password.trim(),
          rank: rank,
          trade: trade,
          fullName: fullName,
          action: "register",
        }
      );

      const { user: userData, token: newToken } = response.data;

      setUser(userData);
      setToken(newToken);
      localStorage.setItem("token", newToken);
      message.success("Registration successful! Welcome aboard.");

      if (userData.role === "admin") {
        fetchUsers();
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error(
          "An unexpected error occurred during registration. Please try again."
        );
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    setUsers(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers["Authorization"];
    message.success("Logged out successfully.");
  };

  if (loading || usersLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        users,
        usersLoading,
        fetchUsers,
        editUser,
        deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
