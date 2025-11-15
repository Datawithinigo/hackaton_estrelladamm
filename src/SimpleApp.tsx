import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Auth from './components/Auth';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

type Page = 'home' | 'faq' | 'auth';

function SimpleApp() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleAuth = async (email: string, password: string) => {
    console.log('Auth attempt:', email, password);
    alert('Auth system working! Email: ' + email);
  };

  const handleGoogleAuth = async () => {
    console.log('Google auth attempt');
    alert('Google auth system working!');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'auth':
        return (
          <div className="min-h-screen bg-white">
            <Auth onAuth={handleAuth} onGoogleAuth={handleGoogleAuth} />
          </div>
        );

      case 'faq':
        return (
          <div className="min-h-screen bg-white">
            <Header
              isLoggedIn={false}
              currentPage={currentPage}
              onNavigate={(page: any) => setCurrentPage(page as Page)}
            />
            <div className="pt-20">
              <FAQ />
            </div>
            <Footer />
          </div>
        );

      case 'home':
      default:
        return (
          <div className="min-h-screen bg-white">
            <Header
              isLoggedIn={false}
              currentPage={currentPage}
              onNavigate={(page: any) => setCurrentPage(page as Page)}
            />
            <div className="pt-20">
              <Hero />
              <HowItWorks />
              <section id="registro" className="py-20 bg-gradient-to-br from-[#C8102E] to-[#8B0A1F]">
                <div className="container mx-auto px-4 text-center">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                    ¿Listo para empezar?
                  </h2>
                  <button
                    onClick={() => setCurrentPage('auth')}
                    className="bg-white text-[#C8102E] px-12 py-4 rounded-xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    Únete al juego
                  </button>
                </div>
              </section>
            </div>
            <Footer />
          </div>
        );
    }
  };

  console.log('🎯 SimpleApp rendering, current page:', currentPage);

  return renderPage();
}

export default SimpleApp;