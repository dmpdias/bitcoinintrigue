
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { StoryPage } from './components/StoryPage';
import { NewsletterPage } from './components/NewsletterPage';
import { ArticlesPage } from './components/ArticlesPage';
import { AboutPage } from './components/AboutPage';
import { AdvertisePage } from './components/AdvertisePage';
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { Footer } from './components/Footer';
import { BackOffice } from './components/Admin/BackOffice';
import { Login } from './components/Admin/Login';
import { ProtectedRoute } from './components/Admin/ProtectedRoute';
import { storageService } from './services/storageService';

function App() {
  useEffect(() => {
    storageService.initialize();
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-paper selection:bg-brand-200 selection:text-brand-900 font-sans">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/newsletter" element={<NewsletterPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/story/:id" element={<StoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/advertise" element={<AdvertisePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <BackOffice />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
