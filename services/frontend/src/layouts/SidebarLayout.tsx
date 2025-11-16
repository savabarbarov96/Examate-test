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
          <div className="px-2 py-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display text-xl text-primary">Examate</h2>
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
                  `flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
                    isActive ? "bg-muted text-primary font-semibold" : "hover:bg-muted"
                  }`
                }
              >
                <Home size={18} />
                <span>Dashboard</span>
              </NavLink>
            </SidebarMenuItem>

            {/* Exams */}
            <SidebarMenuItem>
              <NavLink
                to="/exams"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
                    isActive ? "bg-muted text-primary font-semibold" : "hover:bg-muted"
                  }`
                }
              >
                <BookOpen size={18} />
                <span>Examinations</span>
              </NavLink>
            </SidebarMenuItem>

            {/* Statistics */}
            <SidebarMenuItem>
              <NavLink
                to="/statistics"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
                    isActive ? "bg-muted text-primary font-semibold" : "hover:bg-muted"
                  }`
                }
              >
                <BarChart3 size={18} />
                <span>Statistics</span>
              </NavLink>
            </SidebarMenuItem>

            {/* Users Dropdown */}
            <SidebarMenuItem>
              <button
                onClick={() => setUsersOpen(!usersOpen)}
                className="flex w-full items-center gap-2 px-2 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <Users size={18} />
                <span>Users</span>
              </button>

              {/* Dropdown Items */}
              {usersOpen && (
                <div className="ml-6 mt-1 flex flex-col gap-1">
                  <NavLink
                    to="/all-users"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
                        isActive ? "bg-muted text-primary font-semibold" : "hover:bg-muted"
                      }`
                    }
                  >
                    <List size={16} />
                    <span>All Users</span>
                  </NavLink>

                  <NavLink
                    to="/create-user"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
                        isActive ? "bg-muted text-primary font-semibold" : "hover:bg-muted"
                      }`
                    }
                  >
                    <UserPlus size={16} />
                    <span>Create User</span>
                  </NavLink>

                  <NavLink
                    to="/all-roles"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${
                        isActive ? "bg-muted text-primary font-semibold" : "hover:bg-muted"
                      }`
                    }
                  >
                    <Shield size={16} />
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
