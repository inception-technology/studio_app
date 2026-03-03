"use client";
import { motion } from "motion/react";
import { useState } from 'react';
import { ArrowRight, Brain, BuildingIcon, Check, GroupIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const PROFILES = [
    {
        id: 1,
        title: "Organization owner",
        description: "Headquarters, Leagues, Clubs, and Dojangs.",
        icon: BuildingIcon,
        buttonClass: "bg-organization/10 text-organization hover:bg-organization/20 shadow-lg shadow-organization/25",
        iconWrapClass: "bg-organization/10",
        iconClass: "text-organization",
        color: "organization",
    },
    {
        id: 2,
        title: "Studio staff",
        description: "Coach, assistant, and administrative staff.",
        icon: Brain,
        buttonClass: "bg-staff/10 text-staff hover:bg-staff/20 shadow-lg shadow-staff/25",
        iconWrapClass: "bg-staff/10",
        iconClass: "text-staff",
        color: "staff",
    },
    {
        id: 3,
        title: "Member & Family",
        description: "Members and family accounts.",
        icon: GroupIcon,
        buttonClass: "bg-member/10 text-member hover:bg-member/20 shadow-lg shadow-member/25",
        iconWrapClass: "bg-member/10",
        iconClass: "text-member",
        color: "member",
    },
] as const;

export default function ProfileForm({ onContinue }: { onContinue?: (profileId: number) => void }) {
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
        {/* Decorative Background Blurs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1 flex flex-col px-8 pt-16 pb-12 relative z-10">
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
                <h2 className="text-3xl font-bold text-gray-900">Choose your profile</h2>
                    <p className="text-gray-600 mt-2">Please select your profile type to continue.</p>
            </motion.div>

            <div className="space-y-4 flex-1">
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
                                className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                                  isSelected ? `border-${profile.color} bg-${profile.color}/5 shadow-sm` : `border-gray-100 bg-white hover:border-${profile.color}/20`
                                }`}
                        >
                                <div className="flex items-center justify-between mb-5">
                                  <div className="flex items-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 ${profile.iconWrapClass}`}>
                                    <Icon className={profile.iconClass} size={28} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{profile.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{profile.description}</p>
                                </div>
                                  </div>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isSelected ? `bg-${profile.color} scale-110` : "border-2 border-gray-200"
                                  }`}>
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
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
                      <span className="text-lg">{loading ? "...setting profile" : "Next"}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
        </motion.form>
        </div>
    </>
    );
}