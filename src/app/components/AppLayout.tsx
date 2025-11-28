"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUserStore } from "../../store/store";
import Header from "./Header";
import LeftSide from "./leftSide";
import LocationPermission from "./LocationPermission";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUserStore();
  const [locationGranted, setLocationGranted] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(true);

  // Exclude auth routes and landing page from having the sidebar and header
  const isAuthRoute = pathname?.startsWith("/login") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/verifyemail") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password") ||
    pathname === "/landing";

  useEffect(() => {
    if (isAuthRoute || !user) {
      setCheckingLocation(false);
      return;
    }

    // Check if location is already granted
    checkLocationStatus();
  }, [user, isAuthRoute]);

  const checkLocationStatus = async () => {
    try {
      const { getUserLocation } = await import("../lib/api");
      const res = await getUserLocation();
      if (res?.success && res?.locationPermissionGranted) {
        setLocationGranted(true);
      }
    } catch (error) {
      // Location not set yet
    } finally {
      setCheckingLocation(false);
    }
  };

  const handleLocationGranted = () => {
    setLocationGranted(true);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Show location permission screen if not granted
  if (!locationGranted && !checkingLocation) {
    return (
      <div className="flex h-screen w-full overflow-hidden font-sans bg-linear-to-br from-[#0a0118] via-[#1d0033] to-[#2a0044]">
        <LocationPermission onLocationGranted={handleLocationGranted} />
      </div>
    );
  }

  // Show loading while checking location
  if (checkingLocation) {
    return (
      <div className="flex h-screen w-full overflow-hidden font-sans bg-linear-to-br from-[#0a0118] via-[#1d0033] to-[#2a0044]">
        <LocationPermission onLocationGranted={handleLocationGranted} />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-linear-to-br from-[#0a0118] via-[#1d0033] to-[#2a0044]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Left Sidebar - Menu & Library */}
      <aside 
        className={`fixed inset-y-0 left-0 z-60 w-72 bg-[#1a0030]/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:bg-[#1a0030]/50 lg:backdrop-blur-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <LeftSide onClose={closeSidebar} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0a0118]">
        <Header onMenuClick={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
