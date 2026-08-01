import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { PublicLayout } from './components/layout/PublicLayout.jsx'
import { AppLayout } from './components/layout/AppLayout.jsx'

import { Home } from './pages/Home.jsx'
import { Diagnostico } from './pages/Diagnostico.jsx'
import { Produtos } from './pages/Produtos.jsx'
import { Login } from './pages/Login.jsx'
import { Cadastro } from './pages/Cadastro.jsx'
import { Avalia } from './pages/app/Avalia.jsx'
import { Lidera } from './pages/app/Lidera.jsx'
import { Conta } from './pages/app/Conta.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
          </Route>

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Avalia />} />
            <Route path="avalia" element={<Avalia />} />
            <Route path="lidera" element={<Lidera />} />
            <Route path="conta" element={<Conta />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
