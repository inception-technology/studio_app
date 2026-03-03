"use client";
import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from "next/navigation";

interface Language {
  code: string;
  name_us: string;
  nativeName: string;
  flagUrl: string;
}

const LANGUAGES: Language[] = [
  {
    code: 'en',
    name_us: 'English',
    nativeName: 'English',
    flagUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=100&h=100',
  },
  {
    code: 'fr',
    name_us: 'French',
    nativeName: 'Français',
    flagUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=100&h=100',
  },
  {
    code: 'cn',
    name_us: 'Chinese',
    nativeName: '中文',
    flagUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&q=80&w=100&h=100',
  },
];

export default function LanguageForm({ onContinue }: { onContinue?: (langCode: string) => void }) {
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Optionnel: persister la langue pour la suite
    try {
      window.localStorage.setItem("lang", selectedLang);
    } catch {}
    if (onContinue) {
      onContinue(selectedLang);
      return; // le parent va swap le composant
    }
    // Fallback si LanguageForm est utilisé seul
    router.replace("/");
  };

  return (
    <>
        <div className="flex flex-col p-5 relative z-10 mb-5">
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="flex flex-col h-full"
        >
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900">Welcome</h2>
            <p className="text-gray-600 mt-2">Please select your language to start.</p>
          </motion.div>

          {/* Language List */}
          <div className="space-y-4">
            {LANGUAGES.map((lang, index) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => setSelectedLang(lang.code)}
                className={`
                  w-full 
                  flex 
                  items-center 
                  justify-between 
                  p-4 
                  rounded-2xl 
                  border-2 
                  transition-all 
                  duration-300 
                  ${selectedLang === lang.code 
                    ? 'border-organization bg-organization/5 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-organization/20'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                    <Image 
                      src={lang.flagUrl} 
                      alt={lang.name_us}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${selectedLang === lang.code ? 'text-gray-900' : 'text-gray-700'}`}>
                      {lang.name_us}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {lang.nativeName}
                    </p>
                  </div>
                </div>
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedLang === lang.code 
                    ? 'bg-organization scale-110' 
                    : 'border-2 border-gray-200'
                }`}>
                  {selectedLang === lang.code && <Check className="w-4 h-4 text-white" />}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer Action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-auto pt-8"
          >
            <motion.button
                type="submit"
                disabled={loading}
                className="
                w-full 
                bg-organization 
                hover:bg-organization/90 
                text-white 
                font-bold 
                py-5 
                rounded-2xl 
                shadow-lg 
                shadow-organization/25 
                transition-all 
                active:scale-[0.98] 
                flex 
                items-center 
                justify-center 
                space-x-3 
                group
                cursor-pointer   
                disabled:cursor-not-allowed 
                disabled:opacity-50
                ">
                <span className="text-lg">{loading ? "...setting language" : "Next"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

        </motion.form>  
        </div>
      </>
  );
}
