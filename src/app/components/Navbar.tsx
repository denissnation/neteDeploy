// components/Navbar.js
"use client";
import { useState, useEffect, ReactNode, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/loginActions";
import { useAuth } from "../context/auth-context";
import Image from "next/image";

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, setAuthData } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
        setDropdownOpen(false);
      } else {
        setDropdownOpen(false);
        setIsScrolled(false);
      }
    };
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsOpen(false);
    };
    handleScroll();
    if (mediaQuery.matches) setIsOpen(false);

    // Add listeners
    mediaQuery.addEventListener("change", handleMediaChange);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAction();
    setAuthData({ isAuthenticated: false, user: null });
    setDropdownOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? " bg-[#333333]" : "bg-[#333333]"
      } `}
    >
      <div className={`max-w-6xl mx-auto sm:px-4`}>
        <div className="flex justify-between items-center pl-4 sm:pl-0 py-2 sm:py-4">
          {/* Logo */}
          <div className="text-2xl font-bold text-gray-800">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Image
                src="/features/gwm.png"
                width={400} // or appropriate width for h-24 (6rem = 96px)
                height={300} // or appropriate height for h-16 (4rem = 64px)
                className="h-10 md:h-12  w-48 object-contain " // Added object-contain for better scaling
                alt="GWM logo" // Always use descriptive alt text
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div
            className={`hidden sm:flex space-x-8  font-semibold pr-4  sm:pr-0 `}
          >
            <NavLink href="/">Home</NavLink>
            <NavLink href="/news">News</NavLink>
            <NavLink href="/contact">Testimoni</NavLink>
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center px-3  text-[#ffff] hover:text-[#d7000f] transition-colors duration-200"
                >
                  Admin
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#333333] rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/admin/cars"
                      className="block px-4 py-2 text-black sm:text-[#ffff] hover:bg-[#d7000f] rounded-lg transition-colors duration-200"
                    >
                      Vehicle
                    </Link>
                    <Link
                      href="/admin/news"
                      className="block px-4 py-2 text-[#ffff] hover:text-[#d7000f] transition-colors duration-200"
                    >
                      News
                    </Link>
                    <button
                      // onClick={() => signOut()}
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-[#ffff] hover:text-[#d7000f] transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#ffff]  pr-4 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="sm:hidden mt-1 pb-4 space-y-2 px-4 bg-[#ffff]">
            <MobileNavLink href="/" onClick={() => setIsOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink href="/news" onClick={() => setIsOpen(false)}>
              News
            </MobileNavLink>
            <MobileNavLink href="/testimoni" onClick={() => setIsOpen(false)}>
              Testimoni
            </MobileNavLink>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center px-4 py-2 text-black sm:text-[#ffff] hover:bg-[#d7000f] rounded-lg transition-colors duration-200 w-full"
              >
                Admin
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#ffff] rounded-md shadow-lg py-1 z-50">
                  <Link
                    href="/admin/cars"
                    className="block px-4 py-2 text-black sm:text-[#ffff] hover:bg-[#d7000f] rounded-lg transition-colors duration-200"
                  >
                    Vehicle
                  </Link>
                  <Link
                    href="/admin/news"
                    className="block px-4 py-2 text-black sm:text-[#ffff] hover:bg-[#d7000f] rounded-lg transition-colors duration-200"
                  >
                    News
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-black sm:text-[#ffff] hover:bg-[#d7000f] rounded-lg transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Helper components for cleaner code
function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="text-[#ffff] hover:text-[#d7000f] transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children, onClick }: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-black sm:text-[#ffff] hover:bg-[#d7000f] rounded-lg transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

function MenuIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
