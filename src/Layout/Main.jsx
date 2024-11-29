
import { NavLink, Outlet } from "react-router-dom";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gray-800 text-white sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-lg font-bold">Airstate</div>
          <div className="flex space-x-4">
         
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-blue-400" : "text-white"
              }
            >
              Home
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
           
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center  mt-auto">
        <div>© {new Date().getFullYear()} Created by LAC Riyad</div>
      </footer>
    </div>
  );
};

export default App;
