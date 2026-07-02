import { Routes, Route } from "react-router-dom";

import {
  LoginPage,
  RegisterPage,
  VerifyEmailPage,
  HomePage,
  AboutPage,
  ProductsPage,
  ProductDetailPage,
  CheckoutPage,
  OrdersPage,
  SettingsPage,
} from "@/pages/public";

import PublicLayout from "@/layouts/PublicLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import {
  OverviewPage as FarmerOverview,
  FarmsPage as FarmerFarmsPage,
  HarvestPage,
  ChatPage,
  HubPage,
  InventoryPage,
  SettingsPage as FarmerSettingsPage,
  OrderPage,
} from "@/pages/farmer";

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

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.FARMER,
                ROLES.MANANGER,
                ROLES.DTI,
                ROLES.KALUPPA,
              ]}
            />
          }
        >
          <Route path="/knowledge-hub" element={<HubPage />} />
        </Route>

        {/* FARMER ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.FARMER]} />}>
          <Route path="/farmer" element={<DashboardLayout />}>
            <Route path="overview" element={<FarmerOverview />} />
            <Route path="farms" element={<FarmerFarmsPage />} />
            <Route path="harvests" element={<HarvestPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="inventorys" element={<InventoryPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="settings" element={<FarmerSettingsPage />} />
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
