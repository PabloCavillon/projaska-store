import LoginForm from "@/components/auth/login-form";
import { osdFont } from "@/lib/fonts";


export const metadata = {
  title: 'Login', 
};

export default function LoginPage() {
  return (
    <main className={`admin ${osdFont.variable} min-h-screen w-full flex items-center justify-center bg-zinc-50 p-4`}>
      <section className="w-full max-w-100 admin-focus">
        <LoginForm />
      </section>
    </main>
  );
}