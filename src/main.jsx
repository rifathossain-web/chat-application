import { createRoot } from 'react-dom/client';
import {
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';
import { router } from './routes/router.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)
