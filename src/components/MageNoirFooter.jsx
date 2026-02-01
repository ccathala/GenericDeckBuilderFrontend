import { useLanguage } from "../contexts/LanguageContext";

const MageNoirFooter = () => {
  const { t, currentLanguage } = useLanguage();

  const getMageNoirUrl = () => {
    return currentLanguage === "fr"
      ? "https://magenoir.com/index_français.html"
      : "https://magenoir.com/index.html";
  };

  return (
    <footer className="bg-mage-bg-900 border-t border-mage-dark-600 py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-2 sm:gap-4 text-sm">
            <span className="text-gray-400">
              {t("footer.mageNoirCopyright")}
            </span>
            <span className="hidden sm:inline text-gray-600">•</span>
            <a
              href={getMageNoirUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-mage-primary-400 hover:text-mage-primary-300 transition-colors duration-200"
            >
              {t("footer.mageNoirLink")}
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span className="text-gray-500 text-xs">
              {t("footer.mageNoirCredits")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MageNoirFooter;
