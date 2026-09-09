import { Suspense } from "react";
import { Building2 } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-6" />
          </div>
          <h1 className="text-xl font-semibold">Ordner</h1>
          <p className="text-sm text-muted-foreground">
            Zentrale Steuerung für Abteilungen, Themen und Aufgaben
          </p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>

        <div className="mt-5 rounded-lg border bg-card/50 p-4 text-xs text-muted-foreground">
          <p className="mb-1.5 font-medium text-foreground">Demo-Zugänge</p>
          <ul className="space-y-0.5">
            <li>admin@ordner.app · admin123 (Administrator)</li>
            <li>anna.krause@ordner.app · demo123 (Führungskraft)</li>
            <li>jan.weber@ordner.app · demo123 (Mitarbeiter)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
