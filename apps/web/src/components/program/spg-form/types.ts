// SPG Smart Form — Types & Scoring Configuration

export interface SPGFormData {
  // Page 1: Identity & Location
  fullName: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  age: string;
  education: string;
  vehicle: string;

  // Page 2: Logistics & Availability
  workStatus: string;
  availability: string;
  hasSmartphone: string;
  hasInternet: string;
  fieldWorkWilling: string;

  // Page 3: Motivation & Soft Screen
  motivationReason: string;
  motivationDetail: string;
  communicationComfort: string;
  initiativeScenario: string;
  referralSource: string;

  // Page 4: Confirmation
  agreedTerms: boolean;
  briefingAvailability: string;
}

export const INITIAL_FORM_DATA: SPGFormData = {
  fullName: "",
  phone: "",
  email: "",
  province: "",
  city: "",
  age: "",
  education: "",
  vehicle: "",
  workStatus: "",
  availability: "",
  hasSmartphone: "",
  hasInternet: "",
  fieldWorkWilling: "",
  motivationReason: "",
  motivationDetail: "",
  communicationComfort: "",
  initiativeScenario: "",
  referralSource: "",
  agreedTerms: false,
  briefingAvailability: "",
};

// Java provinces only
export const JAVA_PROVINCES = [
  "jawa-barat",
  "jawa-tengah",
  "jawa-timur",
  "banten",
  "dki-jakarta",
  "di-yogyakarta",
] as const;

export const ALL_PROVINCES = [
  // Java (valid)
  ...JAVA_PROVINCES,
  // Non-Java (will trigger STOP)
  "aceh",
  "sumatera-utara",
  "sumatera-barat",
  "riau",
  "kepulauan-riau",
  "jambi",
  "sumatera-selatan",
  "bangka-belitung",
  "bengkulu",
  "lampung",
  "kalimantan-barat",
  "kalimantan-tengah",
  "kalimantan-selatan",
  "kalimantan-timur",
  "kalimantan-utara",
  "sulawesi-utara",
  "gorontalo",
  "sulawesi-tengah",
  "sulawesi-selatan",
  "sulawesi-tenggara",
  "sulawesi-barat",
  "bali",
  "nusa-tenggara-barat",
  "nusa-tenggara-timur",
  "maluku",
  "maluku-utara",
  "papua",
  "papua-barat",
  "papua-selatan",
  "papua-tengah",
  "papua-pegunungan",
  "papua-barat-daya",
] as const;

export type StopReason = "area" | "vehicle" | "fieldwork" | "smartphone";

export type FormStatus = "idle" | "loading" | "success" | "error" | "stopped";

export type ScoreStatus = "green" | "yellow" | "red";

export interface FormStepProps {
  formData: SPGFormData;
  onChange: (field: keyof SPGFormData, value: string | boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  t: (key: string) => string;
}

// --- Scoring Configuration (mirrors server-side logic) ---

export const SCORE_WEIGHTS = {
  // Vehicle
  vehicle: {
    motor: 3,
    mobil: 2,
    "motor-mobil": 4,
    tidak: 0,
  },
  // Province (priority areas get higher scores)
  province: {
    "jawa-barat": 4,
    "jawa-tengah": 3,
    "jawa-timur": 3,
    banten: 2,
    "dki-jakarta": 2,
    "di-yogyakarta": 2,
  },
  // Availability
  availability: {
    segera: 3,
    "1-2-minggu": 2,
    "lebih-2-minggu": 1,
  },
  // Education
  education: {
    sma: 2,
    d3: 3,
    s1: 3,
    s2: 3,
    smp: 1,
  },
  // Motivation reason
  motivationReason: {
    "cari-penghasilan-tambahan": 2,
    "tertarik-bidang-ketenagakerjaan": 4,
    "ingin-membantu-orang": 3,
    "diajak-teman": 1,
    lainnya: 1,
  },
  // Communication comfort (1-5 scale)
  communicationComfort: {
    "1": 1,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 3,
  },
  // Initiative scenario
  initiativeScenario: {
    "langsung-cari-lpk-lain": 4,
    "hubungi-tim-minta-arahan": 3,
    "tunggu-jadwal-ulang": 1,
    "skip-area-itu": 2,
  },
} as const;

export const SCORE_THRESHOLDS = {
  green: 18,
  yellow: 12,
} as const;

// Stop condition checks
export function isJavaProvince(province: string): boolean {
  return (JAVA_PROVINCES as readonly string[]).includes(province);
}

export function hasVehicle(vehicle: string): boolean {
  return vehicle !== "" && vehicle !== "tidak";
}

export function checkStopConditions(
  page: number,
  formData: SPGFormData
): StopReason | null {
  if (page === 0) {
    if (formData.province && !isJavaProvince(formData.province)) return "area";
    if (formData.vehicle && !hasVehicle(formData.vehicle)) return "vehicle";
  }
  if (page === 1) {
    if (formData.fieldWorkWilling === "tidak") return "fieldwork";
    if (formData.hasSmartphone === "tidak") return "smartphone";
  }
  return null;
}
