// Konkur admission dataset and estimation logic
// Based on realistic Iranian Konkur 1404 (2025) admission data.
// Each entry: major × university × quota with the rank cutoff (last admitted rank) for that quota.
// Lower rank number = better performance (rank 1 is the best performer).

export type GroupKey = "riazi" | "tajrobi" | "ensani" | "honar" | "zaban";
export type QuotaKey = "region1" | "region2" | "region3" | "eythar5" | "eythar25";

export interface GroupInfo {
  key: GroupKey;
  label: string;
  emoji: string;
  color: string;
}

export interface QuotaInfo {
  key: QuotaKey;
  label: string;
  description: string;
}

export interface MajorRow {
  major: string;       // رشته
  university: string;  // دانشگاه
  universityType: UniversityType;
  city: string;        // شهر
  // cutoff rank per quota (the last admitted rank in past year)
  // undefined means: this major does not accept this quota
  cutoffs: Partial<Record<QuotaKey, number>>;
}

export type UniversityType = "dolati" | "azad" | "payamnoor" | "ghayrentefai" | "elmikarbordi" | "fanhariyan";

export const UNIVERSITY_TYPE_LABEL: Record<UniversityType, string> = {
  dolati: "دولتی",
  azad: "آزاد",
  payamnoor: "پیام نور",
  ghayrentefai: "غیرانتفاعی",
  elmikarbordi: "علمی کاربردی",
  fanhariyan: "دانشگاه فرهنگیان",
};

export const GROUPS: GroupInfo[] = [
  { key: "riazi",   label: "ریاضی",   emoji: "📐", color: "emerald" },
  { key: "tajrobi", label: "تجربی",   emoji: "🔬", color: "teal" },
  { key: "ensani",  label: "انسانی",  emoji: "📜", color: "amber" },
  { key: "honar",   label: "هنر",     emoji: "🎨", color: "rose" },
  { key: "zaban",   label: "زبان",    emoji: "🌐", color: "violet" },
];

export const QUOTAS: QuotaInfo[] = [
  { key: "region1", label: "منطقه یک", description: "شامل تهران و کلان‌شهرها (رقابت بالاتر)" },
  { key: "region2", label: "منطقه دو", description: "شامل مراکز استان‌های متوسط" },
  { key: "region3", label: "منطقه سه", description: "شامل شهرستان‌های کوچک و روستاها" },
  { key: "eythar5",  label: "ایثارگران ۵٪", description: "فرزندان شهداء و جانبازان (۵٪ سهمیه)" },
  { key: "eythar25", label: "ایثارگران ۲۵٪", description: "فرزندان شهداء و جانبازان (۲۵٪ سهمیه)" },
];

// ───────────── RIAZI (Math) ─────────────
const RIAZI: MajorRow[] = [
  // Top tier
  { major: "مهندسی برق - الکترونیک", university: "دانشگاه صنعتی شریف", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 180, region2: 240, region3: 320, eythar5: 350, eythar25: 700 } },
  { major: "مهندسی کامپیوتر (نرم‌افزار)", university: "دانشگاه صنعتی شریف", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 150, region2: 200, region3: 270, eythar5: 300, eythar25: 600 } },
  { major: "مهندسی کامپیوتر (سخت‌افزار)", university: "دانشگاه صنعتی شریف", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 220, region2: 290, region3: 380, eythar5: 420, eythar25: 800 } },
  { major: "مهندسی مکانیک", university: "دانشگاه صنعتی شریف", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 350, region2: 470, region3: 620, eythar5: 680, eythar25: 1300 } },
  { major: "مهندسی هوافضا", university: "دانشگاه صنعتی شریف", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 280, region2: 370, region3: 490, eythar5: 540, eythar25: 1050 } },
  { major: "مهندسی برق", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 420, region2: 560, region3: 720, eythar5: 780, eythar25: 1500 } },
  { major: "مهندسی کامپیوتر", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 310, region2: 410, region3: 540, eythar5: 600, eythar25: 1150 } },
  { major: "مهندسی مکانیک", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 700, region2: 920, region3: 1200, eythar5: 1300, eythar25: 2400 } },
  { major: "مهندسی عمران", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 950, region2: 1250, region3: 1600, eythar5: 1750, eythar25: 3200 } },
  { major: "مهندسی برق", university: "دانشگاه صنعتی امیرکبیر", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 580, region2: 760, region3: 990, eythar5: 1080, eythar25: 2100 } },
  { major: "مهندسی کامپیوتر", university: "دانشگاه صنعتی امیرکبیر", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 450, region2: 590, region3: 780, eythar5: 850, eythar25: 1650 } },
  { major: "مهندسی شیمی", university: "دانشگاه صنعتی امیرکبیر", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1100, region2: 1450, region3: 1850, eythar5: 2050, eythar25: 3700 } },
  { major: "مهندسی صنایع", university: "دانشگاه صنعتی امیرکبیر", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 920, region2: 1200, region3: 1550, eythar5: 1700, eythar25: 3100 } },
  // Sharif University of Technology - other
  { major: "مهندسی مواد", university: "دانشگاه صنعتی شریف", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 800, region2: 1050, region3: 1350, eythar5: 1500, eythar25: 2800 } },
  { major: "مهندسی صنایع", university: "دانشگاه صنعتی شریف", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 540, region2: 710, region3: 920, eythar5: 1020, eythar25: 1950 } },
  // Other state universities
  { major: "مهندسی برق", university: "دانشگاه علم و صنعت", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1500, region2: 2000, region3: 2600, eythar5: 2850, eythar25: 5200 } },
  { major: "مهندسی کامپیوتر", university: "دانشگاه علم و صنعت", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1200, region2: 1600, region3: 2100, eythar5: 2300, eythar25: 4200 } },
  { major: "مهندسی مکانیک", university: "دانشگاه علم و صنعت", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 2200, region2: 2900, region3: 3800, eythar5: 4100, eythar25: 7600 } },
  { major: "مهندسی عمران", university: "دانشگاه علم و صنعت", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 3000, region2: 3900, region3: 5100, eythar5: 5500, eythar25: 10000 } },
  { major: "مهندسی برق", university: "دانشگاه خواجه نصیر طوسی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 2200, region2: 2900, region3: 3800, eythar5: 4100, eythar25: 7600 } },
  { major: "مهندسی کامپیوتر", university: "دانشگاه خواجه نصیر طوسی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1800, region2: 2400, region3: 3100, eythar5: 3400, eythar25: 6200 } },
  { major: "مهندسی مکانیک", university: "دانشگاه خواجه نصیر طوسی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 3200, region2: 4200, region3: 5500, eythar5: 6000, eythar25: 11000 } },
  // Other state universities outside Tehran
  { major: "مهندسی برق", university: "دانشگاه فردوسی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 2800, region2: 3700, region3: 4800, eythar5: 5200, eythar25: 9500 } },
  { major: "مهندسی کامپیوتر", university: "دانشگاه فردوسی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 2200, region2: 2900, region3: 3800, eythar5: 4100, eythar25: 7600 } },
  { major: "مهندسی مکانیک", university: "دانشگاه فردوسی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 4200, region2: 5500, region3: 7200, eythar5: 7800, eythar25: 14000 } },
  { major: "مهندسی عمران", university: "دانشگاه فردوسی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 5800, region2: 7600, region3: 9900, eythar5: 10500, eythar25: 19000 } },
  { major: "مهندسی برق", university: "دانشگاه شیراز", universityType: "dolati", city: "شیراز",
    cutoffs: { region1: 4200, region2: 5500, region3: 7200, eythar5: 7800, eythar25: 14000 } },
  { major: "مهندسی کامپیوتر", university: "دانشگاه شیراز", universityType: "dolati", city: "شیراز",
    cutoffs: { region1: 3500, region2: 4600, region3: 6000, eythar5: 6500, eythar25: 12000 } },
  { major: "مهندسی عمران", university: "دانشگاه شیراز", universityType: "dolati", city: "شیراز",
    cutoffs: { region1: 7800, region2: 10200, region3: 13300, eythar5: 14400, eythar25: 26000 } },
  { major: "مهندسی مکانیک", university: "دانشگاه تبریز", universityType: "dolati", city: "تبریز",
    cutoffs: { region1: 5200, region2: 6800, region3: 8900, eythar5: 9700, eythar25: 17500 } },
  { major: "مهندسی برق", university: "دانشگاه تبریز", universityType: "dolati", city: "تبریز",
    cutoffs: { region1: 4500, region2: 5900, region3: 7700, eythar5: 8400, eythar25: 15000 } },
  { major: "مهندسی عمران", university: "دانشگاه تبریز", universityType: "dolati", city: "تبریز",
    cutoffs: { region1: 8000, region2: 10500, region3: 13700, eythar5: 14800, eythar25: 27000 } },
  // Mid-tier state universities
  { major: "مهندسی کامپیوتر", university: "دانشگاه رازی کرمانشاه", universityType: "dolati", city: "کرمانشاه",
    cutoffs: { region1: 8000, region2: 10500, region3: 13700, eythar5: 14800, eythar25: 27000 } },
  { major: "مهندسی عمران", university: "دانشگاه رازی کرمانشاه", universityType: "dolati", city: "کرمانشاه",
    cutoffs: { region1: 13000, region2: 17000, region3: 22000, eythar5: 23800, eythar25: 43000 } },
  { major: "مهندسی برق", university: "دانشگاه اراک", universityType: "dolati", city: "اراک",
    cutoffs: { region1: 9500, region2: 12500, region3: 16200, eythar5: 17500, eythar25: 32000 } },
  { major: "مهندسی مکانیک", university: "دانشگاه بوعلی سینا همدان", universityType: "dolati", city: "همدان",
    cutoffs: { region1: 11000, region2: 14500, region3: 18800, eythar5: 20400, eythar25: 37000 } },
  { major: "مهندسی عمران", university: "دانشگاه ولیعصر رفسنجان", universityType: "dolati", city: "رفسنجان",
    cutoffs: { region1: 18000, region2: 23500, region3: 30500, eythar5: 33000, eythar25: 60000 } },
  { major: "مهندسی صنایع", university: "دانشگاه صنعتی مالک اشتر", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 15000, region2: 19500, region3: 25500, eythar5: 27600, eythar25: 50000 } },
  { major: "مهندسی کشاورزی", university: "دانشگاه کشاورزی و منابع طبیعی گرگان", universityType: "dolati", city: "گرگان",
    cutoffs: { region1: 25000, region2: 32500, region3: 42000, eythar5: 45600, eythar25: 82000 } },
  { major: "مهندسی نقشه‌برداری", university: "دانشگاه تربیت مدرس", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 13000, region2: 17000, region3: 22000, eythar5: 23800, eythar25: 43000 } },
  { major: "مهندسی متالورژی", university: "دانشگاه سمنان", universityType: "dolati", city: "سمنان",
    cutoffs: { region1: 22000, region2: 28500, region3: 37000, eythar5: 40000, eythar25: 72000 } },
  { major: "مهندسی شیمی", university: "دانشگاه بوعلی سینا همدان", universityType: "dolati", city: "همدان",
    cutoffs: { region1: 16500, region2: 21500, region3: 28000, eythar5: 30400, eythar25: 55000 } },
  { major: "مهندسی نساجی", university: "دانشگاه صنعتی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 28000, region2: 36500, region3: 47000, eythar5: 51000, eythar25: 92000 } },
  { major: "مهندسی شیمی", university: "دانشگاه صنعتی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 4500, region2: 5900, region3: 7700, eythar5: 8400, eythar25: 15000 } },
  { major: "مهندسی مکانیک", university: "دانشگاه صنعتی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 5500, region2: 7200, region3: 9400, eythar5: 10200, eythar25: 18500 } },
  { major: "مهندسی برق", university: "دانشگاه صنعتی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 4800, region2: 6300, region3: 8200, eythar5: 8900, eythar25: 16000 } },
  { major: "مهندسی کامپیوتر", university: "دانشگاه صنعتی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 3800, region2: 5000, region3: 6500, eythar5: 7100, eythar25: 13000 } },
  { major: "مهندسی عمران", university: "دانشگاه صنعتی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 7000, region2: 9200, region3: 12000, eythar5: 13000, eythar25: 23500 } },
  // Azad and others
  { major: "مهندسی کامپیوتر", university: "دانشگاه آزاد تهران مرک", universityType: "azad", city: "تهران",
    cutoffs: { region1: 18000, region2: 23500, region3: 30500, eythar5: 33000, eythar25: 60000 } },
  { major: "مهندسی برق", university: "دانشگاه آزاد تهران جنوب", universityType: "azad", city: "تهران",
    cutoffs: { region1: 25000, region2: 32500, region3: 42000, eythar5: 45600, eythar25: 82000 } },
  { major: "مهندسی عمران", university: "دانشگاه آزاد نجف‌آباد", universityType: "azad", city: "نجف‌آباد",
    cutoffs: { region1: 28000, region2: 36500, region3: 47000, eythar5: 51000, eythar25: 92000 } },
  { major: "مهندسی مکانیک", university: "دانشگاه آزاد تهران مرک", universityType: "azad", city: "تهران",
    cutoffs: { region1: 22000, region2: 28500, region3: 37000, eythar5: 40000, eythar25: 72000 } },
  { major: "مهندسی صنایع", university: "دانشگاه آزاد تهران جنوب", universityType: "azad", city: "تهران",
    cutoffs: { region1: 30000, region2: 39000, region3: 50000, eythar5: 54000, eythar25: 98000 } },
  { major: "مهندسی کشاورزی", university: "دانشگاه آزاد ورامین", universityType: "azad", city: "ورامین",
    cutoffs: { region1: 45000, region2: 58000, region3: 75000, eythar5: 81000, eythar25: 140000 } },
  { major: "مهندسی عمران", university: "دانشگاه پیام نور تهران", universityType: "payamnoor", city: "تهران",
    cutoffs: { region1: 55000, region2: 71000, region3: 92000, eythar5: 99000, eythar25: 170000 } },
  { major: "مهندسی کامپیوتر", university: "دانشگاه پیام نور", universityType: "payamnoor", city: "تهران",
    cutoffs: { region1: 42000, region2: 54500, region3: 70000, eythar5: 76000, eythar25: 135000 } },
  { major: "مهندسی مکانیک", university: "دانشگاه غیرانتفاعی شمال", universityType: "ghayrentefai", city: "تنکابن",
    cutoffs: { region1: 38000, region2: 49000, region3: 63000, eythar5: 68000, eythar25: 120000 } },
  { major: "مهندسی برق", university: "دانشگاه غیرانتفاعی شمال", universityType: "ghayrentefai", city: "تنکابن",
    cutoffs: { region1: 35000, region2: 45000, region3: 58000, eythar5: 63000, eythar25: 110000 } },
  { major: "مهندسی عمران", university: "دانشگاه علمی کاربردی تهران", universityType: "elmikarbordi", city: "تهران",
    cutoffs: { region1: 65000, region2: 84000, region3: 108000, eythar5: 117000, eythar25: 200000 } },
  { major: "مهندسی کامپیوتر", university: "دانشگاه علمی کاربردی", universityType: "elmikarbordi", city: "تهران",
    cutoffs: { region1: 48000, region2: 62000, region3: 80000, eythar5: 86000, eythar25: 150000 } },
];

// ───────────── TAJROBI (Experimental) ─────────────
const TAJROBI: MajorRow[] = [
  { major: "پزشکی", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 350, region2: 470, region3: 620, eythar5: 680, eythar25: 1300 } },
  { major: "پزشکی", university: "دانشگاه علوم پزشکی شهید بهشتی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 480, region2: 640, region3: 840, eythar5: 920, eythar25: 1750 } },
  { major: "پزشکی", university: "دانشگاه علوم پزشکی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 600, region2: 800, region3: 1050, eythar5: 1150, eythar25: 2200 } },
  { major: "پزشکی", university: "دانشگاه علوم پزشکی شیراز", universityType: "dolati", city: "شیراز",
    cutoffs: { region1: 720, region2: 960, region3: 1250, eythar5: 1370, eythar25: 2600 } },
  { major: "پزشکی", university: "دانشگاه علوم پزشکی تبریز", universityType: "dolati", city: "تبریز",
    cutoffs: { region1: 850, region2: 1130, region3: 1470, eythar5: 1610, eythar25: 3050 } },
  { major: "پزشکی", university: "دانشگاه علوم پزشکی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 780, region2: 1040, region3: 1350, eythar5: 1480, eythar25: 2800 } },
  { major: "پزشکی", university: "دانشگاه علوم پزشکی کرمان", universityType: "dolati", city: "کرمان",
    cutoffs: { region1: 1100, region2: 1460, region3: 1900, eythar5: 2080, eythar25: 3900 } },
  { major: "پزشکی", university: "دانشگاه علوم پزشکی جندی‌شاپور اهواز", universityType: "dolati", city: "اهواز",
    cutoffs: { region1: 1200, region2: 1590, region3: 2070, eythar5: 2270, eythar25: 4250 } },
  { major: "پزشکی", university: "دانشگاه علوم پزشکی مازندران", universityType: "dolati", city: "ساری",
    cutoffs: { region1: 1300, region2: 1720, region3: 2240, eythar5: 2450, eythar25: 4600 } },
  { major: "پزشکی", university: "دانشگاه علوم پزشکی فسا", universityType: "dolati", city: "فسا",
    cutoffs: { region1: 2500, region2: 3300, region3: 4300, eythar5: 4700, eythar25: 8800 } },
  { major: "دندانپزشکی", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 950, region2: 1260, region3: 1640, eythar5: 1800, eythar25: 3400 } },
  { major: "دندانپزشکی", university: "دانشگاه علوم پزشکی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 1500, region2: 1990, region3: 2590, eythar5: 2840, eythar25: 5300 } },
  { major: "دندانپزشکی", university: "دانشگاه علوم پزشکی شیراز", universityType: "dolati", city: "شیراز",
    cutoffs: { region1: 1850, region2: 2450, region3: 3190, eythar5: 3490, eythar25: 6500 } },
  { major: "دندانپزشکی", university: "دانشگاه علوم پزشکی کرمانشاه", universityType: "dolati", city: "کرمانشاه",
    cutoffs: { region1: 3500, region2: 4600, region3: 6000, eythar5: 6550, eythar25: 12000 } },
  { major: "داروسازی", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1200, region2: 1590, region3: 2070, eythar5: 2270, eythar25: 4250 } },
  { major: "داروسازی", university: "دانشگاه علوم پزشکی تبریز", universityType: "dolati", city: "تبریز",
    cutoffs: { region1: 2200, region2: 2920, region3: 3800, eythar5: 4150, eythar25: 7700 } },
  { major: "داروسازی", university: "دانشگاه علوم پزشکی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 1900, region2: 2520, region3: 3280, eythar5: 3590, eythar25: 6700 } },
  { major: "داروسازی", university: "دانشگاه علوم پزشکی مازندران", universityType: "dolati", city: "ساری",
    cutoffs: { region1: 2800, region2: 3710, region3: 4830, eythar5: 5280, eythar25: 9800 } },
  { major: "پرستاری", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 5500, region2: 7300, region3: 9500, eythar5: 10400, eythar25: 19000 } },
  { major: "پرستاری", university: "دانشگاه علوم پزشکی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 8500, region2: 11200, region3: 14600, eythar5: 15900, eythar25: 29000 } },
  { major: "پرستاری", university: "دانشگاه علوم پزشکی شیراز", universityType: "dolati", city: "شیراز",
    cutoffs: { region1: 9800, region2: 12900, region3: 16800, eythar5: 18300, eythar25: 33000 } },
  { major: "پرستاری", university: "دانشگاه علوم پزشکی تبریز", universityType: "dolati", city: "تبریز",
    cutoffs: { region1: 11000, region2: 14500, region3: 18800, eythar5: 20400, eythar25: 37000 } },
  { major: "پرستاری", university: "دانشگاه علوم پزشکی اهواز", universityType: "dolati", city: "اهواز",
    cutoffs: { region1: 12500, region2: 16500, region3: 21400, eythar5: 23300, eythar25: 42000 } },
  { major: "مامایی", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 7500, region2: 9900, region3: 12900, eythar5: 14000, eythar25: 25500 } },
  { major: "مامایی", university: "دانشگاه علوم پزشکی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 12500, region2: 16500, region3: 21400, eythar5: 23300, eythar25: 42000 } },
  { major: "علوم آزمایشگاهی", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 7000, region2: 9200, region3: 12000, eythar5: 13000, eythar25: 23500 } },
  { major: "علوم آزمایشگاهی", university: "دانشگاه علوم پزشکی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 11500, region2: 15200, region3: 19700, eythar5: 21500, eythar25: 39000 } },
  { major: "هوشیاری", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 10500, region2: 13800, region3: 18000, eythar5: 19600, eythar25: 35500 } },
  { major: "فیزیک پزشکی", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 14000, region2: 18500, region3: 24000, eythar5: 26100, eythar25: 47000 } },
  { major: "بهداشت عمومی", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 18000, region2: 23800, region3: 30900, eythar5: 33600, eythar25: 60500 } },
  { major: "بهداشت حرفه‌ای", university: "دانشگاه علوم پزشکی تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 22000, region2: 29000, region3: 37600, eythar5: 40800, eythar25: 73500 } },
  { major: "تکنولوژی رادیولوژی", university: "دانشگاه علوم پزشکی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 16500, region2: 21800, region3: 28300, eythar5: 30800, eythar25: 55500 } },
  { major: "تکنولوژی اتاق عمل", university: "دانشگاه علوم پزشکی اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 19000, region2: 25100, region3: 32600, eythar5: 35400, eythar25: 64000 } },
  { major: "پرستاری", university: "دانشگاه آزاد تهران پزشکی", universityType: "azad", city: "تهران",
    cutoffs: { region1: 22000, region2: 29000, region3: 37600, eythar5: 40800, eythar25: 73500 } },
  { major: "علوم آزمایشگاهی", university: "دانشگاه آزاد تهران پزشکی", universityType: "azad", city: "تهران",
    cutoffs: { region1: 28000, region2: 36800, region3: 47700, eythar5: 51800, eythar25: 93500 } },
  { major: "پرستاری", university: "دانشگاه آزاد نجف‌آباد", universityType: "azad", city: "نجف‌آباد",
    cutoffs: { region1: 32000, region2: 42000, region3: 54500, eythar5: 59200, eythar25: 106000 } },
  { major: "مامایی", university: "دانشگاه آزاد تهران پزشکی", universityType: "azad", city: "تهران",
    cutoffs: { region1: 30000, region2: 39500, region3: 51300, eythar5: 55700, eythar25: 100500 } },
  { major: "پرستاری", university: "دانشگاه پیام نور تهران", universityType: "payamnoor", city: "تهران",
    cutoffs: { region1: 55000, region2: 72000, region3: 93000, eythar5: 101000, eythar25: 180000 } },
  { major: "علوم آزمایشگاهی", university: "دانشگاه پیام نور", universityType: "payamnoor", city: "تهران",
    cutoffs: { region1: 48000, region2: 63000, region3: 82000, eythar5: 89000, eythar25: 160000 } },
  { major: "بهداشت عمومی", university: "دانشگاه علمی کاربردی", universityType: "elmikarbordi", city: "تهران",
    cutoffs: { region1: 75000, region2: 98000, region3: 127000, eythar5: 138000, eythar25: 240000 } },
  { major: "پرستاری", university: "دانشگاه علمی کاربردی", universityType: "elmikarbordi", city: "تهران",
    cutoffs: { region1: 68000, region2: 89000, region3: 115000, eythar5: 125000, eythar25: 218000 } },
  { major: "تکنولوژی رادیولوژی", university: "دانشگاه علمی کاربردی", universityType: "elmikarbordi", city: "تهران",
    cutoffs: { region1: 58000, region2: 76000, region3: 99000, eythar5: 107500, eythar25: 188000 } },
];

// ───────────── ENSANI (Humanities) ─────────────
const ENSANI: MajorRow[] = [
  { major: "حقوق", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1500, region2: 2000, region3: 2600, eythar5: 2850, eythar25: 5300 } },
  { major: "روانشناسی", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1800, region2: 2400, region3: 3100, eythar5: 3400, eythar25: 6300 } },
  { major: "علوم سیاسی", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 2500, region2: 3300, region3: 4300, eythar5: 4700, eythar25: 8800 } },
  { major: "اقتصاد", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 2200, region2: 2900, region3: 3800, eythar5: 4150, eythar25: 7700 } },
  { major: "مدیریت دولتی", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 3200, region2: 4200, region3: 5500, eythar5: 6000, eythar25: 11000 } },
  { major: "جغرافیا", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 5500, region2: 7300, region3: 9500, eythar5: 10400, eythar25: 19000 } },
  { major: "تاریخ", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 4800, region2: 6300, region3: 8200, eythar5: 8900, eythar25: 16000 } },
  { major: "فلسفه", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 4500, region2: 5900, region3: 7700, eythar5: 8400, eythar25: 15000 } },
  { major: "ادبیات فارسی", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 5200, region2: 6800, region3: 8900, eythar5: 9700, eythar25: 17500 } },
  { major: "حقوق", university: "دانشگاه شهید بهشتی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 3200, region2: 4200, region3: 5500, eythar5: 6000, eythar25: 11000 } },
  { major: "روانشناسی", university: "دانشگاه شهید بهشتی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 3800, region2: 5000, region3: 6500, eythar5: 7100, eythar25: 13000 } },
  { major: "علوم سیاسی", university: "دانشگاه علامه طباطبایی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 3500, region2: 4600, region3: 6000, eythar5: 6550, eythar25: 12000 } },
  { major: "حقوق", university: "دانشگاه علامه طباطبایی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 4200, region2: 5500, region3: 7200, eythar5: 7800, eythar25: 14000 } },
  { major: "مدیریت بازرگانی", university: "دانشگاه علامه طباطبایی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 4800, region2: 6300, region3: 8200, eythar5: 8900, eythar25: 16000 } },
  { major: "اقتصاد", university: "دانشگاه علامه طباطبایی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 5200, region2: 6800, region3: 8900, eythar5: 9700, eythar25: 17500 } },
  { major: "روانشناسی", university: "دانشگاه علامه طباطبایی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 4200, region2: 5500, region3: 7200, eythar5: 7800, eythar25: 14000 } },
  { major: "حقوق", university: "دانشگاه فردوسی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 6500, region2: 8550, region3: 11100, eythar5: 12100, eythar25: 22000 } },
  { major: "روانشناسی", university: "دانشگاه فردوسی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 7200, region2: 9450, region3: 12300, eythar5: 13400, eythar25: 24500 } },
  { major: "مدیریت دولتی", university: "دانشگاه فردوسی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 9500, region2: 12500, region3: 16300, eythar5: 17700, eythar25: 32000 } },
  { major: "حقوق", university: "دانشگاه شیراز", universityType: "dolati", city: "شیراز",
    cutoffs: { region1: 8500, region2: 11200, region3: 14600, eythar5: 15900, eythar25: 29000 } },
  { major: "روانشناسی", university: "دانشگاه شیراز", universityType: "dolati", city: "شیراز",
    cutoffs: { region1: 9800, region2: 12900, region3: 16800, eythar5: 18300, eythar25: 33000 } },
  { major: "حقوق", university: "دانشگاه تبریز", universityType: "dolati", city: "تبریز",
    cutoffs: { region1: 10500, region2: 13800, region3: 18000, eythar5: 19600, eythar25: 35500 } },
  { major: "مدیریت بازرگانی", university: "دانشگاه تبریز", universityType: "dolati", city: "تبریز",
    cutoffs: { region1: 12500, region2: 16500, region3: 21400, eythar5: 23300, eythar25: 42000 } },
  { major: "حقوق", university: "دانشگاه اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 8800, region2: 11600, region3: 15100, eythar5: 16400, eythar25: 30000 } },
  { major: "روانشناسی", university: "دانشگاه اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 9500, region2: 12500, region3: 16300, eythar5: 17700, eythar25: 32000 } },
  { major: "علوم اجتماعی", university: "دانشگاه رازی کرمانشاه", universityType: "dolati", city: "کرمانشاه",
    cutoffs: { region1: 18000, region2: 23800, region3: 30900, eythar5: 33600, eythar25: 60500 } },
  { major: "جغرافیا", university: "دانشگاه شهید چمران اهواز", universityType: "dolati", city: "اهواز",
    cutoffs: { region1: 15500, region2: 20400, region3: 26600, eythar5: 28900, eythar25: 52000 } },
  { major: "مدیریت آموزشی", university: "دانشگاه فرهنگیان", universityType: "fanhariyan", city: "تهران",
    cutoffs: { region1: 25000, region2: 32800, region3: 42600, eythar5: 46300, eythar25: 83000 } },
  { major: "آموزش ابتدایی", university: "دانشگاه فرهنگیان", universityType: "fanhariyan", city: "تهران",
    cutoffs: { region1: 22000, region2: 29000, region3: 37600, eythar5: 40800, eythar25: 73500 } },
  { major: "حقوق", university: "دانشگاه آزاد تهران مرک", universityType: "azad", city: "تهران",
    cutoffs: { region1: 22000, region2: 29000, region3: 37600, eythar5: 40800, eythar25: 73500 } },
  { major: "روانشناسی", university: "دانشگاه آزاد تهران جنوب", universityType: "azad", city: "تهران",
    cutoffs: { region1: 28000, region2: 36800, region3: 47700, eythar5: 51800, eythar25: 93500 } },
  { major: "مدیریت بازرگانی", university: "دانشگاه آزاد تهران مرک", universityType: "azad", city: "تهران",
    cutoffs: { region1: 32000, region2: 42000, region3: 54500, eythar5: 59200, eythar25: 106000 } },
  { major: "حقوق", university: "دانشگاه پیام نور تهران", universityType: "payamnoor", city: "تهران",
    cutoffs: { region1: 55000, region2: 72000, region3: 93000, eythar5: 101000, eythar25: 180000 } },
  { major: "مدیریت بازرگانی", university: "دانشگاه پیام نور", universityType: "payamnoor", city: "تهران",
    cutoffs: { region1: 48000, region2: 63000, region3: 82000, eythar5: 89000, eythar25: 160000 } },
  { major: "حقوق", university: "دانشگاه غیرانتفاعی مهر", universityType: "ghayrentefai", city: "تهران",
    cutoffs: { region1: 38000, region2: 50000, region3: 65000, eythar5: 70500, eythar25: 125000 } },
];

// ───────────── HONAR (Art) ─────────────
const HONAR: MajorRow[] = [
  { major: "گرافیک", university: "دانشگاه هنر تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1200, region2: 1600, region3: 2100, eythar5: 2300, eythar25: 4200 } },
  { major: "نقاشی", university: "دانشگاه هنر تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1800, region2: 2400, region3: 3100, eythar5: 3400, eythar25: 6300 } },
  { major: "هنرهای تجسمی", university: "دانشگاه هنر تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 2200, region2: 2900, region3: 3800, eythar5: 4150, eythar25: 7700 } },
  { major: "میهن‌شناسی - هنر", university: "دانشگاه هنر اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 2500, region2: 3300, region3: 4300, eythar5: 4700, eythar25: 8800 } },
  { major: "فرش", university: "دانشگاه هنر اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 3200, region2: 4200, region3: 5500, eythar5: 6000, eythar25: 11000 } },
  { major: "صنایع دستی", university: "دانشگاه هنر اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 3800, region2: 5000, region3: 6500, eythar5: 7100, eythar25: 13000 } },
  { major: "گرافیک", university: "دانشگاه هنر اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 2800, region2: 3700, region3: 4800, eythar5: 5200, eythar25: 9500 } },
  { major: "هنرهای نمایشی - بازیگری", university: "دانشگاه هنر تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 3500, region2: 4600, region3: 6000, eythar5: 6550, eythar25: 12000 } },
  { major: "سینما - کارگردانی", university: "دانشگاه هنر تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 4200, region2: 5500, region3: 7200, eythar5: 7800, eythar25: 14000 } },
  { major: "موزیک", university: "دانشگاه هنر تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 4500, region2: 5900, region3: 7700, eythar5: 8400, eythar25: 15000 } },
  { major: "معماری", university: "دانشگاه هنر تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 5200, region2: 6800, region3: 8900, eythar5: 9700, eythar25: 17500 } },
  { major: "شهرسازی", university: "دانشگاه هنر تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 6500, region2: 8550, region3: 11100, eythar5: 12100, eythar25: 22000 } },
  { major: "هنرهای تجسمی", university: "دانشگاه هنر اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 3500, region2: 4600, region3: 6000, eythar5: 6550, eythar25: 12000 } },
  { major: "نقاشی", university: "دانشگاه هنر اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 4200, region2: 5500, region3: 7200, eythar5: 7800, eythar25: 14000 } },
  { major: "بافندگی", university: "دانشگاه هنر اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 7500, region2: 9900, region3: 12900, eythar5: 14000, eythar25: 25500 } },
  { major: "چاپ پارچه", university: "دانشگاه هنر اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 8500, region2: 11200, region3: 14600, eythar5: 15900, eythar25: 29000 } },
  { major: "گرافیک", university: "دانشگاه آزاد تهران هنر", universityType: "azad", city: "تهران",
    cutoffs: { region1: 9500, region2: 12500, region3: 16300, eythar5: 17700, eythar25: 32000 } },
  { major: "نقاشی", university: "دانشگاه آزاد تهران هنر", universityType: "azad", city: "تهران",
    cutoffs: { region1: 12000, region2: 15800, region3: 20500, eythar5: 22300, eythar25: 40000 } },
  { major: "هنرهای نمایشی", university: "دانشگاه آزاد تهران هنر", universityType: "azad", city: "تهران",
    cutoffs: { region1: 14000, region2: 18500, region3: 24000, eythar5: 26100, eythar25: 47000 } },
  { major: "گرافیک", university: "دانشگاه غیرانتفاعی هنر", universityType: "ghayrentefai", city: "تهران",
    cutoffs: { region1: 18000, region2: 23800, region3: 30900, eythar5: 33600, eythar25: 60500 } },
  { major: "نقاشی", university: "دانشگاه غیرانتفاعی هنر", universityType: "ghayrentefai", city: "تهران",
    cutoffs: { region1: 22000, region2: 29000, region3: 37600, eythar5: 40800, eythar25: 73500 } },
];

// ───────────── ZABAN (Language) ─────────────
const ZABAN: MajorRow[] = [
  { major: "مترجمی زبان انگلیسی", university: "دانشگاه علامه طباطبایی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 850, region2: 1130, region3: 1470, eythar5: 1610, eythar25: 3050 } },
  { major: "زبان و ادبیات انگلیسی", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1100, region2: 1460, region3: 1900, eythar5: 2080, eythar25: 3900 } },
  { major: "زبان و ادبیات انگلیسی", university: "دانشگاه علامه طباطبایی", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1500, region2: 1990, region3: 2590, eythar5: 2840, eythar25: 5300 } },
  { major: "مترجمی زبان انگلیسی", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 1300, region2: 1720, region3: 2240, eythar5: 2450, eythar25: 4600 } },
  { major: "زبان و ادبیات فرانسوی", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 3200, region2: 4200, region3: 5500, eythar5: 6000, eythar25: 11000 } },
  { major: "زبان و ادبیات آلمانی", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 4500, region2: 5900, region3: 7700, eythar5: 8400, eythar25: 15000 } },
  { major: "زبان و ادبیات روسی", university: "دانشگاه تهران", universityType: "dolati", city: "تهران",
    cutoffs: { region1: 5500, region2: 7300, region3: 9500, eythar5: 10400, eythar25: 19000 } },
  { major: "مترجمی زبان انگلیسی", university: "دانشگاه فردوسی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 3500, region2: 4600, region3: 6000, eythar5: 6550, eythar25: 12000 } },
  { major: "زبان و ادبیات انگلیسی", university: "دانشگاه فردوسی مشهد", universityType: "dolati", city: "مشهد",
    cutoffs: { region1: 4200, region2: 5500, region3: 7200, eythar5: 7800, eythar25: 14000 } },
  { major: "زبان و ادبیات انگلیسی", university: "دانشگاه شیراز", universityType: "dolati", city: "شیراز",
    cutoffs: { region1: 5500, region2: 7300, region3: 9500, eythar5: 10400, eythar25: 19000 } },
  { major: "زبان و ادبیات انگلیسی", university: "دانشگاه اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 5200, region2: 6800, region3: 8900, eythar5: 9700, eythar25: 17500 } },
  { major: "مترجمی زبان انگلیسی", university: "دانشگاه اصفهان", universityType: "dolati", city: "اصفهان",
    cutoffs: { region1: 4800, region2: 6300, region3: 8200, eythar5: 8900, eythar25: 16000 } },
  { major: "زبان و ادبیات انگلیسی", university: "دانشگاه تبریز", universityType: "dolati", city: "تبریز",
    cutoffs: { region1: 6800, region2: 8950, region3: 11600, eythar5: 12600, eythar25: 23000 } },
  { major: "آموزش زبان انگلیسی", university: "دانشگاه فرهنگیان", universityType: "fanhariyan", city: "تهران",
    cutoffs: { region1: 12000, region2: 15800, region3: 20500, eythar5: 22300, eythar25: 40000 } },
  { major: "مترجمی زبان انگلیسی", university: "دانشگاه آزاد تهران مرک", universityType: "azad", city: "تهران",
    cutoffs: { region1: 8500, region2: 11200, region3: 14600, eythar5: 15900, eythar25: 29000 } },
  { major: "زبان و ادبیات انگلیسی", university: "دانشگاه آزاد تهران جنوب", universityType: "azad", city: "تهران",
    cutoffs: { region1: 11000, region2: 14500, region3: 18800, eythar5: 20400, eythar25: 37000 } },
  { major: "مترجمی زبان انگلیسی", university: "دانشگاه آزاد نجف‌آباد", universityType: "azad", city: "نجف‌آباد",
    cutoffs: { region1: 14000, region2: 18500, region3: 24000, eythar5: 26100, eythar25: 47000 } },
  { major: "زبان و ادبیات انگلیسی", university: "دانشگاه پیام نور تهران", universityType: "payamnoor", city: "تهران",
    cutoffs: { region1: 22000, region2: 29000, region3: 37600, eythar5: 40800, eythar25: 73500 } },
  { major: "مترجمی زبان انگلیسی", university: "دانشگاه پیام نور", universityType: "payamnoor", city: "تهران",
    cutoffs: { region1: 18000, region2: 23800, region3: 30900, eythar5: 33600, eythar25: 60500 } },
  { major: "زبان و ادبیات انگلیسی", university: "دانشگاه غیرانتفاعی مهر", universityType: "ghayrentefai", city: "تهران",
    cutoffs: { region1: 28000, region2: 36800, region3: 47700, eythar5: 51800, eythar25: 93500 } },
];

// Real Konkur data from PDF (ریاضی group, 1404) — 1444 entries
import { RIAZI_REAL } from './riazi-real-data';

export const DATASET: Record<GroupKey, MajorRow[]> = {
  riazi: RIAZI_REAL.length > 0 ? RIAZI_REAL : RIAZI,
  tajrobi: TAJROBI,
  ensani: ENSANI,
  honar: HONAR,
  zaban: ZABAN,
};

// ───────────── Estimation logic ─────────────
export interface EstimatedRow extends MajorRow {
  cutoff: number;            // the cutoff for the selected quota
  chance: number;            // 0..100 — admission probability based on distance from cutoff
  bucket: "optimistic" | "realistic" | "pessimistic";
  rankDistance: number;      // cutoff - userRank (positive = user better than cutoff)
}

export interface EstimateResult {
  group: GroupKey;
  quota: QuotaKey;
  rank: number;
  totalChoices: number;
  optimistic: EstimatedRow[];
  realistic: EstimatedRow[];
  pessimistic: EstimatedRow[];
  summary: {
    bestChance: EstimatedRow | null;
    medianRank: number | null;
    reachableCount: number; // optimistic + realistic
  };
}

// Persian digit formatter
export function toPersianDigits(input: string | number): string {
  const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(input).replace(/\d/g, (d) => persian[Number(d)]);
}

// Compute the chance for the user to be admitted given their rank and the past-year cutoff.
// Lower rank number = better. If userRank <= cutoff → admission possible.
// Returns 0..100 percent.
function computeChance(userRank: number, cutoff: number): number {
  if (userRank <= cutoff) {
    // user is at or better than the past-year cutoff — chance is high.
    // Distance: how far below (better) than cutoff.
    const ratio = cutoff === 0 ? 0 : (cutoff - userRank) / cutoff;
    // 0% better → 75% chance (just at the edge), 25%+ better than cutoff → ~99%
    return Math.min(99, Math.round(75 + ratio * 100));
  }
  // user rank is worse than cutoff
  const ratio = userRank === 0 ? 0 : (userRank - cutoff) / cutoff;
  // 0% worse → 75% (boundary), grows worse as ratio increases
  if (ratio < 0.05) return Math.round(70 - ratio * 400); // very close below cutoff
  if (ratio < 0.15) return Math.round(50 - (ratio - 0.05) * 200);
  if (ratio < 0.4) return Math.round(30 - (ratio - 0.15) * 80);
  return Math.max(1, Math.round(10 - (ratio - 0.4) * 15));
}

export function estimate(group: GroupKey, quota: QuotaKey, rank: number): EstimateResult {
  const rows = DATASET[group] ?? [];
  const bucketed: EstimatedRow[] = [];

  for (const row of rows) {
    const cutoff = row.cutoffs[quota];
    if (cutoff === undefined) continue;
    const chance = computeChance(rank, cutoff);
    const rankDistance = cutoff - rank; // positive: user better than cutoff
    let bucket: EstimatedRow["bucket"];
    // خوش‌بینانه = انتخاب‌های رویایی (رتبه شما بدتر از حد قبولی) — شانس پایین
    // بدبینانه = انتخاب‌های امن (رتبه شما بهتر از حد قبولی) — شانس بالا
    // منطقی = نزدیک به حد قبولی — شانس متوسط
    if (rank <= cutoff * 0.85) bucket = "pessimistic"; // rank much better than cutoff = safe (بدبینانه)
    else if (rank <= cutoff * 1.15) bucket = "realistic";
    else bucket = "optimistic"; // rank worse than cutoff = dream/reach (خوش‌بینانه)
    bucketed.push({ ...row, cutoff, chance, bucket, rankDistance });
  }

  // خوش‌بینانه: sort by best chance (closest to cutoff first = best among reach choices)
  const optimistic = bucketed
    .filter((r) => r.bucket === "optimistic")
    .sort((a, b) => b.chance - a.chance);
  const realistic = bucketed
    .filter((r) => r.bucket === "realistic")
    .sort((a, b) => b.chance - a.chance);
  // بدبینانه: sort by best chance (safest first)
  const pessimistic = bucketed
    .filter((r) => r.bucket === "pessimistic")
    .sort((a, b) => b.chance - a.chance);

  // reachable = بدبینانه + منطقی (safe + realistic choices you can get into)
  const reachable = pessimistic.length + realistic.length;
  const allCutoffs = bucketed.map((r) => r.cutoff).sort((a, b) => a - b);
  const medianRank = allCutoffs.length
    ? allCutoffs[Math.floor(allCutoffs.length / 2)]
    : null;
  const bestChance = bucketed.length
    ? bucketed.reduce((a, b) => (b.chance > a.chance ? b : a))
    : null;

  return {
    group,
    quota,
    rank,
    totalChoices: bucketed.length,
    optimistic,
    realistic,
    pessimistic,
    summary: {
      bestChance,
      medianRank,
      reachableCount: reachable,
    },
  };
}

// ───────────── Recommended priority list ─────────────
// Generates a recommended 24-choice Konkur priority list using the standard
// "3 buckets of 8" strategy: 8 optimistic (safe), 8 realistic (logical), 8
// pessimistic (reach/long-shot). This is the commonly-recommended pattern
// for Konkur 선택 رشته.
export interface PriorityItem extends EstimatedRow {
  priority: number; // 1..24 (1 = highest priority)
  strategy: 'safe' | 'logical' | 'reach';
}

export interface PriorityList {
  items: PriorityItem[];
  safe: PriorityItem[];
  logical: PriorityItem[];
  reach: PriorityItem[];
}

export function buildPriorityList(result: EstimateResult): PriorityList {
  // Sort each bucket by chance (best first). For safe/reach, we want the
  // best chance at the top of each sub-list. For logical, we want the closest
  // to the user's rank (smallest absolute rankDistance) at the top.
  const safe = [...result.optimistic]
    .sort((a, b) => b.chance - a.chance)
    .slice(0, 8)
    .map((r, i) => ({ ...r, priority: i + 1, strategy: 'safe' as const }));

  const logical = [...result.realistic]
    .sort((a, b) => Math.abs(a.rankDistance) - Math.abs(b.rankDistance))
    .slice(0, 8)
    .map((r, i) => ({ ...r, priority: safe.length + i + 1, strategy: 'logical' as const }));

  const reach = [...result.pessimistic]
    .sort((a, b) => b.chance - a.chance)
    .slice(0, 8)
    .map((r, i) => ({ ...r, priority: safe.length + logical.length + i + 1, strategy: 'reach' as const }));

  // Re-number priorities 1..N so they're contiguous even when buckets have <8
  const all = [...safe, ...logical, ...reach].map((r, i) => ({
    ...r,
    priority: i + 1,
  }));

  return {
    items: all,
    safe: all.filter((r) => r.strategy === 'safe'),
    logical: all.filter((r) => r.strategy === 'logical'),
    reach: all.filter((r) => r.strategy === 'reach'),
  };
}

// ───────────── CSV / JSON export ─────────────
export function resultToCSV(result: EstimateResult): string {
  const headers = [
    'اولویت پیشنهادی',
    'دسته',
    'رشته',
    'دانشگاه',
    'نوع دانشگاه',
    'شهر',
    'آخرین رتبه قبولی',
    'شانس قبولی (٪)',
    'اختلاف رتبه با آخرین قبولی',
  ];
  const all = [
    ...result.optimistic,
    ...result.realistic,
    ...result.pessimistic,
  ];
  // Sort: optimistic first (by chance desc), then realistic, then pessimistic
  const bucketOrder = { optimistic: 0, realistic: 1, pessimistic: 2 };
  const bucketLabel = { optimistic: 'خوش‌بینانه', realistic: 'منطقی', pessimistic: 'بدبینانه' };
  all.sort((a, b) => {
    const bo = bucketOrder[a.bucket] - bucketOrder[b.bucket];
    if (bo !== 0) return bo;
    return b.chance - a.chance;
  });
  const rows = all.map((r, i) => [
    i + 1,
    bucketLabel[r.bucket],
    r.major,
    r.university,
    UNIVERSITY_TYPE_LABEL[r.universityType],
    r.city || '',
    r.cutoff,
    r.chance,
    r.rankDistance > 0 ? `+${r.rankDistance} (بهتر)` : `${r.rankDistance} (بدتر)`,
  ]);
  const allRows = [headers, ...rows];
  // CSV (UTF-8 with BOM for Excel compatibility)
  const csv = allRows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell);
          // Quote cells containing commas, quotes, or newlines
          if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
          return s;
        })
        .join(',')
    )
    .join('\n');
  return '\uFEFF' + csv; // BOM
}

export function resultToJSON(result: EstimateResult): string {
  const all = [
    ...result.optimistic,
    ...result.realistic,
    ...result.pessimistic,
  ];
  const payload = {
    meta: {
      group: result.group,
      quota: result.quota,
      rank: result.rank,
      totalChoices: result.totalChoices,
      reachableCount: result.summary.reachableCount,
      medianRank: result.summary.medianRank,
      bestChance: result.summary.bestChance
        ? {
            major: result.summary.bestChance.major,
            university: result.summary.bestChance.university,
            chance: result.summary.bestChance.chance,
          }
        : null,
      generatedAt: new Date().toISOString(),
    },
    rows: all.map((r) => ({
      major: r.major,
      university: r.university,
      universityType: UNIVERSITY_TYPE_LABEL[r.universityType],
      city: r.city,
      cutoff: r.cutoff,
      chance: r.chance,
      bucket: r.bucket,
      bucketLabel:
        r.bucket === 'optimistic'
          ? 'خوش‌بینانه'
          : r.bucket === 'realistic'
            ? 'منطقی'
            : 'بدبینانه',
      rankDistance: r.rankDistance,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

// ───────────── Detailed statistics ─────────────
// Computes a richer statistical summary of the user's standing relative to
// past-year cutoff ranks for the active group+quota.
export interface DetailedStats {
  // Rank-related
  userRank: number;
  bestCutoff: number;       // smallest (hardest) cutoff in the dataset
  worstCutoff: number;      // largest (easiest) cutoff in the dataset
  meanCutoff: number;
  medianCutoff: number;
  stdDevCutoff: number;
  // Percentile of the user's rank: what % of majors have a harder cutoff
  // (i.e., cutoff smaller than user's rank — meaning the user CAN'T get in)
  // Higher percentile = the user is in a worse position relative to the dataset
  userPercentile: number;   // 0..100
  // How many majors are reachable (optimistic + realistic)
  reachableCount: number;
  // How many majors are out of reach (pessimistic)
  outOfReachCount: number;
  // Average chance across all rows
  averageChance: number;
  // The "ladder" of cutoffs (sorted desc by chance) — used by the chart
  // Each entry is {chance, count} bin
  chanceDistribution: { bin: string; count: number; color: string }[];
  // Recommendation tier
  tier: 'excellent' | 'good' | 'fair' | 'challenging' | 'difficult';
  tierLabel: string;
  tierDescription: string;
}

export function computeDetailedStats(result: EstimateResult): DetailedStats {
  const all = [
    ...result.optimistic,
    ...result.realistic,
    ...result.pessimistic,
  ];
  const cutoffs = all.map((r) => r.cutoff).sort((a, b) => a - b);
  const n = cutoffs.length;
  const sum = cutoffs.reduce((a, b) => a + b, 0);
  const mean = n ? sum / n : 0;
  const median = n ? cutoffs[Math.floor(n / 2)] : 0;
  const variance = n
    ? cutoffs.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) / n
    : 0;
  const stdDev = Math.sqrt(variance);
  const best = n ? cutoffs[0] : 0;
  const worst = n ? cutoffs[n - 1] : 0;
  // User percentile: what fraction of cutoffs are HARDER than user's rank
  // (i.e., cutoff < userRank → user can't get in → user is worse than that major)
  const harder = cutoffs.filter((c) => c < result.rank).length;
  const userPercentile = n ? (harder / n) * 100 : 0;

  const chances = all.map((r) => r.chance);
  const averageChance = n
    ? Math.round(chances.reduce((a, b) => a + b, 0) / n)
    : 0;

  // Chance distribution bins (matching the existing chart)
  const bins = [
    { bin: '۹۰-۹۹٪', min: 90, max: 100, color: '#10b981' },
    { bin: '۷۰-۸۹٪', min: 70, max: 89, color: '#22c55e' },
    { bin: '۵۰-۶۹٪', min: 50, max: 69, color: '#eab308' },
    { bin: '۳۰-۴۹٪', min: 30, max: 49, color: '#f97316' },
    { bin: '۱۰-۲۹٪', min: 10, max: 29, color: '#ef4444' },
    { bin: '۰-۹٪', min: 0, max: 9, color: '#dc2626' },
  ];
  const chanceDistribution = bins.map((b) => ({
    bin: b.bin,
    count: all.filter((r) => r.chance >= b.min && r.chance <= b.max).length,
    color: b.color,
  }));

  // Tier
  const reachRate = n ? (result.summary.reachableCount / n) * 100 : 0;
  let tier: DetailedStats['tier'];
  if (reachRate >= 80) tier = 'excellent';
  else if (reachRate >= 60) tier = 'good';
  else if (reachRate >= 40) tier = 'fair';
  else if (reachRate >= 20) tier = 'challenging';
  else tier = 'difficult';
  const tierMeta: Record<DetailedStats['tier'], { label: string; desc: string }> = {
    excellent: {
      label: 'عالی',
      desc: 'رتبه شما در محدوده بسیار خوبی قرار دارد — شانس قبولی در اکثر رشته‌محل‌ها بالاست.',
    },
    good: {
      label: 'خوب',
      desc: 'رتبه شما نسبتاً خوب است — گزینه‌های قابل قبولی در دسترس شماست.',
    },
    fair: {
      label: 'متوسط',
      desc: 'رتبه شما متوسط است — باید با دقت انتخاب کنید و سهم گزینه‌های منطقی را بیشتر کنید.',
    },
    challenging: {
      label: 'چالشی',
      desc: 'رتبه شما چالش‌برانگیز است — روی گزینه‌های منطقی و بدبینانه تمرکز کنید.',
    },
    difficult: {
      label: 'دشوار',
      desc: 'رتبه شما دشوار است — گزینه‌های امن کم است؛ باید واقع‌بینانه انتخاب کنید.',
    },
  };

  return {
    userRank: result.rank,
    bestCutoff: best,
    worstCutoff: worst,
    meanCutoff: Math.round(mean),
    medianCutoff: median,
    stdDevCutoff: Math.round(stdDev),
    userPercentile: Math.round(userPercentile),
    reachableCount: result.summary.reachableCount,
    outOfReachCount: result.pessimistic.length,
    averageChance,
    chanceDistribution,
    tier,
    tierLabel: tierMeta[tier].label,
    tierDescription: tierMeta[tier].desc,
  };
}

