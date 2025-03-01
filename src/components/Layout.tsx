import * as React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground dark">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <a href="/" className="text-2xl font-bold">
              Nouasseur Events
            </a>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <a href="/" className="hover:text-primary/80">
                  Home
                </a>
              </li>
              <li>
                <a href="/events" className="hover:text-primary/80">
                  Events
                </a>
              </li>
              <li>
                <a href="/members" className="hover:text-primary/80">
                  Members
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-primary/80">
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-primary/80">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
          <div className="flex items-center space-x-4">
            <a
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Login
            </a>
            <a
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Register
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} Nouasseur Events. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 