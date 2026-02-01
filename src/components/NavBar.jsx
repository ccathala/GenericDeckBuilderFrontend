import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const NavBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  const navigationItems = [
    { key: "home", label: t("nav.home"), href: "/" },
    { key: "cardGallery", label: t("nav.cardGallery"), href: "/cards" },
    { key: "myDecks", label: t("nav.myDecks"), href: "/decks" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-mage-bg-900 shadow-lg border-b border-mage-dark-600 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* Logo */}
          <div className="flex items-center justify-start">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-2xl mr-2">🎴</div>
              <h1 className="text-xl font-bold text-white">
                {t("common.appName")}
              </h1>
            </div>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex justify-center">
            <div className="flex items-center space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium 
                           text-gray-300 hover:text-white hover:bg-mage-dark-700 
                           transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center justify-end space-x-4">
            <LanguageToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 text-sm rounded-full 
                           focus:outline-none focus:ring-2 focus:ring-mage-dark-500 focus:ring-offset-2"
                >
                  <div className="w-8 h-8 bg-mage-dark-600 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium hover:text-white transition-colors duration-200">
                    {user?.name}
                  </span>
                </button>

                {/* Dropdown menu */}
                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-mage-bg-800 
                                rounded-md shadow-lg py-1 z-50 border border-mage-dark-600"
                  >
                    {" "}
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 
                           hover:bg-mage-dark-700 hover:text-white"
                    >
                      {t("nav.myProfile")}
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-300 
                           hover:bg-mage-dark-700 hover:text-white"
                    >
                      {t("nav.settings")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 
                               hover:bg-mage-dark-700 hover:text-white"
                    >
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-mage-dark-600 text-white text-sm font-medium 
                           rounded-md hover:bg-mage-dark-500 transition-colors duration-200"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Menu hamburger mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white 
                       focus:outline-none focus:ring-2 focus:ring-mage-dark-500 focus:ring-offset-2"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-mage-bg-800 border-t border-mage-dark-600">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium 
                         text-gray-300 hover:text-white hover:bg-mage-dark-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="px-3 py-2">
              <LanguageToggle />
            </div>

            {isAuthenticated ? (
              <div className="px-3 py-2 space-y-1">
                <div className="flex items-center space-x-2 pb-2">
                  <div className="w-8 h-8 bg-mage-dark-600 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-700 font-medium">
                    {user?.name}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium 
                           text-gray-300 hover:text-white hover:bg-mage-dark-700"
                >
                  {t("nav.myProfile")}
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium 
                           text-gray-300 hover:text-white hover:bg-mage-dark-700"
                >
                  {t("nav.settings")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium 
                           text-gray-300 hover:text-white hover:bg-mage-dark-700"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="px-3 py-2 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium 
                           text-gray-300 hover:text-white hover:bg-mage-dark-700"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 bg-mage-dark-600 text-white text-base font-medium 
                           rounded-md hover:bg-mage-dark-500 transition-colors duration-200"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
