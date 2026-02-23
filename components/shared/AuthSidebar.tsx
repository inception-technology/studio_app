import Link from "next/link";
import Image from "next/image";
import "@/styles/components.css"

export default function AuthSidebar() {
  const currentYear = new Date().getFullYear();
  return (
    <>
      <Link href="/" className="flex items-center justify-center w-full pt-20">
        <Image src="/logo_dojang.png" alt="logo" width={150} height={150} />
      </Link>
      <h1 className="text-4xl font-bold text-white mt-6 text-center">DOJANG STUDIO</h1>
      <p className="text-gray-400 mt-4 text-center">Manage your Taekwondo studios with ease.</p>
      <div className="mt-10 text-center left-sidebar-footer">
        <small className="text-gray-500 font-light">
          &copy; {currentYear} <Link href="https://kombart.com" target="_blank" rel="noopener noreferrer">Kombart</Link> - <Link href="https://kombart.com" target="_blank" rel="noopener noreferrer">Terms and Privacy Policy</Link>
        </small>
      </div>
    </>
  );
}