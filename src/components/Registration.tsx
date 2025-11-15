import { useState } from 'react';
import { Check } from 'lucide-react';

interface RegistrationProps {
  onRegister: (data: { name: string; age: number; gender: string }) => void;
  isLoggedIn: boolean;
}

export default function Registration({ onRegister, isLoggedIn }: RegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    orientation: '',
    ageConfirm: false,
    termsAccept: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ageConfirm && formData.termsAccept && parseInt(formData.age) >= 18) {
      onRegister({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender
      });
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
                Únete al juego
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

              <p className="text-xs text-[#999999] text-center mt-4">
                Sin rollos raros, sin creeps. Solo gente que también escaneó la misma botella que tú
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
