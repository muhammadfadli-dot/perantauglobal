// Shared candidate-document type labels + icons. Single source so the admin doc
// review queue, the candidate dossier, and the candidate-facing pages all render the
// same human label for every doc_type — including the 8 extended types added in
// migration 0021 (formal_photo, str_certificate, …) that the old queue map omitted,
// which left the most common doc (formal_photo) with a blank title.

export type DocIconName = "id_card" | "passport" | "doc" | "camera";

const DOC_LABELS: Record<string, string> = {
  ktp: "KTP",
  passport: "Paspor",
  cv: "CV",
  photo: "Foto",
  formal_photo: "Foto formal",
  certificate: "Sertifikat",
  str_certificate: "Sertifikat STR",
  driving_license: "SIM",
  language_certificate: "Sertifikat bahasa",
  professional_certificate: "Sertifikat profesi",
  education_certificate: "Sertifikat pendidikan",
  work_certificate: "Sertifikat kerja",
  medical: "Medical",
  medical_check: "Medical check",
  other: "Lainnya",
};

const DOC_ICONS: Record<string, DocIconName> = {
  ktp: "id_card",
  passport: "passport",
  driving_license: "id_card",
  photo: "camera",
  formal_photo: "camera",
  cv: "doc",
};

export function docTypeLabel(t: string): string {
  return DOC_LABELS[t] ?? t;
}

export function docTypeIcon(t: string): DocIconName {
  return DOC_ICONS[t] ?? "doc";
}
