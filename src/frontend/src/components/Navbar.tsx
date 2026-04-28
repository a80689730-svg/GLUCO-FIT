import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ChevronDown,
  Dumbbell,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Shield,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../hooks/useBackend";

const ADMIN_AUTH_KEY = "adminAuthenticated";

function useLocalAdminAuth() {
  const [isLocalAdmin, setIsLocalAdmin] = useState(
    () => localStorage.getItem(ADMIN_AUTH_KEY) === "true",
  );

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === ADMIN_AUTH_KEY) {
        setIsLocalAdmin(e.newValue === "true");
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return isLocalAdmin;
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/diet", label: "Diet Log" },
  { to: "/doctors", label: "Doctors" },
  { to: "/plans", label: "Plans" },
  { to: "/shopping", label: "Shopping", icon: ShoppingBag },
  { to: "/exercise", label: "Exercise", icon: Dumbbell },
  { to: "/chat", label: "AI Chat", icon: MessageCircle },
];

export function Navbar() {
  const { currentUser, isLoggedIn, logout } = useCurrentUser();
  const isAdmin = useLocalAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = currentUser?.name || currentUser?.email || "";
  const shortName =
    displayName.length > 18 ? `${displayName.slice(0, 16)}…` : displayName;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-health">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-ocid="nav.logo"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-xs group-hover:shadow-health transition-smooth">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground tracking-tight">
            Gluco<span className="text-primary">Fit</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth flex items-center gap-1"
                activeProps={{
                  className:
                    "px-3 py-2 rounded-md text-sm font-medium text-primary bg-primary/10 flex items-center gap-1",
                }}
                data-ocid={`nav.${link.label.toLowerCase().replace(/ /g, "_")}_link`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            );
          })}
          {isLoggedIn && (
            <Link
              to="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth flex items-center gap-1"
              activeProps={{
                className:
                  "px-3 py-2 rounded-md text-sm font-medium text-primary bg-primary/10 flex items-center gap-1",
              }}
              data-ocid="nav.dashboard_link"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth flex items-center gap-1"
              activeProps={{
                className:
                  "px-3 py-2 rounded-md text-sm font-medium text-primary bg-primary/10 flex items-center gap-1",
              }}
              data-ocid="nav.admin_link"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  data-ocid="nav.user_menu_button"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {shortName}
                  </span>
                  {isAdmin && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0 h-4"
                    >
                      Admin
                    </Badge>
                  )}
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-xs font-medium truncate text-foreground">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUser?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                  data-ocid="nav.logout_button"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-2" data-ocid="nav.login_button">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              data-ocid="nav.mobile_menu_button"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 pt-12">
            <nav className="flex flex-col gap-1 mb-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth flex items-center gap-2"
                    activeProps={{
                      className:
                        "px-4 py-3 rounded-lg text-sm font-medium text-primary bg-primary/10 flex items-center gap-2",
                    }}
                    data-ocid={`nav.mobile_${link.label.toLowerCase().replace(/ /g, "_")}_link`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                );
              })}
              {isLoggedIn && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth flex items-center gap-2"
                  activeProps={{
                    className:
                      "px-4 py-3 rounded-lg text-sm font-medium text-primary bg-primary/10 flex items-center gap-2",
                  }}
                  data-ocid="nav.mobile_dashboard_link"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth flex items-center gap-2"
                  data-ocid="nav.mobile_admin_link"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
            </nav>
            <div className="border-t border-border pt-4">
              {isLoggedIn ? (
                <div className="space-y-3">
                  <div className="px-4 py-2 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">
                      Signed in as
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    data-ocid="nav.mobile_logout_button"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button
                    className="w-full gap-2"
                    data-ocid="nav.mobile_login_button"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
