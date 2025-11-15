import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Registration from './components/Registration';
import Dashboard from './components/Dashboard';
import Map from './components/Map';
import Messaging from './components/Messaging';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    stars: 0,
    level: 'Bronce'
  });

  useEffect(() => {
    const smoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.slice(1);
        const element = document.getElementById(id || '');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', smoothScroll);
    return () => document.removeEventListener('click', smoothScroll);
  }, []);

  const handleRegistration = (data: { name: string }) => {
    setUserData({ name: data.name, stars: 0, level: 'Bronce' });
    setIsLoggedIn(true);
  };

  const handleAddStar = () => {
    setUserData(prev => {
      const newStars = prev.stars + 1;
      let newLevel = 'Bronce';
      if (newStars >= 31) newLevel = 'Oro';
      else if (newStars >= 11) newLevel = 'Plata';
      return { ...prev, stars: newStars, level: newLevel };
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header isLoggedIn={isLoggedIn} />
      <Hero />
      <HowItWorks />
      <Registration onRegister={handleRegistration} isLoggedIn={isLoggedIn} />
      {isLoggedIn && (
        <Dashboard userData={userData} onAddStar={handleAddStar} />
      )}
      <Map />
      <Messaging />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
