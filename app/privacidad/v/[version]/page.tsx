"use client";

import { use } from "react";
import { Header } from "@/components/header";
import { LegalDocumentView } from "@/components/legal-document-view";

export default function PrivacidadVersionPage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = use(params);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <LegalDocumentView typeCode="privacy" version={version} />
    </div>
  );
}
