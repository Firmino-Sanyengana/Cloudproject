import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import AuthLayout from "@/components/layout/AuthLayout";
import Splash from "@/components/Splash";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import MyCourses from "@/pages/MyCourses";
import Lesson from "@/pages/Lesson";
import Translator from "@/pages/Translator";
import ProgressPage from "@/pages/Progress";
import Favorites from "@/pages/Favorites";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Notifications from "@/pages/Notifications";
import ExerciseHistory from "@/pages/ExerciseHistory";
import CourseChat from "@/pages/CourseChat";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import Enrollments from "@/pages/admin/Enrollments";
import CoursesAdmin from "@/pages/admin/CoursesAdmin";
import LessonsAdmin from "@/pages/admin/LessonsAdmin";
import UsersAdmin from "@/pages/admin/UsersAdmin";
import AdminMessages from "@/pages/admin/Messages";
import { useThemeStore } from "@/store/theme";

import VerifyEmail from "@/pages/VerifyEmail";

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

const SPLASH_KEY = "sofulano-splash-shown";

export default function App() {
  const apply = useThemeStore((s) => s.apply);
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem(SPLASH_KEY));
  useEffect(() => { apply(); }, [apply]);
  useEffect(() => {
    if (!showSplash) return;
    const t = setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, "1");
      setShowSplash(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [showSplash]);

  if (showSplash) return <Splash />;

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          {/* Páginas de autenticação (layout centrado, sem navbar) */}
         <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verificar-email" element={<VerifyEmail />} />
          </Route>

          {/* App principal */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="translator" element={<ProtectedRoute><Translator /></ProtectedRoute>} />
            <Route path="my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="lessons/:id" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
            <Route path="course-chat/:courseId" element={<ProtectedRoute><CourseChat /></ProtectedRoute>} />
            <Route path="progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            <Route path="exercise-history" element={<ProtectedRoute><ExerciseHistory /></ProtectedRoute>} />
            <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="enrollments" element={<Enrollments />} />
              <Route path="courses" element={<CoursesAdmin />} />
              <Route path="lessons" element={<LessonsAdmin />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="messages" element={<AdminMessages />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
