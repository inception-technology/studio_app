import Link from "next/link";
import "@/styles/components.css"
import { getTranslations } from "next-intl/server";

export default async function AuthSidebar() {
  const t = await getTranslations("AuthSidebar");

  return (
    <>
      <Link href="/" className="logo-link flex items-center gap-4">
        <span
          className="material-icons bg-organization text-white"
          aria-label={t("logoAlt")}
        >{"sports_martial_arts"}</span>
      </Link>
      <div className="content-container">
        <h1 className="title">{t("title")}</h1>
        <p className="subtitle">{t("subtitle")}</p>
      </div>
    </>
  );
}