import { Outlet, NavLink } from "react-router";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, Users, UserPlus, List, Shield, ShieldPlus, BarChart3, BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";
import TopNavProfile from "@/components/TopNavProfile";

export default function SidebarLayout() {
  const [usersOpen, setUsersOpen] = useState(false);

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <Sidebar>
        <SidebarHeader>
          <div className="px-3 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/30 border border-sidebar-primary/20">
              <div className="p-2.5 rounded-lg bg-sidebar-primary/20 ring-1 ring-sidebar-primary/30">
                <GraduationCap className="w-7 h-7 text-sidebar-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-sidebar-primary tracking-tight">Examate</h2>
                <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider font-medium">Academic Excellence</p>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-lg shadow-sidebar-primary/20"
                      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary"
                  }`
                }
              >
                <Home size={20} />
                <span className="font-medium">Dashboard</span>
              </NavLink>
            </SidebarMenuItem>

            {/* Exams */}
            <SidebarMenuItem>
              <NavLink
                to="/exams"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-lg shadow-sidebar-primary/20"
                      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary"
                  }`
                }
              >
                <BookOpen size={20} />
                <span className="font-medium">Examinations</span>
              </NavLink>
            </SidebarMenuItem>

            {/* Statistics */}
            <SidebarMenuItem>
              <NavLink
                to="/statistics"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-lg shadow-sidebar-primary/20"
                      : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary"
                  }`
                }
              >
                <BarChart3 size={20} />
                <span className="font-medium">Statistics</span>
              </NavLink>
            </SidebarMenuItem>

            {/* Users Dropdown */}
            <SidebarMenuItem>
              <button
                onClick={() => setUsersOpen(!usersOpen)}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary transition-all duration-200 font-medium"
              >
                <Users size={20} />
                <span>Users</span>
              </button>

              {/* Dropdown Items */}
              {usersOpen && (
                <div className="ml-8 mt-1 flex flex-col gap-1 border-l-2 border-sidebar-border pl-3">
                  <NavLink
                    to="/all-users"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-sidebar-primary/30 text-sidebar-primary font-semibold"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                      }`
                    }
                  >
                    <List size={18} />
                    <span>All Users</span>
                  </NavLink>

                  <NavLink
                    to="/create-user"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-sidebar-primary/30 text-sidebar-primary font-semibold"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                      }`
                    }
                  >
                    <UserPlus size={18} />
                    <span>Create User</span>
                  </NavLink>

                  <NavLink
                    to="/all-roles"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                        isActive
                          ? "bg-sidebar-primary/30 text-sidebar-primary font-semibold"
                          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                      }`
                    }
                  >
                    <Shield size={18} />
                    <span>All Roles</span>
                  </NavLink>

                </div>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <p className="px-2 text-sm text-muted-foreground">Footer</p>
        </SidebarFooter>
      </Sidebar>

      {/* Main content area */}
      <SidebarInset>
        {/* Top bar with trigger */}
        <div className="flex items-center justify-between p-2 border-b">
          <SidebarTrigger />
          {/* <h1 className="ml-2 font-semibold">Dashboard</h1> */}
              <TopNavProfile />
        </div>

        {/* Page content */}
        <div className="p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
