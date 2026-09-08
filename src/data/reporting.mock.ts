import type {
  ActivityDetailRow,
  ReportingRooftop,
  WeeklyPerformanceWeek,
} from "@/types/reporting";

/**
 * Portfolio rooftops for Ikon SM Admin CER ranking.
 * Single-rooftop groups stay in the dataset so visibility rules can hide them.
 */
export const REPORTING_ROOFTOPS: ReportingRooftop[] = [
  {
    id: "rt-ikon-north",
    rooftop: "Ikon Motors North",
    dealerGroup: "Ikon Motors",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 1840, retried: 210, clickedFirstTime: 312 },
      lm: { sent: 2012, retried: 198, clickedFirstTime: 274 },
      ytd: { sent: 14820, retried: 1640, clickedFirstTime: 2210 },
    },
  },
  {
    id: "rt-ikon-south",
    rooftop: "Ikon Motors South",
    dealerGroup: "Ikon Motors",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 1624, retried: 188, clickedFirstTime: 244 },
      lm: { sent: 1710, retried: 176, clickedFirstTime: 198 },
      ytd: { sent: 12940, retried: 1422, clickedFirstTime: 1688 },
    },
  },
  {
    id: "rt-ikon-west",
    rooftop: "Ikon Motors West",
    dealerGroup: "Ikon Motors",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 980, retried: 142, clickedFirstTime: 118 },
      lm: { sent: 1044, retried: 136, clickedFirstTime: 96 },
      ytd: { sent: 8120, retried: 980, clickedFirstTime: 844 },
    },
  },
  {
    id: "rt-ikon-east",
    rooftop: "Ikon Motors East",
    dealerGroup: "Ikon Motors",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 12, retried: 2, clickedFirstTime: 12 },
      lm: { sent: 8, retried: 1, clickedFirstTime: 8 },
      ytd: { sent: 86, retried: 14, clickedFirstTime: 41 },
    },
  },
  {
    id: "rt-premier-main",
    rooftop: "Premier Auto Group",
    dealerGroup: "Premier Auto Group",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 1320, retried: 164, clickedFirstTime: 238 },
      lm: { sent: 1408, retried: 152, clickedFirstTime: 196 },
      ytd: { sent: 11040, retried: 1210, clickedFirstTime: 1762 },
    },
  },
  {
    id: "rt-premier-downtown",
    rooftop: "Premier Downtown",
    dealerGroup: "Premier Auto Group",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 760, retried: 88, clickedFirstTime: 91 },
      lm: { sent: 802, retried: 94, clickedFirstTime: 74 },
      ytd: { sent: 6240, retried: 710, clickedFirstTime: 688 },
    },
  },
  {
    id: "rt-premier-airport",
    rooftop: "Premier Airport",
    dealerGroup: "Premier Auto Group",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 1, retried: 0, clickedFirstTime: 1 },
      lm: { sent: 4, retried: 0, clickedFirstTime: 3 },
      ytd: { sent: 28, retried: 3, clickedFirstTime: 19 },
    },
  },
  {
    id: "rt-lakeside-honda",
    rooftop: "Lakeside Honda",
    dealerGroup: "Lakeside Auto Group",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 890, retried: 102, clickedFirstTime: 156 },
      lm: { sent: 944, retried: 98, clickedFirstTime: 128 },
      ytd: { sent: 7340, retried: 840, clickedFirstTime: 1102 },
    },
  },
  {
    id: "rt-lakeside-ford",
    rooftop: "Lakeside Ford",
    dealerGroup: "Lakeside Auto Group",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 710, retried: 86, clickedFirstTime: 92 },
      lm: { sent: 766, retried: 80, clickedFirstTime: 81 },
      ytd: { sent: 5880, retried: 640, clickedFirstTime: 704 },
    },
  },
  {
    id: "rt-lakeside-toyota",
    rooftop: "Lakeside Toyota",
    dealerGroup: "Lakeside Auto Group",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 640, retried: 74, clickedFirstTime: 70 },
      lm: { sent: 688, retried: 70, clickedFirstTime: 58 },
      ytd: { sent: 5210, retried: 590, clickedFirstTime: 548 },
    },
  },
  {
    id: "rt-heritage-bmw",
    rooftop: "Heritage BMW",
    dealerGroup: "Heritage Luxury Motors",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 540, retried: 48, clickedFirstTime: 97 },
      lm: { sent: 512, retried: 44, clickedFirstTime: 82 },
      ytd: { sent: 4180, retried: 390, clickedFirstTime: 688 },
    },
  },
  {
    id: "rt-heritage-audi",
    rooftop: "Heritage Audi",
    dealerGroup: "Heritage Luxury Motors",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 488, retried: 41, clickedFirstTime: 72 },
      lm: { sent: 470, retried: 38, clickedFirstTime: 61 },
      ytd: { sent: 3920, retried: 340, clickedFirstTime: 540 },
    },
  },
  {
    id: "rt-summit-chevy",
    rooftop: "Summit Chevrolet",
    dealerGroup: "Summit Automotive Group",
    isSmEnabled: true,
    metricsByPeriod: {
      mtd: { sent: 420, retried: 36, clickedFirstTime: 58 },
      lm: { sent: 398, retried: 32, clickedFirstTime: 44 },
      ytd: { sent: 3180, retried: 280, clickedFirstTime: 396 },
    },
  },
];

/**
 * One record per dealer per week. Reports sums dealers inside each week so a
 * group or portfolio scope can show cumulative weekly totals.
 */
const WEEKLY_CER_SEED_WEEKS: WeeklyPerformanceWeek[] = [
  {
    id: "week-2026-08-01",
    year: 2026,
    month: 8,
    label: "Aug 01–Aug 07",
    startDate: "2026-08-01",
    endDate: "2026-08-07",
    dealer: "Ikon Motors North",
    metricsByMessage: {
      initial: { sent: 420, clicks: 78 },
      reminder1: { sent: 186, clicks: 24 },
      reminder2: { sent: 94, clicks: 9 },
      reminder3: { sent: 41, clicks: 3 },
    },
  },
  {
    id: "week-2026-08-01",
    year: 2026,
    month: 8,
    label: "Aug 01–Aug 07",
    startDate: "2026-08-01",
    endDate: "2026-08-07",
    dealer: "Ikon Motors South",
    metricsByMessage: {
      initial: { sent: 388, clicks: 61 },
      reminder1: { sent: 172, clicks: 19 },
      reminder2: { sent: 88, clicks: 7 },
      reminder3: { sent: 36, clicks: 2 },
    },
  },
  {
    id: "week-2026-08-01",
    year: 2026,
    month: 8,
    label: "Aug 01–Aug 07",
    startDate: "2026-08-01",
    endDate: "2026-08-07",
    dealer: "Premier Auto Group",
    metricsByMessage: {
      initial: { sent: 351, clicks: 64 },
      reminder1: { sent: 154, clicks: 21 },
      reminder2: { sent: 72, clicks: 8 },
      reminder3: { sent: 29, clicks: 2 },
    },
  },
  {
    id: "week-2026-08-01",
    year: 2026,
    month: 8,
    label: "Aug 01–Aug 07",
    startDate: "2026-08-01",
    endDate: "2026-08-07",
    dealer: "Lakeside Honda",
    metricsByMessage: {
      initial: { sent: 296, clicks: 52 },
      reminder1: { sent: 128, clicks: 16 },
      reminder2: { sent: 61, clicks: 5 },
      reminder3: { sent: 22, clicks: 1 },
    },
  },
  {
    id: "week-2026-08-08",
    year: 2026,
    month: 8,
    label: "Aug 08–Aug 14",
    startDate: "2026-08-08",
    endDate: "2026-08-14",
    dealer: "Ikon Motors North",
    metricsByMessage: {
      initial: { sent: 402, clicks: 71 },
      reminder1: { sent: 178, clicks: 22 },
      reminder2: { sent: 90, clicks: 8 },
      reminder3: { sent: 38, clicks: 2 },
    },
  },
  {
    id: "week-2026-08-08",
    year: 2026,
    month: 8,
    label: "Aug 08–Aug 14",
    startDate: "2026-08-08",
    endDate: "2026-08-14",
    dealer: "Ikon Motors South",
    metricsByMessage: {
      initial: { sent: 372, clicks: 57 },
      reminder1: { sent: 164, clicks: 18 },
      reminder2: { sent: 84, clicks: 6 },
      reminder3: { sent: 34, clicks: 2 },
    },
  },
  {
    id: "week-2026-08-08",
    year: 2026,
    month: 8,
    label: "Aug 08–Aug 14",
    startDate: "2026-08-08",
    endDate: "2026-08-14",
    dealer: "Premier Auto Group",
    metricsByMessage: {
      initial: { sent: 338, clicks: 59 },
      reminder1: { sent: 148, clicks: 19 },
      reminder2: { sent: 69, clicks: 7 },
      reminder3: { sent: 27, clicks: 2 },
    },
  },
  {
    id: "week-2026-08-08",
    year: 2026,
    month: 8,
    label: "Aug 08–Aug 14",
    startDate: "2026-08-08",
    endDate: "2026-08-14",
    dealer: "Lakeside Honda",
    metricsByMessage: {
      initial: { sent: 284, clicks: 47 },
      reminder1: { sent: 122, clicks: 14 },
      reminder2: { sent: 58, clicks: 4 },
      reminder3: { sent: 20, clicks: 1 },
    },
  },
  {
    id: "week-2026-08-15",
    year: 2026,
    month: 8,
    label: "Aug 15–Aug 21",
    startDate: "2026-08-15",
    endDate: "2026-08-21",
    dealer: "Ikon Motors North",
    metricsByMessage: {
      initial: { sent: 438, clicks: 84 },
      reminder1: { sent: 194, clicks: 27 },
      reminder2: { sent: 98, clicks: 10 },
      reminder3: { sent: 43, clicks: 3 },
    },
  },
  {
    id: "week-2026-08-15",
    year: 2026,
    month: 8,
    label: "Aug 15–Aug 21",
    startDate: "2026-08-15",
    endDate: "2026-08-21",
    dealer: "Ikon Motors South",
    metricsByMessage: {
      initial: { sent: 401, clicks: 66 },
      reminder1: { sent: 178, clicks: 21 },
      reminder2: { sent: 91, clicks: 8 },
      reminder3: { sent: 38, clicks: 2 },
    },
  },
  {
    id: "week-2026-08-15",
    year: 2026,
    month: 8,
    label: "Aug 15–Aug 21",
    startDate: "2026-08-15",
    endDate: "2026-08-21",
    dealer: "Premier Auto Group",
    metricsByMessage: {
      initial: { sent: 364, clicks: 70 },
      reminder1: { sent: 160, clicks: 23 },
      reminder2: { sent: 75, clicks: 9 },
      reminder3: { sent: 31, clicks: 2 },
    },
  },
  {
    id: "week-2026-08-15",
    year: 2026,
    month: 8,
    label: "Aug 15–Aug 21",
    startDate: "2026-08-15",
    endDate: "2026-08-21",
    dealer: "Lakeside Honda",
    metricsByMessage: {
      initial: { sent: 308, clicks: 56 },
      reminder1: { sent: 134, clicks: 18 },
      reminder2: { sent: 64, clicks: 6 },
      reminder3: { sent: 24, clicks: 2 },
    },
  },
  {
    id: "week-2026-08-22",
    year: 2026,
    month: 8,
    label: "Aug 22–Aug 28",
    startDate: "2026-08-22",
    endDate: "2026-08-28",
    dealer: "Ikon Motors North",
    metricsByMessage: {
      initial: { sent: 386, clicks: 66 },
      reminder1: { sent: 170, clicks: 20 },
      reminder2: { sent: 86, clicks: 7 },
      reminder3: { sent: 36, clicks: 2 },
    },
  },
  {
    id: "week-2026-08-22",
    year: 2026,
    month: 8,
    label: "Aug 22–Aug 28",
    startDate: "2026-08-22",
    endDate: "2026-08-28",
    dealer: "Ikon Motors South",
    metricsByMessage: {
      initial: { sent: 359, clicks: 52 },
      reminder1: { sent: 158, clicks: 16 },
      reminder2: { sent: 80, clicks: 6 },
      reminder3: { sent: 32, clicks: 1 },
    },
  },
  {
    id: "week-2026-08-22",
    year: 2026,
    month: 8,
    label: "Aug 22–Aug 28",
    startDate: "2026-08-22",
    endDate: "2026-08-28",
    dealer: "Premier Auto Group",
    metricsByMessage: {
      initial: { sent: 327, clicks: 55 },
      reminder1: { sent: 143, clicks: 17 },
      reminder2: { sent: 67, clicks: 6 },
      reminder3: { sent: 26, clicks: 1 },
    },
  },
  {
    id: "week-2026-08-22",
    year: 2026,
    month: 8,
    label: "Aug 22–Aug 28",
    startDate: "2026-08-22",
    endDate: "2026-08-28",
    dealer: "Lakeside Honda",
    metricsByMessage: {
      initial: { sent: 272, clicks: 43 },
      reminder1: { sent: 118, clicks: 13 },
      reminder2: { sent: 56, clicks: 4 },
      reminder3: { sent: 19, clicks: 1 },
    },
  },
  {
    id: "week-2026-07-04",
    year: 2026,
    month: 7,
    label: "Jul 04–Jul 10",
    startDate: "2026-07-04",
    endDate: "2026-07-10",
    dealer: "Heritage BMW",
    metricsByMessage: {
      initial: { sent: 210, clicks: 41 },
      reminder1: { sent: 98, clicks: 14 },
      reminder2: { sent: 44, clicks: 4 },
      reminder3: { sent: 18, clicks: 1 },
    },
  },
  {
    id: "week-2026-07-04",
    year: 2026,
    month: 7,
    label: "Jul 04–Jul 10",
    startDate: "2026-07-04",
    endDate: "2026-07-10",
    dealer: "Ikon Motors North",
    metricsByMessage: {
      initial: { sent: 364, clicks: 62 },
      reminder1: { sent: 160, clicks: 19 },
      reminder2: { sent: 81, clicks: 7 },
      reminder3: { sent: 34, clicks: 2 },
    },
  },
];

interface WeeklyTemplate {
  id: string;
  year: number;
  month: number;
  label: string;
  startDate: string;
  endDate: string;
}

const WEEKLY_SEED_BASELINE_DEALER = "Ikon Motors North";
const WEEKLY_REMINDER_CLICK_MULTIPLIER = {
  initial: 1,
  reminder1: 0.58,
  reminder2: 0.42,
  reminder3: 0.3,
} as const;

function listWeeklyTemplates(weeks: WeeklyPerformanceWeek[]): WeeklyTemplate[] {
  const templatesById = new Map<string, WeeklyTemplate>();
  for (const week of weeks) {
    if (templatesById.has(week.id)) continue;
    templatesById.set(week.id, {
      id: week.id,
      year: week.year,
      month: week.month,
      label: week.label,
      startDate: week.startDate,
      endDate: week.endDate,
    });
  }

  return [...templatesById.values()].sort((left, right) =>
    left.startDate.localeCompare(right.startDate),
  );
}

function buildGeneratedWeeklyMetrics(input: {
  baselineWeek: WeeklyPerformanceWeek;
  rooftop: ReportingRooftop;
  rooftopIndex: number;
  weekIndex: number;
  baselineRooftop: ReportingRooftop;
  period: "mtd" | "lm";
}): WeeklyPerformanceWeek["metricsByMessage"] {
  const baselinePeriodMetrics = input.baselineRooftop.metricsByPeriod[input.period];
  const rooftopPeriodMetrics = input.rooftop.metricsByPeriod[input.period];
  const sentScale = rooftopPeriodMetrics.sent / baselinePeriodMetrics.sent;
  const clickScale =
    rooftopPeriodMetrics.clickedFirstTime / baselinePeriodMetrics.clickedFirstTime;
  const variance =
    1 + ((input.rooftopIndex % 5) - 2) * 0.03 + (input.weekIndex - 2) * 0.01;

  return {
    initial: scaleWeeklyMessageMetrics(
      input.baselineWeek.metricsByMessage.initial,
      sentScale,
      clickScale * WEEKLY_REMINDER_CLICK_MULTIPLIER.initial,
      variance,
    ),
    reminder1: scaleWeeklyMessageMetrics(
      input.baselineWeek.metricsByMessage.reminder1,
      sentScale,
      clickScale * WEEKLY_REMINDER_CLICK_MULTIPLIER.reminder1,
      variance,
    ),
    reminder2: scaleWeeklyMessageMetrics(
      input.baselineWeek.metricsByMessage.reminder2,
      sentScale,
      clickScale * WEEKLY_REMINDER_CLICK_MULTIPLIER.reminder2,
      variance,
    ),
    reminder3: scaleWeeklyMessageMetrics(
      input.baselineWeek.metricsByMessage.reminder3,
      sentScale,
      clickScale * WEEKLY_REMINDER_CLICK_MULTIPLIER.reminder3,
      variance,
    ),
  };
}

function scaleWeeklyMessageMetrics(
  metrics: { sent: number; clicks: number },
  sentScale: number,
  clickScale: number,
  variance: number,
): { sent: number; clicks: number } {
  const sent = Math.max(1, Math.round(metrics.sent * sentScale * variance));
  const clicks = Math.min(
    sent,
    Math.max(0, Math.round(metrics.clicks * clickScale * variance)),
  );
  return { sent, clicks };
}

function buildWeeklyCerWeeks(): WeeklyPerformanceWeek[] {
  const templates = listWeeklyTemplates(WEEKLY_CER_SEED_WEEKS);
  const baselineRooftop = REPORTING_ROOFTOPS.find(
    (rooftop) => rooftop.rooftop === WEEKLY_SEED_BASELINE_DEALER,
  );
  if (!baselineRooftop) return WEEKLY_CER_SEED_WEEKS;

  const baselineWeeksById = new Map(
    WEEKLY_CER_SEED_WEEKS.filter(
      (week) => week.dealer === WEEKLY_SEED_BASELINE_DEALER,
    ).map((week) => [week.id, week]),
  );
  const existingDealerWeekKeys = new Set(
    WEEKLY_CER_SEED_WEEKS.map((week) => `${week.dealer}::${week.id}`),
  );
  const generated: WeeklyPerformanceWeek[] = [];

  REPORTING_ROOFTOPS.forEach((rooftop, rooftopIndex) => {
    templates.forEach((template, weekIndex) => {
      const dealerWeekKey = `${rooftop.rooftop}::${template.id}`;
      if (existingDealerWeekKeys.has(dealerWeekKey)) return;

      const baselineWeek = baselineWeeksById.get(template.id);
      if (!baselineWeek) return;

      const period = template.month >= 8 ? "mtd" : "lm";
      generated.push({
        ...template,
        dealer: rooftop.rooftop,
        metricsByMessage: buildGeneratedWeeklyMetrics({
          baselineWeek,
          rooftop,
          rooftopIndex,
          weekIndex,
          baselineRooftop,
          period,
        }),
      });
    });
  });

  return [...WEEKLY_CER_SEED_WEEKS, ...generated];
}

export const WEEKLY_CER_WEEKS: WeeklyPerformanceWeek[] = buildWeeklyCerWeeks();

const ACTIVITY_CUSTOMERS_PER_DEALERSHIP = 10;
const ACTIVITY_MESSAGE_LABELS = [
  "Initial",
  "Reminder 1",
  "Reminder 2",
  "Reminder 3",
] as const;
const ACTIVITY_FIRST_NAMES = [
  "Lena",
  "David",
  "Sofia",
  "Marcus",
  "Yuki",
  "Hannah",
  "Theo",
  "Camila",
  "Andre",
  "Nora",
  "Ibrahim",
  "Grace",
  "Felix",
  "Maya",
  "Julian",
  "Clara",
  "Omar",
  "Ruby",
  "Nico",
  "Ivy",
] as const;
const ACTIVITY_LAST_NAMES = [
  "Brooks",
  "Chen",
  "Okoye",
  "Keller",
  "Morales",
  "Singh",
  "Walsh",
  "Kim",
  "Diaz",
  "Foster",
  "Haddad",
  "Reed",
  "Navarro",
  "Price",
  "Sato",
  "Bennett",
  "Cruz",
  "Hughes",
  "Ibarra",
  "Cole",
] as const;
const ACTIVITY_AREA_CODES = [
  "312",
  "214",
  "480",
  "615",
  "702",
  "858",
  "404",
  "503",
  "713",
  "206",
] as const;

/**
 * Named customers behind the activity drill-down. Extra generated rows stay on
 * 2026-08-01–20 so the rooftop + Aug 24–28 filter still returns Maria.
 */
const SEED_ACTIVITY_ROWS: ActivityDetailRow[] = [
  {
    id: "act-1",
    customer: "Maria Alvarez",
    vin: "1HGCM82633A004352",
    phone: "(312) 555-0142",
    email: "maria.alvarez@email.com",
    clickDate: "2026-08-28",
    message: "Initial",
    dealer: "Ikon Motors",
    rooftop: "Ikon Motors North",
    mileage: 41280,
  },
  {
    id: "act-2",
    customer: "James Whitaker",
    vin: "5NPE24AF6FH012883",
    phone: "(214) 555-0190",
    email: "j.whitaker@email.com",
    clickDate: "2026-08-27",
    message: "Reminder 1",
    dealer: "Ikon Motors",
    rooftop: "Ikon Motors South",
    mileage: 62840,
  },
  {
    id: "act-3",
    customer: "Priya Shah",
    vin: "2T1BURHE0JC084221",
    phone: "(480) 555-0177",
    email: "priya.shah@email.com",
    clickDate: "2026-08-26",
    message: "Initial",
    dealer: "Premier Auto Group",
    rooftop: "Premier Downtown",
    mileage: null,
  },
  {
    id: "act-4",
    customer: "Owen Blake",
    vin: "3FA6P0HD7LR214098",
    phone: "(615) 555-0118",
    email: "owen.blake@email.com",
    clickDate: "2026-08-25",
    message: "Reminder 2",
    dealer: "Lakeside Auto Group",
    rooftop: "Lakeside Ford",
    mileage: 87310,
  },
  {
    id: "act-5",
    customer: "Elena Rossi",
    vin: "WBA8E1C50JA441902",
    phone: "(702) 555-0133",
    email: "elena.rossi@email.com",
    clickDate: "2026-08-24",
    message: "Initial",
    dealer: "Heritage Luxury Motors",
    rooftop: "Heritage BMW",
    mileage: 22140,
  },
  {
    id: "act-6",
    customer: "Chris Nguyen",
    vin: "1C4RJFBG4LC123774",
    phone: "(858) 555-0164",
    email: "chris.nguyen@email.com",
    clickDate: "2026-08-22",
    message: "Reminder 3",
    dealer: "Ikon Motors",
    rooftop: "Ikon Motors West",
    mileage: null,
  },
  {
    id: "act-7",
    customer: "Aisha Rahman",
    vin: "JTDKN3DU5A0128841",
    phone: "(404) 555-0188",
    email: "aisha.rahman@email.com",
    clickDate: "2026-08-21",
    message: "Reminder 1",
    dealer: "Lakeside Auto Group",
    rooftop: "Lakeside Toyota",
    mileage: 55420,
  },
  {
    id: "act-8",
    customer: "Noah Patel",
    vin: "WAUENAF40JN045661",
    phone: "(503) 555-0121",
    email: "noah.patel@email.com",
    clickDate: "2026-08-18",
    message: "Initial",
    dealer: "Heritage Luxury Motors",
    rooftop: "Heritage Audi",
    mileage: 18990,
  },
];

function padDigits(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

function buildGeneratedActivityRow(
  rooftop: ReportingRooftop,
  rooftopIndex: number,
  slot: number,
  sequentialId: number,
): ActivityDetailRow {
  const nameIndex = rooftopIndex * ACTIVITY_CUSTOMERS_PER_DEALERSHIP + slot;
  const firstName =
    ACTIVITY_FIRST_NAMES[nameIndex % ACTIVITY_FIRST_NAMES.length];
  const lastName =
    ACTIVITY_LAST_NAMES[(nameIndex + slot + rooftopIndex) % ACTIVITY_LAST_NAMES.length];
  const day = padDigits((slot % 20) + 1, 2);
  const areaCode =
    ACTIVITY_AREA_CODES[nameIndex % ACTIVITY_AREA_CODES.length];

  return {
    id: `act-gen-${sequentialId}`,
    customer: `${firstName} ${lastName}`,
    vin: `1HGCM82633A${padDigits(sequentialId, 6)}`,
    phone: `(${areaCode}) 555-${padDigits(1000 + sequentialId, 4).slice(-4)}`,
    email: `${firstName}.${lastName}.${sequentialId}@email.com`.toLowerCase(),
    clickDate: `2026-08-${day}`,
    message: ACTIVITY_MESSAGE_LABELS[slot % ACTIVITY_MESSAGE_LABELS.length],
    dealer: rooftop.dealerGroup,
    rooftop: rooftop.rooftop,
    mileage: slot % 7 === 0 ? null : 14_200 + sequentialId * 137,
  };
}

function buildActivityDetailRows(): ActivityDetailRow[] {
  const seedRowsByRooftop = new Map<string, ActivityDetailRow[]>();
  for (const row of SEED_ACTIVITY_ROWS) {
    const existing = seedRowsByRooftop.get(row.rooftop) ?? [];
    existing.push(row);
    seedRowsByRooftop.set(row.rooftop, existing);
  }

  const rows: ActivityDetailRow[] = [];
  let sequentialId = SEED_ACTIVITY_ROWS.length;

  REPORTING_ROOFTOPS.forEach((rooftop, rooftopIndex) => {
    const seedRows = seedRowsByRooftop.get(rooftop.rooftop) ?? [];
    rows.push(...seedRows);

    const extraCount = Math.max(
      ACTIVITY_CUSTOMERS_PER_DEALERSHIP - seedRows.length,
      0,
    );
    for (let slot = 0; slot < extraCount; slot += 1) {
      sequentialId += 1;
      rows.push(
        buildGeneratedActivityRow(
          rooftop,
          rooftopIndex,
          seedRows.length + slot,
          sequentialId,
        ),
      );
    }
  });

  return rows;
}

export const ACTIVITY_DETAIL_ROWS: ActivityDetailRow[] =
  buildActivityDetailRows();

export const ACTIVITY_MESSAGES_SENT = 1840;
export const ACTIVITY_UPLIFT_PERCENT = 12.4;
