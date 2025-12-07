import PurchasesPage from "./pages/purchases-page";
import CustomersPage from "./pages/customers-page";
import TopBar from "./components/top-bar";
import { Sidebar } from "./components/sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useState, type PropsWithChildren } from "react";
import { cn } from "./lib/utils";

interface DashboardLayoutProps extends PropsWithChildren {
  isSidebarOpen: boolean;
  closeSidebar: () => void;
}

function DashboardLayout({
  children,
  isSidebarOpen,
  closeSidebar,
}: DashboardLayoutProps) {
  const SIDEBAR_WIDTH_PX = 224;

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onLinkClick={closeSidebar} />

      <main
        className={cn("flex-1 mt-14 p-4 transition-all duration-300")}
        style={{
          marginLeft: isSidebarOpen ? `${SIDEBAR_WIDTH_PX}px` : "0",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <Router>
      <Toaster position="bottom-right" reverseOrder={false} />

      <TopBar onToggleSidebar={toggleSidebar} />

      <Routes>
        <Route
          path="/"
          element={
            <DashboardLayout
              isSidebarOpen={isSidebarOpen}
              closeSidebar={closeSidebar}
            >
              <CustomersPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/purchases"
          element={
            <DashboardLayout
              isSidebarOpen={isSidebarOpen}
              closeSidebar={closeSidebar}
            >
              <PurchasesPage />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
