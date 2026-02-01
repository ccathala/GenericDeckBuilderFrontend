import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import MageNoirFooter from "../components/MageNoirFooter";

const HomePage = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-mage-bg-900 w-full flex flex-col">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="text-center">
          <div className="text-6xl mb-6">🎴</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {t("pages.home.welcome")}
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            {t("pages.home.description")}
          </p>

          {isAuthenticated ? (
            <div className="bg-mage-bg-800 rounded-lg p-6 border border-mage-dark-600 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-4">
                {t("pages.home.welcomeBack", { name: user?.name })}
              </h2>
              <div className="space-y-4">
                <Link
                  to="/cards"
                  className="block w-full bg-mage-dark-600 hover:bg-mage-dark-500 
                           text-white font-medium py-3 px-4 rounded-md 
                           transition-colors duration-200"
                >
                  {t("pages.home.browseCards")}
                </Link>
                <Link
                  to="/decks"
                  className="block w-full bg-mage-dark-600 hover:bg-mage-dark-500 
                           text-white font-medium py-3 px-4 rounded-md 
                           transition-colors duration-200"
                >
                  {t("pages.home.myDecks")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Link
                to="/register"
                className="flex-1 text-center bg-mage-dark-600 hover:bg-mage-dark-500 
                         text-white font-medium py-3 px-4 rounded-md 
                         transition-colors duration-200"
              >
                {t("pages.home.getStarted")}
              </Link>
              <Link
                to="/login"
                className="flex-1 text-center border border-mage-dark-600 hover:bg-mage-dark-700 
                         text-white font-medium py-3 px-4 rounded-md 
                         transition-colors duration-200"
              >
                {t("pages.home.login")}
              </Link>
            </div>
          )}
        </div>

        {/* Fonctionnalités */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("pages.home.features.collection")}
            </h3>
            <p className="text-gray-300">
              {t("pages.home.features.collectionDesc")}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("pages.home.features.builder")}
            </h3>
            <p className="text-gray-300">
              {t("pages.home.features.builderDesc")}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("pages.home.features.strategies")}
            </h3>
            <p className="text-gray-300">
              {t("pages.home.features.strategiesDesc")}
            </p>
          </div>
        </div>
      </div>
      <MageNoirFooter />
    </div>
  );
};

export default HomePage;
