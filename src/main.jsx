import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/custom-swal.module.css'; // <-- ¡AÑADE ESTA LÍNEA AQUÍ!
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Crea una instancia del cliente de query
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
