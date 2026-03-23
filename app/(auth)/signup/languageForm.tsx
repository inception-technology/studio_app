"use client";
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { fetchReferences } from "@/lib/references";

interface Language {
  code_language: string;
  name_us: string;
  native_name: string;
  flag_url: string;
}

function normalizeLocaleCode(value: string): "en" | "fr" | "cn" {
  const normalized = value.trim().toLowerCase().replace("_", "-");
  if (normalized === "fr" || normalized.startsWith("fr-") || normalized === "french") {
    return "fr";
  }
  if (
    normalized === "cn" ||
    normalized === "zh" ||
    normalized.startsWith("zh-") ||
    normalized === "chinese"
  ) {
    return "cn";
  }
  return "en";
}

function isLanguage(value: unknown): value is Language {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Language>;
  return (
    typeof candidate.code_language === "string" &&
    typeof candidate.name_us === "string" &&
    typeof candidate.native_name === "string" &&
    typeof candidate.flag_url === "string"
  );
}

function normalizeLanguages(data: unknown): Language[] {
  if (Array.isArray(data)) {
    return data.filter(isLanguage);
  }
  if (isLanguage(data)) {
    return [data];
  }
  if (data && typeof data === "object") {
    return Object.values(data).filter(isLanguage);
  }
  return [];
}

export default function LanguageForm({ onContinue }: { onContinue?: (langCode: string) => void }) {
  const t = useTranslations("LanguageForm");
  const locale = useLocale();
  const [selectedLang, setSelectedLang] = useState<string>(normalizeLocaleCode(locale));
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const applyLocale = async (langCode: string) => {
    const safeLangCode = normalizeLocaleCode(langCode);
    setSelectedLang(safeLangCode);
    try {
      window.localStorage.setItem("language_code", safeLangCode);
    } catch {}

    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: safeLangCode }),
      cache: "no-store",
      credentials: "include",
    }).catch(() => null);

    if (safeLangCode !== normalizeLocaleCode(locale)) {
      router.refresh();
    }
  };

  useEffect(() => {
    fetchReferences<Language>("languages", normalizeLanguages).then((data) => {
      setLanguages(data);
    });
  }, []);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Persist locale selection for next-intl + local flow
    await applyLocale(selectedLang);
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
            <h2 className="text-3xl font-bold text-gray-900">{t("title")}</h2>
            <p className="text-gray-600 mt-2">{t("subtitle")}</p>
          </motion.div>

          {/* Language List */}
          <div className="space-y-4">
            {languages.map((lang, index) => (
              (() => {
                const langCode = normalizeLocaleCode(lang.code_language);
                return (
              <motion.button
                type="button"
                key={`${lang.code_language}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => {
                  void applyLocale(langCode);
                }}
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
                  ${selectedLang === langCode 
                    ? 'border-organization bg-organization/5 shadow-sm' 
                    : 'border-gray-100 bg-white hover:border-organization/20'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                    <Image 
                      src={lang.flag_url} 
                      alt={lang.name_us}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${selectedLang === langCode ? 'text-gray-900' : 'text-gray-700'}`}>
                      {t.has(`languages.${langCode}.name`) ? t(`languages.${langCode}.name`) : lang.name_us}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {t.has(`languages.${langCode}.native`) ? t(`languages.${langCode}.native`) : lang.native_name}
                    </p>
                  </div>
                </div>
                
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedLang === langCode 
                    ? 'bg-organization scale-110' 
                    : 'border-2 border-gray-200'
                }`}>
                  {selectedLang === langCode && <Check className="w-4 h-4 text-white" />}
                </div>
              </motion.button>
                );
              })()
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
                <span className="text-lg">{loading ? t("submitting") : t("submit")}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

        </motion.form>  
        </div>
      </>
  );
}
