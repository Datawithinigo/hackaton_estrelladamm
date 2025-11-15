import { useState } from 'react';
import { User, Calendar, Users, MessageSquare } from 'lucide-react';

interface OnboardingProps {
  email: string;
  onComplete: (name: string, age: number, gender: 'hombre' | 'mujer', bio: string) => void;
}

export default function Onboarding({ email, onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'hombre' | 'mujer' | ''>('');
  const [bio, setBio] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && gender && bio && bio.length >= 20) {
      onComplete(name, Number(age), gender as 'hombre' | 'mujer', bio);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFF5F5] to-[#FFFBF0] py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#C8102E] to-[#D4AF37] rounded-full mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mb-4">
            Completa tu perfil para empezar
          </h1>
          <p className="text-sm text-[#999999]">
            Iniciaste sesión con: <span className="font-medium text-[#C8102E]">{email}</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#333333] mb-2">
                Nombre
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="¿Cómo te llamas?"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#F5F5F5] rounded-xl focus:border-[#C8102E] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#333333] mb-2">
                Edad
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="18"
                  min="18"
                  max="99"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#F5F5F5] rounded-xl focus:border-[#C8102E] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#333333] mb-2">
                Sexo
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'hombre' | 'mujer')}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#F5F5F5] rounded-xl focus:border-[#C8102E] outline-none transition-colors appearance-none bg-white"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#333333] mb-2">
                Cuéntanos sobre ti
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-[#999999]" />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Me gusta salir de bares, conocer gente nueva y disfrutar de una buena cerveza..."
                  rows={4}
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#F5F5F5] rounded-xl focus:border-[#C8102E] outline-none transition-colors resize-none"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-[#999999]">
                Mínimo 20 caracteres para que otros usuarios te conozcan mejor
              </p>
            </div>

            <button
              type="submit"
              disabled={!name || !age || !gender || !bio || bio.length < 20}
              className="w-full bg-gradient-to-r from-[#C8102E] to-[#D4AF37] text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Completar perfil y empezar
            </button>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-[#C8102E] rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold">1</span>
            </div>
            <p className="text-xs font-medium text-[#666666]">Completa perfil</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-[#CCCCCC] rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold">2</span>
            </div>
            <p className="text-xs font-medium text-[#999999]">Consigue estrellas</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-[#CCCCCC] rounded-full mx-auto mb-2 flex items-center justify-center">
              <span className="text-white font-bold">3</span>
            </div>
            <p className="text-xs font-medium text-[#999999]">Conecta</p>
          </div>
        </div>
      </div>
    </section>
  );
}
