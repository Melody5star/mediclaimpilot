export interface CPTBenchmark {
  description: string;
  medicareRate: number;
  category: string;
  commonErrors: string[];
}

export const CPT_BENCHMARKS: Record<string, CPTBenchmark> = {
  // Office Visits — Established Patient
  "99211": { description: "Office visit, established, minimal", medicareRate: 24.54, category: "E&M", commonErrors: ["upcoding to 99213"] },
  "99212": { description: "Office visit, established, straightforward", medicareRate: 56.43, category: "E&M", commonErrors: ["upcoding to 99214"] },
  "99213": { description: "Office visit, established, low complexity", medicareRate: 112.00, category: "E&M", commonErrors: ["upcoding to 99215"] },
  "99214": { description: "Office visit, established, moderate complexity", medicareRate: 167.00, category: "E&M", commonErrors: ["upcoding to 99215"] },
  "99215": { description: "Office visit, established, high complexity", medicareRate: 211.00, category: "E&M", commonErrors: ["rarely legitimate for routine visits"] },
  // Office Visits — New Patient
  "99201": { description: "Office visit, new patient, minimal", medicareRate: 45.00, category: "E&M", commonErrors: ["upcoding"] },
  "99202": { description: "Office visit, new patient, straightforward", medicareRate: 77.00, category: "E&M", commonErrors: ["upcoding"] },
  "99203": { description: "Office visit, new patient, low complexity", medicareRate: 111.00, category: "E&M", commonErrors: ["upcoding"] },
  "99204": { description: "Office visit, new patient, moderate complexity", medicareRate: 167.00, category: "E&M", commonErrors: ["upcoding"] },
  "99205": { description: "Office visit, new patient, high complexity", medicareRate: 211.00, category: "E&M", commonErrors: ["rarely appropriate for new patient visits"] },
  // Emergency
  "99281": { description: "ER visit, minor", medicareRate: 46.00, category: "ER", commonErrors: ["upcoding to higher level"] },
  "99282": { description: "ER visit, low complexity", medicareRate: 87.00, category: "ER", commonErrors: ["upcoding"] },
  "99283": { description: "ER visit, moderate complexity", medicareRate: 148.00, category: "ER", commonErrors: ["upcoding"] },
  "99284": { description: "ER visit, high complexity", medicareRate: 248.00, category: "ER", commonErrors: ["upcoding"] },
  "99285": { description: "ER visit, highest complexity", medicareRate: 364.00, category: "ER", commonErrors: ["commonly overbilled"] },
  // Preventive
  "99385": { description: "Annual preventive visit, new patient 18-39", medicareRate: 195.00, category: "Preventive", commonErrors: ["billing with E&M same day"] },
  "99386": { description: "Annual preventive visit, new patient 40-64", medicareRate: 220.00, category: "Preventive", commonErrors: ["billing with E&M same day"] },
  "99395": { description: "Annual preventive visit, established 18-39", medicareRate: 175.00, category: "Preventive", commonErrors: ["duplicate billing"] },
  "99396": { description: "Annual preventive visit, established 40-64", medicareRate: 195.00, category: "Preventive", commonErrors: ["duplicate billing"] },
  // Labs
  "80053": { description: "Comprehensive metabolic panel", medicareRate: 14.00, category: "Lab", commonErrors: ["unbundling individual components"] },
  "80048": { description: "Basic metabolic panel", medicareRate: 11.00, category: "Lab", commonErrors: ["unbundling"] },
  "85025": { description: "Complete blood count with differential", medicareRate: 11.00, category: "Lab", commonErrors: ["unbundling individual counts"] },
  "83036": { description: "Hemoglobin A1C", medicareRate: 14.00, category: "Lab", commonErrors: ["duplicate billing"] },
  "82465": { description: "Cholesterol, total", medicareRate: 8.00, category: "Lab", commonErrors: ["unbundling from lipid panel 80061"] },
  "80061": { description: "Lipid panel", medicareRate: 21.00, category: "Lab", commonErrors: ["separate billing of components"] },
  // Imaging
  "71046": { description: "Chest X-ray, 2 views", medicareRate: 42.00, category: "Imaging", commonErrors: ["billing 71045 + 71046 separately"] },
  "73721": { description: "MRI knee without contrast", medicareRate: 385.00, category: "Imaging", commonErrors: ["facility fee bundling errors"] },
  "70553": { description: "MRI brain with and without contrast", medicareRate: 485.00, category: "Imaging", commonErrors: ["contrast billing errors"] },
  "74177": { description: "CT abdomen and pelvis with contrast", medicareRate: 290.00, category: "Imaging", commonErrors: ["unbundling abdomen/pelvis"] },
  // Mental Health
  "90837": { description: "Psychotherapy, 60 minutes", medicareRate: 131.00, category: "Mental Health", commonErrors: ["time documentation issues"] },
  "90834": { description: "Psychotherapy, 45 minutes", medicareRate: 101.00, category: "Mental Health", commonErrors: ["upcoding to 90837"] },
  "90832": { description: "Psychotherapy, 30 minutes", medicareRate: 76.00, category: "Mental Health", commonErrors: ["upcoding"] },
  "90792": { description: "Psychiatric diagnostic evaluation with medical services", medicareRate: 234.00, category: "Mental Health", commonErrors: ["duplicate billing with 90791"] },
  // Procedures
  "93000": { description: "Electrocardiogram with interpretation", medicareRate: 20.00, category: "Cardiology", commonErrors: ["billing technical + professional separately"] },
  "36415": { description: "Routine venipuncture", medicareRate: 3.00, category: "Lab", commonErrors: ["excessive per-draw charges"] },
  "99213_mod25": { description: "Office visit with preventive service same day", medicareRate: 112.00, category: "E&M", commonErrors: ["missing modifier 25 causing denial"] },
};

export function lookupCPT(code: string): CPTBenchmark | null {
  return CPT_BENCHMARKS[code.trim()] ?? null;
}

export function getOverchargeFlag(code: string, chargedAmount: number): number {
  const benchmark = lookupCPT(code);
  if (!benchmark) return 0;
  // Flag if charged more than 3x Medicare rate (typical insurer pays 110-150% of Medicare)
  const threshold = benchmark.medicareRate * 3;
  return chargedAmount > threshold ? chargedAmount - threshold : 0;
}
