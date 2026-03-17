import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import App from './App.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Customers from './pages/Customers.jsx'
import Login from './pages/Login.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'
import Products from './pages/Products.jsx'
import Sales from './pages/Sales.jsx'
import Categories from './pages/Categories.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import RoleRoute from './routes/RoleRoute.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<RoleRoute><Dashboard /></RoleRoute>} />
              <Route path="/stock" element={<RoleRoute><Products /></RoleRoute>} />
              <Route path="/ventas" element={<RoleRoute><Sales /></RoleRoute>} />
              <Route path="/clientes" element={<RoleRoute><Customers /></RoleRoute>} />
              <Route path="/categorias" element={<RoleRoute><Categories /></RoleRoute>} />
              <Route path="/compras" element={<RoleRoute><PlaceholderPage title="Compras" /></RoleRoute>} />
              <Route path="/reportes" element={<RoleRoute><Reports /></RoleRoute>} />
              <Route path="/ajustes" element={<RoleRoute><Settings /></RoleRoute>} />
              <Route path="/menu" element={<RoleRoute><PlaceholderPage title="Menu" /></RoleRoute>} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
