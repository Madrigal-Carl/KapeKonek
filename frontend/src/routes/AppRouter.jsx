import { Routes, Route } from "react-router-dom";

import HomePage from "@/pages/public/HomePage";

import PublicLayout from "@/layouts/PublicLayout";
// import DashboardLayout from "@/layouts/DashboardLayout";

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
            <Route path="/about" element={<div>About Page</div>} />
            <Route path="/products" element={<div>Products Page</div>} />

            {/*  AUTHENTICATED USER ONLY */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.FARMER, ROLES.BUYER, ROLES.KALUPPA]}
                />
              }
            >
              <Route path="/checkout" element={<div>CHECKOUT PAGE</div>} />
            </Route>
          </Route>
        </Route>

        {/* ROLE REDIRECT */}
        <Route path="/redirect" element={<RoleRedirect />} />

        {/* GUEST ONLY */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/register" element={<div>Register Page</div>} />
        </Route>

        {/* FAR ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.FARMER]} />}>
          {/* <Route path="/far" element={<DashboardLayout />}> */}
          <Route path="overview" element={<div>FARMER Page</div>} />
          {/* </Route> */}
        </Route>

        {/* MANAGER ONLY */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.MANAGER]} />}>
          <Route path="/manager/overview" element={<div>MANAGER Page</div>} />
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
        {/* <Route
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.HEAD]} />
          }
        >
          <Route path="/reports" element={<div>Reports Page</div>} />
        </Route> */}

        {/* UNAUTHORIZED */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* FALLBACK */}
        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </>
  );
}
