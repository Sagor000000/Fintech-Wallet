import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your wallet"
      subtitle="Registration calls POST /api/users/register. The backend hashes the password and opens a wallet with a 1000.00 starting balance."
    >
      <RegisterForm />
    </AuthShell>
  );
}
