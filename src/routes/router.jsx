import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import TradeLayout from "../Layout/TradeLayout";
import AdminPanel from "../pages/AdminPanel"; // Import the AdminPanel component
import Airstate from "../pages/Airstate";
import AlHeli from "../pages/alHeli";
import ErrorPage from "../pages/errorPage";
import HeliDetails from "../pages/HeliDatails";
import Login from "../pages/Login";
import AllTrade from "../pages/OfficeManagement/AllTrade";
import OfficeState from "../pages/OfficeManagement/OfficeSate/OfficeState";
import OicState from "../pages/OfficeManagement/OfficeSate/OicState";
import SdState from "../pages/OfficeManagement/OfficeSate/SdState";
import { Afr, Armt, EI, Eng, Rf } from '../pages/OfficeManagement/Trades';
import UserProfile from "../pages/OfficeManagement/UserProfile/UserProfile";
import UpdateStateForm from "../pages/UpdateSateForm";
import PrivateRoute from "../PrivateRoute"; // Import the PrivateRoute component
import DailyOffice from "./../pages/OfficeManagement/DailyOffice";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "airstate",
        element: <PrivateRoute element={<Airstate />} />,
      },
      {
        path: "profile",
        element: <PrivateRoute element={<UserProfile />} />,
      },
      {
        path: "updatestate",
        element: <PrivateRoute element={<UpdateStateForm />} />,
      },
      {
        path: "heli",
        element: <PrivateRoute element={<AlHeli />} />,
      },
      {
        path: "helidetails/:id",
        element: <PrivateRoute element={<HeliDetails />} />,
      },
      {
        path: "admin",
        element: <PrivateRoute element={<AdminPanel />} requiredRole="admin" />,
      },
      {
        path: "Officeduty",
        element: <PrivateRoute element={<DailyOffice />} requiredRole="admin" />,
      },
      {
        path: "trade",
        element: <PrivateRoute element={<TradeLayout />} requiredRole="admin" />,
        children: [
          {
            path: "",
            element: <AllTrade />, // Default trade content
          },
          {
            path: "afr",
            element: <Afr />,
          },
          {
            path: "eng",
            element: <Eng />,
          },
          {
            path: "ei",
            element: <EI />,
          },
          {
            path: "rf",
            element: <Rf />,
          },
          {
            path: "armt",
            element: <Armt />,
          },
        ],
      },
      {
        path: "officestate",
        element: <PrivateRoute element={<OfficeState />} requiredRole="admin" />,
      },
      {
        path: "oicstate",
        element: <PrivateRoute element={<OicState />} requiredRole="admin" />,
      },
      {
        path: "sd",
        element: <PrivateRoute element={<SdState />} requiredRole="admin" />,
      },
      
      {
        path: "login",
        element: <Login />, // No protection needed for login
      },
    ],
  },
]);
