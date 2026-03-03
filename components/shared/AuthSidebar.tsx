import Link from "next/link";
import Image from "next/image";
import "@/styles/components.css"
import { getTranslations } from "next-intl/server";

export default async function AuthSidebar() {
  const t = await getTranslations("AuthSidebar");

  return (
    <>
      <Link href="/" className="logo-link">
        <Image src="/logo_dojang.png" alt={t("logoAlt")} width={150} height={150} className="logo-img"/>
      </Link>
      <div className="content-container">
        <h1 className="title">{t("title")}</h1>
        <p className="subtitle">{t("subtitle")}</p>
      </div>
    </>
  );
}