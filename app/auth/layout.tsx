import "@/styles/components.css"
import AuthSidebar from "@/components/shared/AuthSidebar";

const AuthLayout = ({children }: { children: React.ReactNode }) => {
  return (
    <main className="flex h-full w-full items-center justify-center">
      <section className="flex flex-col w-1/3 h-full bg-gray-900 left-container-section shadow-lg">
        <AuthSidebar />
      </section>
      {children}
    </main>
  );
}

export default AuthLayout;