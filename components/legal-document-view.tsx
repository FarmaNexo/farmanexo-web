"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, Hash, Tag } from "lucide-react";
import { useCurrentLegalDocument, useLegalDocumentByVersion } from "@/lib/api/hooks/use-legal";

interface LegalDocumentViewProps {
  typeCode: "terms" | "privacy" | "marketing" | string;
  /** Si se pasa, muestra esa versión específica (histórica); si no, la vigente. */
  version?: string;
  /** Heading H1 a renderizar antes del contenido (override del título del backend). */
  headingOverride?: string;
}

export function LegalDocumentView({ typeCode, version, headingOverride }: LegalDocumentViewProps) {
  const currentQuery = useCurrentLegalDocument(version ? undefined : typeCode);
  const versionQuery = useLegalDocumentByVersion(version ? typeCode : undefined, version);
  const query = version ? versionQuery : currentQuery;

  const doc = query.data;

  if (query.isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-2/3 bg-muted rounded" />
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="space-y-2 mt-8">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-11/12 bg-muted rounded" />
          <div className="h-4 w-10/12 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (query.isError || !doc) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="font-medium text-destructive">No fue posible cargar el documento</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Intenta nuevamente en unos segundos. Si el problema persiste, contáctanos a{" "}
          <a className="underline" href="mailto:legal@farmanexo.com.pe">
            legal@farmanexo.com.pe
          </a>
          .
        </p>
      </div>
    );
  }

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          {headingOverride ?? doc.title}
        </h1>
        {doc.summary && (
          <p className="mt-3 text-base text-muted-foreground">{doc.summary}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Versión <strong className="font-mono text-foreground">{doc.version}</strong>
          </span>
          {doc.effective_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Vigente desde {formatDate(doc.effective_date)}
            </span>
          )}
          {doc.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Publicado {formatDate(doc.published_at)}
            </span>
          )}
          <span
            className="flex items-center gap-1.5 font-mono"
            title="Hash SHA-256 de integridad del documento"
          >
            <Hash className="h-3.5 w-3.5" />
            {doc.content_hash.slice(0, 12)}…
          </span>
        </div>

        {doc.status === "archived" && (
          <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            Esta es una versión <strong>archivada</strong>. Para la versión vigente, visita la
            página principal del documento.
          </div>
        )}
      </header>

      <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert lg:prose-base prose-headings:scroll-mt-24 prose-headings:font-semibold prose-h1:hidden prose-h2:mt-10 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h3:mt-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content_markdown}</ReactMarkdown>
      </div>
    </article>
  );
}
