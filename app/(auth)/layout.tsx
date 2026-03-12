import "@/styles/components.css"
import AuthSidebar from "@/components/shared/AuthSidebar";

const AuthLayout = ({children }: { children: React.ReactNode }) => {
  return (
    <main className="main h-full w-full flex flex-row">
      <section className="left-container-section">
        <AuthSidebar />
      </section>
      <section className="right-container-section">
        {children}
      </section>
    </main>
  );
}

export default AuthLayout;