import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { Dashboard } from "./pages/Dashboard";
import { CustomersPage } from "./pages/CustomersPage";
import { NewCustomerPage } from "./pages/NewCustomerPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { InvoiceDetailPage } from "./pages/InvoiceDetailPage";
import { NewInvoicePage } from "./pages/NewInvoicePage";
import { ProductsPage } from "./pages/ProductsPage";
import { NewProductPage } from "./pages/NewProductPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import ProfilePage from "./pages/ProfilePage";
import "./index.css";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from "react";
import { EditCustomerPage } from "./pages/EditCustomerPage";
import PageNotFound from "./pages/PageNotFound";
function App() {
  const LogoutHandler = () => {
    const { logout } = useAuth();
    useEffect(() => {
      logout();
    }, [logout]);

    return <Navigate to="/landing" replace />;
  };
  return (
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/logout" element={<LogoutHandler />} />
          {/* <Route path="/loader" element={<Loader />} /> */}

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Layout>
                  <CustomersPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewCustomerPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditCustomerPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Layout>
                  <InvoicesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <InvoiceDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoices/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewInvoicePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewProductPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Layout>
                  <PaymentsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect to landing for unknown routes */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageNotFound />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
  );
}

export default App;
