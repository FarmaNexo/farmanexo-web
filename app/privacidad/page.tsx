"use client";

import { Header } from "@/components/header";
import { LegalDocumentView } from "@/components/legal-document-view";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <LegalDocumentView typeCode="privacy" />
    </div>
  );
}
