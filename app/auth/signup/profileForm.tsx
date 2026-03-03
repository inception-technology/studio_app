"use client";
import { motion } from "motion/react";
import { useState } from 'react';
import { ArrowRight, Brain, BuildingIcon, Check, GroupIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const PROFILES = [
    {
        id: 1,
        titleKey: "organizationOwnerTitle",
        descriptionKey: "organizationOwnerDescription",
        icon: BuildingIcon,
        buttonClass: "border-organization bg-organization/5 shadow-sm",
        //buttonClass: "bg-organization/10 text-organization hover:bg-organization/20 shadow-lg shadow-organization/25",
        isSelected: "bg-organization scale-110",
        iconWrapClass: "bg-organization/10",
        iconClass: "text-organization",
        color: "organization",
    },
    {
        id: 2,
        titleKey: "studioStaffTitle",
        descriptionKey: "studioStaffDescription",
        icon: Brain,
        buttonClass: "border-staff bg-staff/5 shadow-sm",
        //buttonClass: "bg-staff/10 text-staff hover:bg-staff/20 shadow-lg shadow-staff/25",
        isSelected: "bg-staff scale-110",
        iconWrapClass: "bg-staff/10",
        iconClass: "text-staff",
        color: "staff",
    },
    {
        id: 3,
        titleKey: "memberFamilyTitle",
        descriptionKey: "memberFamilyDescription",
        icon: GroupIcon,
        buttonClass: "border-member bg-member/5 shadow-sm",
        //buttonClass: "bg-member/10 text-member hover:bg-member/20 shadow-lg shadow-member/25",
        isSelected: "bg-member scale-110",
        iconWrapClass: "bg-member/10",
        iconClass: "text-member",
        color: "member",
    },
] as const;

export default function ProfileForm({ onContinue }: { onContinue?: (profileId: number) => void }) {
    const t = useTranslations("ProfileForm");
    const [selectedProfile, setSelectedProfile] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
                {PROFILES.map((profile, index) => {
                    const Icon = profile.icon;
                        const isSelected = selectedProfile === profile.id;
                    return (
                            <motion.button
                            key={profile.id}
                                type="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                onClick={() => setSelectedProfile(profile.id)}
                                className={`w-full p-2 rounded-2xl border-2 transition-all duration-300 text-left 
                                    ${isSelected ? `${profile.buttonClass}` : `border-gray-100 bg-white`}`} 
                                >
                                <div className="flex items-center justify-between mb-5">
                                  <div className="flex items-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 ${profile.iconWrapClass}`}>
                                    <Icon className={profile.iconClass} size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{t(`profiles.${profile.titleKey}`)}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{t(`profiles.${profile.descriptionKey}`)}</p>
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