import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Registration from './Registration';
import Footer from './Footer';
import { User } from '../lib/supabase';

interface LandingProps {
  onRegister: (name: string, age: number, gender: 'hombre' | 'mujer', email: string, bio: string) => void;
}

export default function Landing({ onRegister }: LandingProps) {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Registration onRegister={onRegister} />
      <Footer />
    </>
  );
}
