import "@/styles/components.css"
import AuthSidebar from "@/components/shared/AuthSidebar";

const AuthLayout = ({children }: { children: React.ReactNode }) => {
  return (
    <main className="main">
      <section className="left-container-section">
        <AuthSidebar />
      </section>
      {children}
    </main>
  );
}

export default AuthLayout;