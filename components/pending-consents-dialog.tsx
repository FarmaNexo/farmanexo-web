"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAcceptPendingConsents,
  useConsentsStatus,
  useIsAuthenticated,
  useLogout,
} from "@/hooks/use-auth";
import { AlertTriangle, FileText, Loader2, LogOut, ShieldCheck } from "lucide-react";
import type { ConsentType } from "@/lib/api/types";

const LABEL: Record<ConsentType, string> = {
  terms_of_service: "Términos de uso",
  privacy_policy: "Política de privacidad",
  marketing_communications: "Comunicaciones de marketing",
};

const LINK: Partial<Record<ConsentType, string>> = {
  terms_of_service: "/terminos",
  privacy_policy: "/privacidad",
};

export function PendingConsentsDialog() {
  const { isAuthenticated } = useIsAuthenticated();
  const statusQuery = useConsentsStatus(isAuthenticated);
  const acceptMutation = useAcceptPendingConsents();
  const logoutMutation = useLogout();

  const pending = statusQuery.data?.pending ?? [];
  const isOpen = isAuthenticated && pending.length > 0;

  const [accepted, setAccepted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) {
      setAccepted({});
    }
  }, [isOpen]);

  const allAccepted = useMemo(
    () => pending.length > 0 && pending.every((p) => accepted[p.consent_type]),
    [pending, accepted]
  );

  const handleSubmit = () => {
    if (!allAccepted) return;
    acceptMutation.mutate(
      { consent_types: pending.map((p) => p.consent_type) },
      {
        onSuccess: () => {
          toast.success("Consentimientos actualizados");
        },
        onError: (err) => {
          toast.error("No se pudo registrar la aceptación", {
            description: err.message,
          });
        },
      }
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        /* blocking: ignora solicitudes de cerrar */
      }}
    >
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-brand-pink" />
            Actualizamos nuestros documentos legales
          </DialogTitle>
          <DialogDescription>
            Para seguir usando FarmaNexo, necesitamos que aceptes las nuevas
            versiones de los siguientes documentos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {pending.map((p) => {
            const label = LABEL[p.consent_type] ?? p.consent_type;
            const link = LINK[p.consent_type];
            return (
              <div
                key={p.consent_type}
                className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    id={`pc-${p.consent_type}`}
                    checked={accepted[p.consent_type] === true}
                    onCheckedChange={(checked) =>
                      setAccepted((prev) => ({
                        ...prev,
                        [p.consent_type]: checked === true,
                      }))
                    }
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={`pc-${p.consent_type}`}
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    Acepto la versión actualizada de{" "}
                    {link ? (
                      <Link
                        href={link}
                        target="_blank"
                        className="text-[#db1a85] hover:underline"
                      >
                        {label}
                      </Link>
                    ) : (
                      <span className="font-medium">{label}</span>
                    )}
                  </label>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pl-7">
                  <FileText className="size-3" />
                  Versión requerida: {p.required_version}
                  {p.current_accepted_version && (
                    <>
                      · tienes aceptada:{" "}
                      <span className="font-mono">
                        {p.current_accepted_version}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <p>
            Si no aceptas, puedes cerrar sesión. Tu cuenta permanecerá intacta,
            pero no podrás usar la plataforma hasta aceptar los documentos
            actualizados.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="size-4 mr-2" />
            Cerrar sesión
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!allAccepted || acceptMutation.isPending}
            className="bg-brand-pink hover:bg-brand-pink/90"
          >
            {acceptMutation.isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : null}
            Aceptar y continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
