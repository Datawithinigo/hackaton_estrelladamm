import { useState } from 'react';
import { LogIn, Mail, User, Calendar, Users } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin(email);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFF5F5] to-[#FFFBF0] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#333333] mb-4">
            Bienvenido de vuelta
          </h1>
          <p className="text-xl text-[#666666]">
            Ingresa tu email para continuar
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#333333] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#F5F5F5] rounded-xl focus:border-[#C8102E] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#C8102E] to-[#D4AF37] text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Iniciar sesión
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#F5F5F5] text-center">
            <p className="text-[#666666] mb-3">
              ¿No tienes cuenta?
            </p>
            <button
              onClick={onSwitchToRegister}
              className="text-[#C8102E] hover:text-[#D4AF37] font-bold transition-colors"
            >
              Regístrate aquí
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <User className="w-6 h-6 text-[#C8102E] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#666666]">Perfil</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <Users className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#666666]">Conectar</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <Calendar className="w-6 h-6 text-[#C8102E] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#666666]">Eventos</p>
          </div>
        </div>
      </div>
    </section>
  );
}
