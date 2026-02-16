import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { StoryPage } from './components/StoryPage';
import { NewsletterPage } from './components/NewsletterPage';
import { AboutPage } from './components/AboutPage';
import { AdvertisePage } from './components/AdvertisePage';
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { Footer } from './components/Footer';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-paper selection:bg-brand-200 selection:text-brand-900 font-sans">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/newsletter" element={<NewsletterPage />} />
            <Route path="/story/:id" element={<StoryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/advertise" element={<AdvertisePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;