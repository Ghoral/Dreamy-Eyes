import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import Orders from "./pages/Tables/Orders";
import DeliveryOrders from "./pages/Tables/DeliveryOrders";
// import FormElements from "./pages/Forms/FormElements";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import LandingForm from "./pages/Forms/Landing";
import ProductForm from "./pages/Forms/Product";
import SalesForm from "./pages/Forms/Sales";
import ColorsForm from "./pages/Forms/Colors";
import OffersForm from "./pages/Forms/Offers";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Users from "./pages/Tables/Users";
import InviteAdmin from "./pages/InviteAdmin";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import TikTok from "./pages/Social/TikTok";
import ProductsTable from "./pages/Tables/Products";
import SalesTable from "./pages/Tables/Sales";
import Admins from "./pages/Tables/Admins";
import ActivityLogs from "./pages/Tables/ActivityLogs";
import ReportGeneration from "./pages/Tables/ReportGeneration";

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Redirect based on session */}
      <Route
        path="/"
        element={<Navigate to={session ? "/dashboard" : "/signin"} replace />}
      />
      <Route path="/signin" element={<SignIn />} />
      {/* Sign up removed */}

      {/* Protected Dashboard Routes */}
      <Route
        element={session ? <AppLayout /> : <Navigate to="/signin" replace />}
      >
        <Route path="/dashboard" element={<Home />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/users" element={<Users />} />
        <Route path="/invite-admin" element={<InviteAdmin />} />
        <Route path="/invite-admin/edit/:id" element={<InviteAdmin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/social/tiktok" element={<TikTok />} />
        <Route path="/products" element={<ProductsTable />} />
        <Route path="/sales" element={<SalesTable />} />
        {/* Forms */}
        <Route path="/form/landing" element={<LandingForm />} />
        <Route path="/form/product" element={<ProductForm />} />
        <Route path="/form/sales" element={<SalesForm />} />
        <Route path="/form/colors" element={<ColorsForm />} />
        <Route path="/form/offers" element={<OffersForm />} />
        {/* Tables */}
        <Route path="/basic-tables" element={<BasicTables />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/delivery-orders" element={<DeliveryOrders />} />
        <Route path="/activity-logs" element={<ActivityLogs />} />
        <Route path="/report-generation" element={<ReportGeneration />} />
        {/* UI Elements */}
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/avatars" element={<Avatars />} />
        <Route path="/badge" element={<Badges />} />
        <Route path="/buttons" element={<Buttons />} />
        <Route path="/images" element={<Images />} />
        <Route path="/videos" element={<Videos />} />
        {/* Charts */}
        <Route path="/line-chart" element={<LineChart />} />
        <Route path="/bar-chart" element={<BarChart />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
