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
  OverviewPage,
  FarmsPage as FarmerFarmsPage,
  HarvestPage,
  ChatPage,
  HubPage,
  InventoryPage,
  SettingsPage as FarmerSettingsPage,
  OrderPage,
  FarmersPage,
  ManagersPage,
  ReportsPage,
  FarmMapPage,
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
        <Route element={<AuthRedirectRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Route>

        {/* PUBLIC & AUTHENTICATED USER */}
        <Route element={<AuthRedirectRoute />}>
          <Route element={<PublicLayout />}>
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
            <Route path="/profile" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.FARMER,
                ROLES.MANAGER,
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
            <Route path="overview" element={<OverviewPage />} />
            <Route path="farms" element={<FarmerFarmsPage />} />
            <Route path="harvests" element={<HarvestPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="settings" element={<FarmerSettingsPage />} />
          </Route>
        </Route>

        {/* MANAGER ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
          <Route path="/manager" element={<DashboardLayout />}>
            <Route path="overview" element={<OverviewPage />} />
            <Route path="farmers" element={<FarmersPage />} />
            <Route path="farms" element={<FarmerFarmsPage />} />
            <Route path="harvests" element={<HarvestPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="farm-maps" element={<FarmMapPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<FarmerSettingsPage />} />
          </Route>
        </Route>

        {/* DTI ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DTI]} />}>
          <Route path="/dti" element={<DashboardLayout />}>
            <Route path="overview" element={<OverviewPage />} />
            <Route path="farmers" element={<FarmersPage />} />
            <Route path="farms" element={<FarmerFarmsPage />} />
            <Route path="harvests" element={<HarvestPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="farm-maps" element={<FarmMapPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<FarmerSettingsPage />} />
          </Route>
        </Route>

        {/* KALUPPA ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.KALUPPA]} />}>
          <Route path="/kaluppa" element={<DashboardLayout />}>
            <Route path="overview" element={<OverviewPage />} />
            <Route path="managers" element={<ManagersPage />} />
            <Route path="farms" element={<FarmerFarmsPage />} />
            <Route path="harvests" element={<HarvestPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="farm-maps" element={<FarmMapPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<FarmerSettingsPage />} />
          </Route>
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
