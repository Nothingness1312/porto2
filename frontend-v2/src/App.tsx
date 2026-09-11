import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ScrollToTop } from "./components/ui/ScrollToTop";
import { FaviconSync } from "./components/ui/FaviconSync";
import LoadingScreen from "./components/ui/LoadingScreen";

// Lazy-loaded pages (code splitting for performance)
const Home = lazy(() => import("./pages/public/Home"));
const About = lazy(() => import("./pages/public/About"));
const Projects = lazy(() => import("./pages/public/Projects"));
const ProjectDetail = lazy(() => import("./pages/public/ProjectDetail"));
const Writeups = lazy(() => import("./pages/public/Writeups"));
const WriteupDetail = lazy(() => import("./pages/public/WriteupDetail"));
const CertificatesPage = lazy(() => import("./pages/public/CertificatesPage"));
const CertificateDetail = lazy(() => import("./pages/public/CertificateDetail"));
const Contact = lazy(() => import("./pages/public/Contact"));
const NotFound = lazy(() => import("./pages/public/NotFound"));

// Admin
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProjects = lazy(() => import("./pages/admin/Projects"));
const AdminProjectForm = lazy(() => import("./pages/admin/ProjectForm"));
const AdminWriteups = lazy(() => import("./pages/admin/Writeups"));
const AdminWriteupForm = lazy(() => import("./pages/admin/WriteupForm"));
const AdminSkills = lazy(() => import("./pages/admin/Skills"));
const AdminCertificates = lazy(() => import("./pages/admin/Certificates"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminAchievements = lazy(() => import("./pages/admin/Achievements"));
const AdminSocials = lazy(() => import("./pages/admin/SocialLinks"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));

// Command palette (dialog-level, loaded with main chunk)
import { CommandPalette } from "./components/ui/CommandPalette";

export default function App() {
  const location = useLocation();

  // Reset scroll on route change is handled by ScrollToTop component
  useEffect(() => {
    document.title = "KKARINZZZ - Cybersecurity Researcher";
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <CommandPalette />}
      <FaviconSync />
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes wrapped in main layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/writeups" element={<Writeups />} />
            <Route path="/writeups/:slug" element={<WriteupDetail />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/certificates/:id" element={<CertificateDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="projects/new" element={<AdminProjectForm />} />
            <Route path="projects/:id/edit" element={<AdminProjectForm />} />
            <Route path="writeups" element={<AdminWriteups />} />
            <Route path="writeups/new" element={<AdminWriteupForm />} />
            <Route path="writeups/:id/edit" element={<AdminWriteupForm />} />
            <Route path="skills" element={<AdminSkills />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="achievements" element={<AdminAchievements />} />
            <Route path="socials" element={<AdminSocials />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}