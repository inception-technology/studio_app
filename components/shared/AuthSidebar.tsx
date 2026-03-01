import Link from "next/link";
import Image from "next/image";
import "@/styles/components.css"

export default function AuthSidebar() {
  return (
    <>
      <Link href="/" className="logo-link">
        <Image src="/logo_dojang.png" alt="logo" width={150} height={150} className="logo-img"/>
      </Link>
      <div className="content-container">
        <h1 className="title">DOJANG STUDIO</h1>
        <p className="subtitle">Manage your Taekwondo studios with ease.</p>
      </div>
    </>
  );
}