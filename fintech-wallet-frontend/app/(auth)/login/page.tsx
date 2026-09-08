import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      subtitle="Use the email and password from your wallet account. A JWT is stored locally and sent as a Bearer token."
    >
      <LoginForm />
    </AuthShell>
  );
}
