import { useState } from 'react';
import { Check, Mail, Lock } from 'lucide-react';

interface RegistrationProps {
  onRegister: (name: string, age: number, gender: string, email: string, password: string, orientation?: string) => void;
  onGoogleRegister: () => void;
  isLoggedIn: boolean;
}

export default function Registration({ onRegister, onGoogleRegister, isLoggedIn }: RegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    password: '',
    orientation: '',
    ageConfirm: false,
    termsAccept: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ageConfirm && formData.termsAccept && parseInt(formData.age) >= 18) {
      onRegister(
        formData.name,
        parseInt(formData.age),
        formData.gender,
        formData.email,
        formData.password,
        formData.orientation || undefined
      );
    }
  };

  if (isLoggedIn) {
    return null;
  }

  return (
    <section id="registro" className="py-20 bg-gradient-to-br from-[#C8102E] to-[#8B0A1F]">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-[#333333] mb-4">
                Encuentra tu Estrella!
              </h2>
              <p className="text-[#666666] italic">
                Dos minutos rellenando esto, muchas noches de chat interesante
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#333333] mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none transition-colors"
                  placeholder="¿Cómo te llaman?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#333333] mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none transition-colors"
                  placeholder="Solo mayores de edad"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#333333] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#333333] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#999999]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none transition-colors"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#333333] mb-2">
                  Sexo
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none transition-colors bg-white"
                >
                  <option value="">Selecciona</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="nobinario">No binario</option>
                  <option value="nodecir">Prefiero no decir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#333333] mb-2">
                  Orientación sexual <span className="text-[#D4AF37] font-normal">(Opcional)</span>
                </label>
                <select
                  value={formData.orientation}
                  onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#F5F5F5] focus:border-[#C8102E] outline-none transition-colors bg-white"
                >
                  <option value="">Selecciona</option>
                  <option value="heterosexual">Heterosexual</option>
                  <option value="homosexual">Homosexual</option>
                  <option value="bisexual">Bisexual</option>
                  <option value="otra">Otra</option>
                  <option value="nodecir">Prefiero no decir</option>
                </select>
              </div>

              <div className="space-y-4 pt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      required
                      checked={formData.ageConfirm}
                      onChange={(e) => setFormData({ ...formData, ageConfirm: e.target.checked })}
                      className="appearance-none w-6 h-6 border-2 border-[#C8102E] rounded checked:bg-[#C8102E] cursor-pointer"
                    />
                    {formData.ageConfirm && (
                      <Check className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" />
                    )}
                  </div>
                  <span className="text-sm text-[#333333] group-hover:text-[#C8102E] transition-colors">
                    Confirmo que soy mayor de edad en mi país
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      required
                      checked={formData.termsAccept}
                      onChange={(e) => setFormData({ ...formData, termsAccept: e.target.checked })}
                      className="appearance-none w-6 h-6 border-2 border-[#C8102E] rounded checked:bg-[#C8102E] cursor-pointer"
                    />
                    {formData.termsAccept && (
                      <Check className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none" />
                    )}
                  </div>
                  <span className="text-sm text-[#333333] group-hover:text-[#C8102E] transition-colors">
                    Acepto los Términos y Condiciones y la Política de Privacidad
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C8102E] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#D4AF37] transition-all hover:scale-105 shadow-lg"
              >
                Crear mi cuenta
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E5E5]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-[#999999]">o continúa con</span>
              </div>
            </div>

            <button
              onClick={onGoogleRegister}
              type="button"
              className="w-full bg-white border-2 border-[#F5F5F5] text-[#333333] font-bold py-4 rounded-lg hover:shadow-lg hover:border-[#E5E5E5] transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Registrarme con Google
            </button>

            <p className="text-xs text-[#999999] text-center mt-6">
              Sin rollos raros, sin creeps. Solo gente que también escaneó la misma botella que tú
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
