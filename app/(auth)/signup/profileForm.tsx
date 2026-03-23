"use client";
import { motion } from "motion/react";
import { useState, useEffect } from 'react';
import { ArrowRight, Brain, BuildingIcon, Check, GroupIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { fetchReferences } from "@/lib/references";

const PROFILES = [
  {
    id_profile: 1,
    buttonClass: "border-organization bg-organization/5 shadow-sm hover:border-organization/20",
    isSelected: "bg-organization scale-110",
    iconWrapClass: "bg-organization",
  },
  {
    id_profile: 2,
    buttonClass: "border-staff bg-staff/5 shadow-sm hover:border-staff/20",
    isSelected: "bg-staff scale-110",
    iconWrapClass: "bg-staff",
  },
  {
    id_profile: 3,
    buttonClass: "border-member bg-member/5 shadow-sm hover:border-member/20",
    isSelected: "bg-member scale-110",
    iconWrapClass: "bg-member",
  },
] as const;

type ApiProfile = {
  id_profile: number;
  label?: string;
  title?: string;
  description?: string;
};

type Profile = {
  id_profile: number;
  title: string;
  description: string;
  buttonClass: string;
  isSelected: string;
  iconWrapClass: string;
};

type ProfileStylePreset = {
  buttonClass: string;
  isSelected: string;
  iconWrapClass: string;
};

const DEFAULT_PROFILE_PRESET: ProfileStylePreset = {
  buttonClass: "border-grey bg-grey/5 shadow-sm",
  isSelected: "bg-grey scale-110",
  iconWrapClass: "bg-gray-400",
};

const PROFILE_STYLE_BY_ID = new Map<number, ProfileStylePreset>(
  PROFILES.map((profile) => [
    profile.id_profile,
    {
      buttonClass: profile.buttonClass,
      isSelected: profile.isSelected,
      iconWrapClass: profile.iconWrapClass,
    },
  ]),
);

function isApiProfile(value: unknown): value is ApiProfile {
  // Basic validation to check if the object has the required structure of ApiProfile
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ApiProfile>;
  return typeof candidate.id_profile === "number";
}

function normalizeProfiles(data: unknown): ApiProfile[] {
  // The API might return a single object, an array, or an object with profiles as values. We need to handle these cases.
  if (Array.isArray(data)) {
    return data.filter(isApiProfile);
  }
  if (isApiProfile(data)) {
    return [data];
  }
  if (data && typeof data === "object") {
    return Object.values(data).filter(isApiProfile);
  }
  return [];
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function mergeProfiles(apiProfiles: ApiProfile[]): Profile[] {
  if (apiProfiles.length === 0) {
    return PROFILES.map((base) => ({
      id_profile: base.id_profile,
      title: `profile_${base.id_profile}`,
      description: `profile_${base.id_profile}_description`,
      buttonClass: base.buttonClass,
      isSelected: base.isSelected,
      iconWrapClass: base.iconWrapClass,
    }));
  }

  return apiProfiles.map((apiProfile) => {
    const preset = PROFILE_STYLE_BY_ID.get(apiProfile.id_profile) ?? DEFAULT_PROFILE_PRESET;
    return {
      id_profile: apiProfile.id_profile,
      title: apiProfile.title ?? `profile_${apiProfile.id_profile}`,
      description: apiProfile.description ?? `profile_${apiProfile.id_profile}_description`,
      buttonClass: preset.buttonClass,
      isSelected: preset.isSelected,
      iconWrapClass: preset.iconWrapClass,
    };
  });
}

export default function ProfileForm({ onContinue }: { onContinue?: (profileId: number) => void }) {

  const t = useTranslations("ProfileForm");
  const [selectedProfile, setSelectedProfile] = useState<number>(1);
  const [profiles, setProfiles] = useState<Profile[]>(() => mergeProfiles([]));
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchReferences<ApiProfile>("profiles", normalizeProfiles).then((data) => {
    const mergedProfiles = mergeProfiles(data);
    setProfiles(mergedProfiles);
    setSelectedProfile((current) =>
      mergedProfiles.some((profile) => profile.id_profile === current)
        ? current
        : (mergedProfiles[0]?.id_profile ?? current),
    );
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      try {
          window.localStorage.setItem("profile_id", selectedProfile.toString());
      } catch {}

      if (onContinue) {
        onContinue(selectedProfile);
        return;
      }
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
          <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
          >
              <h2 className="text-3xl font-bold text-gray-900">{t("title")}</h2>
                  <p className="text-gray-600 mt-2">{t("subtitle")}</p>
          </motion.div>

          <div className="space-y-4">
              {profiles.map((profile, index) => {
                const isSelected = selectedProfile === profile.id_profile;
                  return (
                          <motion.button
                          key={profile.id_profile}
                              type="button"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + index * 0.1 }}
                              onClick={() => setSelectedProfile(profile.id_profile)}
                              className={`
                                w-full 
                                p-2 
                                rounded-2xl 
                                border-2 
                                transition-all 
                                duration-300 
                                text-left 
                                ${isSelected ? `${profile.buttonClass}` : `border-gray-100 bg-white`}`} 
                              >
                              <div className="flex items-center justify-between m-2">
                                <div className="flex items-center">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 ${profile.iconWrapClass}`}>
                                <span
                                  className="material-icons text-white"
                                  aria-label="logo"
                                >{"sports_martial_arts"}</span>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 leading-tight">
                                  {t.has(`profiles.${profile.title}`)
                                    ? t(`profiles.${profile.title}`)
                                    : capitalize(profile.title)}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  {t.has(`profiles.${profile.description}`)
                                    ? t(`profiles.${profile.description}`)
                                    : capitalize(profile.description)}
                                </p>
                              </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 
                                ${isSelected ? `${profile.isSelected}` : "border-2 border-gray-200"}`}
                                >{isSelected && <Check className="w-4 h-4 text-white" />}
                                </div>
                          </div>
                          </motion.button>
                  );
              })}
          </div>

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
                    "
                >
                    <span className="text-lg">{loading ? t("submitting") : t("submit")}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
      </motion.form>
      </div>
  </>
  );
}