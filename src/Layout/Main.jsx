import { LoginOutlined, LogoutOutlined } from "@ant-design/icons"; // Import Ant Design icons
import { Helmet } from "react-helmet"; // Import Helmet
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import imgwhite from "../assets/svg.svg";
import imgblue from "../assets/svgblue.svg";
import { useAuth } from "../context/AuthContext"; // Import the AuthContext

// SVG icons for different routes
import adminIcon from "../assets/admin.svg";
import homeIcon from "../assets/home.svg";
import loginIcon from "../assets/login.svg";
import heliIcon from "../assets/mi-17_silhouette_top_v2.svg";
import profileIcon from "../assets/profile.svg";
import sdIcon from "../assets/sd.svg";
const App = () => {
  // Access the user state from AuthContext
  const { user, logout } = useAuth();

  // Use useLocation hook to get the current path
  const location = useLocation();

  // Function to generate the title based on the current path
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Home - MI-17";
      case "/login":
        return "Login - MI-17";
      case "/sd":
        return "S/D - MI-17";
      case "/oicstate":
        return "Oic State - MI-17";
      case "/officestate":
        return "Office State - MI-17";
      case "/trade":
        return "Trade - MI-17";
      case "/Officeduty":
        return "Daily Office - MI-17";
      case "/heli":
        return "All Helicopters - MI-17";
      case "/updatestate":
        return "Update State - MI-17";
      case "/airstate":
        return "Airstate - MI-17";
      case "/profile":
        return "Profile - MI-17";
      case "/admin":
        return "Admin - MI-17";
      default:
        return "MI-17";
    }
  };

  // Function to determine the current SVG icon based on the route
  const getIcon = () => {
    switch (location.pathname) {
      case "/":
        return homeIcon;
      case "/login":
        return loginIcon;
      case "/profile":
        return profileIcon;
      case "/admin":
        return adminIcon;
      case "/heli":
        return heliIcon;
        case "/sd":
          return sdIcon;
      default:
        return heliIcon; // Default icon if no match
    }
  };

  return (
    <div className="flex flex-col min-h-screen poppins-regular ">
      {/* Helmet for setting the document title and meta tags */}
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta
          name="description"
          content="MI-17 Helicopter Fleet Management System"
        />
        {/* Dynamically set the favicon */}
        <link
          rel="icon"
          type="image/svg+xml"
          className="w-6,h-6"
          href={getIcon()} // Dynamically set the favicon based on the route
        />
      </Helmet>

      {/* Header */}
      <header className="bg-gray-800 text-white sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <NavLink to="/">
            {({ isActive }) =>
              isActive ? (
                <img
                  src={imgblue} // Dynamically set the image source in the navbar as well
                  alt="MI-17"
                  width="25"
                  height="25"
                />
              ) : (
                <img
                  src={imgwhite} // Dynamically set the image source in the navbar as well
                  alt="MI-17"
                  width="25"
                  height="25"
                />
              )
            }
          </NavLink>
          <div className="flex space-x-4">
            {/* Navigation Links */}
            {user ? (
              <>
                <NavLink
                  to="/sd"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-white"
                  }
                >
                  <span>S/D</span>
                </NavLink>
                <NavLink
                  to="/oicstate"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-white"
                  }
                >
                  <span>Oic State</span>
                </NavLink>
                <NavLink
                  to="/officestate"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-white"
                  }
                >
                  <span>Office State</span>
                </NavLink>
                <NavLink
                  to="/trade"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-white"
                  }
                >
                  <span>Trade</span>
                </NavLink>
                <NavLink
                  to="/Officeduty"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-white"
                  }
                >
                  DailyOffice
                </NavLink>
                <NavLink
                  to="/heli"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-white"
                  }
                >
                  All Heli
                </NavLink>
                <NavLink
                  to="/updatestate"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-white"
                  }
                >
                  Daily State
                </NavLink>
                <NavLink
                  to="/airstate"
                  className={({ isActive }) =>
                    isActive ? "text-blue-400" : "text-white"
                  }
                >
                  Airstate
                </NavLink>
              </>
            ) : (
              <Navigate to="/login" replace />
            )}

            {/* Show user icon or login/logout icon based on authentication status */}
            {user ? (
              <>
                {/* User Icon as a Link */}
                <Link to="/profile">
                <img
                  src={profileIcon} // Dynamically set the image source in the navbar as well
                  alt="Profile"
                  width="25"
                  height="25"
                />
                </Link>

                {/* Logout Icon */}
                <button onClick={logout} className="text-white">
                  <LogoutOutlined className="text-white" />
                  
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-white"
                }
              >
                <LoginOutlined className="text-white" />
              </NavLink>
            )}

            {/* Admin Link */}
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "text-blue-400" : "text-white"
                }
              >
                Admin
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center mt-auto">
        <div>© {new Date().getFullYear()} Created by LAC Riyad</div>
      </footer>
    </div>
  );
};

export default App;
