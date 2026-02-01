import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import CardsPage from "./pages/CardsPage";
import DecksPage from "./pages/DecksPage";
import EditDeckPage from "./pages/EditDeckPage";
import DeckDetailPage from "./pages/DeckDetailPage";
import DeckVisualizationPage from "./pages/DeckVisualizationPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="app-container min-h-screen bg-mage-bg-900 w-full">
            <NavBar />

            {/* Contenu principal avec padding-top pour compenser la navbar fixe */}
            <main className="pt-16 w-full">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cards" element={<CardsPage />} />
                <Route path="/decks" element={<DecksPage />} />
                <Route path="/decks/:id" element={<DeckDetailPage />} />
                <Route path="/decks/:id/edit" element={<EditDeckPage />} />
                <Route
                  path="/decks/:id/visualization"
                  element={<DeckVisualizationPage />}
                />
                <Route
                  path="/profile"
                  element={
                    <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center w-full">
                      <div className="text-white text-2xl">
                        Page profil - À venir
                      </div>
                    </div>
                  }
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
