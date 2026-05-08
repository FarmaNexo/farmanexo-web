"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { toast } from "sonner";
import { useFarmaNexoStore } from "@/lib/farmanexo-store";
import {
  useDeleteAccount,
  useIsAuthenticated,
  useMyConsents,
  useUpdateProfile,
} from "@/hooks/use-auth";
import { bffFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/query/keys";
import type {
  ConsentItem,
  Product,
  UpdateProfileRequest,
} from "@/lib/api/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Edit3,
  FileText,
  Heart,
  Loader2,
  Pill,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditFormState {
  full_name: string;
  phone: string;
  bio: string;
  date_of_birth: string;
}

function emptyForm(): EditFormState {
  return { full_name: "", phone: "", bio: "", date_of_birth: "" };
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const { favorites, toggleFavorite, searchRadius, setSearchRadius } =
    useFarmaNexoStore();
  const { user } = useIsAuthenticated();
  const updateProfile = useUpdateProfile();
  const consentsQuery = useMyConsents();
  const deleteAccount = useDeleteAccount();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>(emptyForm);
  const [preferences, setPreferences] = useState({
    preferGeneric: true,
    notifications: true,
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    setEditForm({
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      date_of_birth: user.date_of_birth ?? "",
    });
  }, [user]);

  const favoriteQueries = useQueries({
    queries: favorites.map((id) => ({
      queryKey: queryKeys.products.detail(id),
      queryFn: () =>
        bffFetch<Product>(`/api/products/${encodeURIComponent(id)}`),
      staleTime: 5 * 60 * 1000,
      retry: 1 as const,
    })),
  });

  const favoriteProducts = useMemo(() => {
    if (!mounted) return [] as Product[];
    return favoriteQueries
      .map((q) => q.data)
      .filter((p): p is Product => !!p);
  }, [mounted, favoriteQueries]);

  const isLoadingFavorites =
    mounted && favorites.length > 0 && favoriteQueries.some((q) => q.isLoading);

  const handleStartEdit = () => {
    if (!user) return;
    setEditForm({
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      date_of_birth: user.date_of_birth ?? "",
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({
      full_name: user?.full_name ?? "",
      phone: user?.phone ?? "",
      bio: user?.bio ?? "",
      date_of_birth: user?.date_of_birth ?? "",
    });
    setIsEditing(false);
  };

  const handleSaveProfile = () => {
    if (!user) return;

    const payload: UpdateProfileRequest = {};
    if (editForm.full_name !== (user.full_name ?? ""))
      payload.full_name = editForm.full_name.trim();
    if (editForm.phone !== (user.phone ?? ""))
      payload.phone = editForm.phone.trim();
    if (editForm.bio !== (user.bio ?? ""))
      payload.bio = editForm.bio.trim();
    if (editForm.date_of_birth !== (user.date_of_birth ?? ""))
      payload.date_of_birth = editForm.date_of_birth || undefined;

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success("Perfil actualizado");
        setIsEditing(false);
      },
      onError: (err) => {
        toast.error("No se pudo actualizar el perfil", {
          description: err.message,
        });
      },
    });
  };

  const handleExportData = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      profile: user,
      consents: consentsQuery.data?.consents ?? [],
      favorites_ids: favorites,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `farmanexo-mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Descargando tus datos personales");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "ELIMINAR") {
      toast.error("Escribe ELIMINAR para confirmar");
      return;
    }
    deleteAccount.mutate(undefined, {
      onError: (err) => {
        toast.error("No se pudo eliminar la cuenta", { description: err.message });
      },
    });
  };

  if (!mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="size-5 text-brand-pink" />
            Mi Perfil
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="favorites" className="text-xs sm:text-sm">
              <Heart className="size-3 sm:size-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Favoritos</span>
              <span className="sm:hidden">Favs</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              <User className="size-3 sm:size-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Datos</span>
              <span className="sm:hidden">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">
              <ShieldCheck className="size-3 sm:size-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Privacidad</span>
              <span className="sm:hidden">Priv</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              <Settings className="size-3 sm:size-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Preferencias</span>
              <span className="sm:hidden">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="mt-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Heart className="size-4 sm:size-5 text-brand-pink" />
                  Medicamentos favoritos ({favoriteProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingFavorites && favoriteProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin mx-auto mb-3 text-brand-pink" />
                    <p className="text-sm">Cargando tus favoritos…</p>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="size-10 sm:size-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Aún no tienes medicamentos favoritos
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Marca el corazón en cualquier medicamento para guardarlo
                      aquí
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {favoriteProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/medicamento/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="rounded-full bg-brand-pink/10 p-2 shrink-0">
                            <Pill className="size-4 text-brand-pink" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {product.active_ingredient ?? "—"}
                              {product.concentration
                                ? ` · ${product.concentration}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {product.requires_prescription ? (
                            <Badge
                              variant="secondary"
                              className="text-xs hidden sm:inline-flex bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            >
                              Receta
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-xs hidden sm:inline-flex bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            >
                              Venta libre
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-8 w-8"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(product.id);
                            }}
                            aria-label="Quitar de favoritos"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </Link>
                    ))}
                    {favoriteProducts.length < favorites.length && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        Algunos favoritos no pudieron cargarse (pueden haber
                        sido eliminados del catálogo).
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <User className="size-4 sm:size-5 text-brand-pink" />
                    Datos personales
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartEdit}
                      disabled={!user}
                    >
                      <Edit3 className="size-3 mr-1" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={updateProfile.isPending}
                      >
                        <X className="size-3 mr-1" />
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={updateProfile.isPending}
                        className="bg-brand-teal hover:bg-brand-teal/90"
                      >
                        {updateProfile.isPending ? (
                          <Loader2 className="size-3 mr-1 animate-spin" />
                        ) : (
                          <Save className="size-3 mr-1" />
                        )}
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <p className="text-sm text-muted-foreground">
                    Debes iniciar sesión para ver tus datos personales.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium mb-1 block">
                          Nombre completo
                        </label>
                        <Input
                          value={
                            isEditing
                              ? editForm.full_name
                              : (user.full_name ?? "")
                          }
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              full_name: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="Tu nombre completo"
                          maxLength={200}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Correo electrónico
                        </label>
                        <Input
                          value={user.email ?? ""}
                          disabled
                          readOnly
                          placeholder="—"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          El correo no se puede cambiar desde aquí.
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Teléfono
                        </label>
                        <Input
                          value={
                            isEditing ? editForm.phone : (user.phone ?? "")
                          }
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                          disabled={!isEditing}
                          placeholder="+51 999 999 999"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Fecha de nacimiento
                        </label>
                        <Input
                          type="date"
                          value={
                            isEditing
                              ? editForm.date_of_birth
                              : (user.date_of_birth ?? "")
                          }
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              date_of_birth: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Biografía
                      </label>
                      <Textarea
                        value={isEditing ? editForm.bio : (user.bio ?? "")}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                        disabled={!isEditing}
                        placeholder="Cuéntanos algo sobre ti (opcional)"
                        maxLength={500}
                        rows={3}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      <Shield className="size-3 inline mr-1" />
                      Tus datos están protegidos y solo se usan para mejorar tu
                      experiencia en FarmaNexo.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <FileText className="size-4 sm:size-5 text-brand-teal" />
                  Mis consentimientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consentsQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando consentimientos…
                  </div>
                ) : consentsQuery.error ? (
                  <p className="text-sm text-destructive">
                    No se pudieron cargar tus consentimientos.
                  </p>
                ) : (
                  <ConsentList items={consentsQuery.data?.consents ?? []} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Download className="size-4 sm:size-5 text-brand-teal" />
                  Exportar mis datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Descarga una copia en JSON de tu perfil, tus consentimientos y
                  tus favoritos. Parte de tu derecho ARCO de acceso conforme a
                  la Ley 29733 de Protección de Datos Personales.
                </p>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  disabled={!user}
                  className="gap-2"
                >
                  <Download className="size-4" />
                  Descargar mis datos (JSON)
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/40">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-4 sm:size-5" />
                  Eliminar mi cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Ejercerás tu derecho ARCO de cancelación. Anonimizaremos tus
                  datos personales y cerraremos tu sesión de inmediato. Tus
                  consentimientos quedan archivados para auditoría conforme a
                  la ley, pero ya no estarán vinculados a ti de forma
                  identificable.
                </p>
                <p className="text-xs sm:text-sm font-medium text-destructive">
                  Esta acción es irreversible.
                </p>
                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={!user}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Eliminar mi cuenta
                  </Button>
                ) : (
                  <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 p-3">
                    <label className="text-xs font-medium">
                      Para confirmar, escribe{" "}
                      <span className="font-mono font-bold">ELIMINAR</span>:
                    </label>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="ELIMINAR"
                      autoComplete="off"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText("");
                        }}
                        disabled={deleteAccount.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAccount}
                        disabled={
                          deleteConfirmText !== "ELIMINAR" ||
                          deleteAccount.isPending
                        }
                      >
                        {deleteAccount.isPending ? (
                          <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="size-4 mr-2" />
                        )}
                        Confirmar eliminación
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Settings className="size-4 sm:size-5 text-brand-teal" />
                  Preferencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Preferir genéricos</p>
                    <p className="text-xs text-muted-foreground">
                      Mostrar primero medicamentos genéricos cuando existan
                    </p>
                  </div>
                  <Switch
                    checked={preferences.preferGeneric}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        preferGeneric: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Notificaciones</p>
                    <p className="text-xs text-muted-foreground">
                      Recibir alertas de precios y novedades
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        notifications: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div>
                  <p className="font-medium text-sm mb-2">Radio de búsqueda</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Distancia máxima por defecto al buscar farmacias cercanas
                  </p>
                  <Select
                    value={String(searchRadius)}
                    onValueChange={(value) => setSearchRadius(Number(value))}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 km</SelectItem>
                      <SelectItem value="2">2 km</SelectItem>
                      <SelectItem value="3">3 km</SelectItem>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

const CONSENT_LABELS: Record<string, string> = {
  terms_of_service: "Términos de uso",
  privacy_policy: "Política de privacidad",
  marketing_communications: "Comunicaciones de marketing",
};

function ConsentList({ items }: { items: ConsentItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay consentimientos registrados todavía.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((c) => {
        const label = CONSENT_LABELS[c.consent_type] ?? c.consent_type;
        return (
          <div
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                Versión {c.document_version} ·{" "}
                {new Date(c.accepted_at).toLocaleString("es-PE")}
              </p>
            </div>
            {c.is_active ? (
              c.accepted ? (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  Aceptado
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <X className="size-3.5" />
                  Rechazado
                </span>
              )
            ) : (
              <span className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <X className="size-3.5" />
                Revocado
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProfileModal;
