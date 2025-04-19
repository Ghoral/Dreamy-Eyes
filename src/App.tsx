import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useEffect, useState } from "react";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { supabaseClient } from "./service/supabase";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error }: any = await supabaseClient.auth.getSession();
      if (error) {
        console.error("Error checking session", error);
      }
      setSession(data?.session ?? null);
      setLoading(false);
    };

    checkSession();

    // Listen for future changes too
    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session: any) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Redirect to dashboard if logged in */}
        <Route
          path="/"
          element={
            session ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/signin"
          element={session ? <Navigate to="/dashboard" replace /> : <SignIn />}
        />
        <Route
          path="/signup"
          element={session ? <Navigate to="/dashboard" replace /> : <SignUp />}
        />

        {/* Protected Dashboard Routes */}
        <Route
          element={session ? <AppLayout /> : <Navigate to="/signin" replace />}
        >
          <Route path="/dashboard" element={<Home />} />
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />

          {/* Forms */}
          <Route path="/form-elements" element={<FormElements />} />

          {/* Tables */}
          <Route path="/basic-tables" element={<BasicTables />} />

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
    </Router>
  );
}
