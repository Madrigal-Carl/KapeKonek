import { Routes, Route } from "react-router-dom";

import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import VerifyEmailPage from "@/pages/public/VerifyEmailPage";

import HomePage from "@/pages/public/HomePage";
import AboutPage from "@/pages/public/AboutPage";
import ProductsPage from "@/pages/public/ProductsPage";
import ProductDetailPage from "@/pages/public/ProductDetailPage";
import CheckoutPage from "@/pages/public/CheckoutPage";

import OrdersPage from "../pages/public/OrdersPage";
import SettingsPage from "../pages/public/SettingsPage";

import PublicLayout from "@/layouts/PublicLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import UnauthorizedPage from "@/pages/shared/UnauthorizedPage";

import ProtectedRoute from "./ProtectedRoute";
import RoleRedirect from "./RoleRedirect";
import FallbackRedirect from "./FallbackRedirect";
import PublicOnlyRoute from "./PublicOnlyRoute";
import AuthRedirectRoute from "./AuthRedirectRoute";

import { ROLES } from "@/constants/roles";

import ScrollToTop from "@/components/public/ScrollToTop";

export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC & AUTHENTICATED USER */}
        <Route element={<AuthRedirectRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route
              path="/products/:productId"
              element={<ProductDetailPage />}
            />

            {/*  AUTHENTICATED USER ONLY */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.FARMER, ROLES.BUYER, ROLES.KALUPPA]}
                />
              }
            >
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>
          </Route>
        </Route>

        {/* ROLE REDIRECT */}
        <Route path="/redirect" element={<RoleRedirect />} />

        {/* GUEST ONLY */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        </Route>

        {/* BUYER ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.BUYER]} />}>
          <Route element={<PublicLayout />}>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* FARMER ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.FARMER]} />}>
          <Route path="/farmer" element={<DashboardLayout />}>
            <Route path="overview" element={<div>FARMER Page</div>} />
          </Route>
        </Route>

        {/* DTI ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DTI]} />}>
          <Route path="/dti/overview" element={<div>DTI Page</div>} />
        </Route>

        {/* KALUPPA ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.KALUPPA]} />}>
          <Route path="/kaluppa/overview" element={<div>KALUPPA Page</div>} />
        </Route>

        {/* MULTIPLE ROLES */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.FARMER, ROLES.BUYER, ROLES.KALUPPA]}
            />
          }
        >
          {/* <Route path="/checkout" element={<CheckoutPage />} /> */}
        </Route>

        {/* UNAUTHORIZED */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* FALLBACK */}
        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </>
  );
}
