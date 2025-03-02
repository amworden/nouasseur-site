import * as React from "react";

interface LayoutProps {
  children: React.ReactNode;
  user?: { username: string } | null;
  isAuthenticated?: boolean;
}

export function Layout({ children, user = null, isAuthenticated = false }: LayoutProps) {
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
                <a href="/directory" className="hover:text-primary/80">
                  Directory
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-primary/80">
                  About Us
                </a>
              </li>
            </ul>
          </nav>
          <div className="md:hidden">
            <button className="rounded-md bg-primary p-2 text-primary-foreground hover:bg-primary/90">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium">Welcome, {user?.username}</span>
                <form
                  action="/api/users/logout"
                  method="POST"
                  data-hx-post="/api/users/logout"
                  data-hx-swap="none"
                  data-hx-on--htmx-after-request="window.location.href = '/';"
                >
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Register
                </a>
              </>
            )}
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