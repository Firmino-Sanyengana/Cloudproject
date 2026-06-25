import { useAuthStore } from "@/store/auth";
import { User, Mail, Shield, Calendar } from "lucide-react";

export default function Profile() {
  const { user } = useAuthStore();
  if (!user) return null;
  return (
    <div className="max-w-2xl mx-auto card p-8">
      <h1 className="text-3xl font-bold mb-6">Meu perfil</h1>
      <ul className="space-y-3 text-sm">
        <li className="flex items-center gap-3"><User className="text-brand-600" /> <span className="font-medium">Nome:</span> {user.name}</li>
        <li className="flex items-center gap-3"><Mail className="text-brand-600" /> <span className="font-medium">E-mail:</span> {user.email}</li>
        <li className="flex items-center gap-3"><Shield className="text-brand-600" /> <span className="font-medium">Perfil:</span> {user.role}</li>
      </ul>
    </div>
  );
}
