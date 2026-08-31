import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { AdminProtectedRoute } from './components/AdminProtectedRoute.jsx'
import { ScrollToTop } from './components/ScrollToTop.jsx'
import { PublicLayout } from './components/layout/PublicLayout.jsx'
import { AppLayout } from './components/layout/AppLayout.jsx'

import { Home } from './pages/Home.jsx'
import { Diagnostico } from './pages/Diagnostico.jsx'
import { Produtos } from './pages/Produtos.jsx'
import { Assinatura } from './pages/Assinatura.jsx'
import { Login } from './pages/Login.jsx'
import { Cadastro } from './pages/Cadastro.jsx'
import { RedefinirSenha } from './pages/RedefinirSenha.jsx'
import { Dashboard } from './pages/app/Dashboard.jsx'
import { Avalia } from './pages/app/Avalia.jsx'
import { Lidera } from './pages/app/Lidera.jsx'
import { Conta } from './pages/app/Conta.jsx'
import { MatrizCompatibilidade } from './pages/app/MatrizCompatibilidade.jsx'
import { AdminLogin } from './pages/admin/AdminLogin.jsx'
import { AdminPainel } from './pages/admin/AdminPainel.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/assinatura" element={<Assinatura />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminPainel />
                </AdminProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="avalia" element={<Avalia />} />
            <Route path="matriz" element={<MatrizCompatibilidade />} />
            <Route path="lidera" element={<Lidera />} />
            <Route path="conta" element={<Conta />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
