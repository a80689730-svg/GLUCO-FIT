import { Outlet } from "@tanstack/react-router";
import { Activity, ExternalLink } from "lucide-react";
import { Navbar } from "./Navbar";

export function Layout() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                <Activity className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-display font-semibold text-foreground">
                Gluco Fit
              </span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              © {year}. Built with love using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                caffeine.ai
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Your health. Our priority.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
