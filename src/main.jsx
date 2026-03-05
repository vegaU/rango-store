import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import App from './App.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/stock" element={<PlaceholderPage title="Inventario" />} />
              <Route path="/ventas" element={<PlaceholderPage title="Ventas" />} />
              <Route path="/clientes" element={<PlaceholderPage title="Clientes" />} />
              <Route path="/compras" element={<PlaceholderPage title="Compras" />} />
              <Route path="/reportes" element={<PlaceholderPage title="Reportes" />} />
              <Route path="/ajustes" element={<PlaceholderPage title="Ajustes" />} />
              <Route path="/menu" element={<PlaceholderPage title="Menu" />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
