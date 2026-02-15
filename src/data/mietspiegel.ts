export interface MietspiegelEntry {
  gemeinde: string;
  quelle: string;
  stand: string;
  mieten: {
    einfach: { min: number; max: number };
    mittel: { min: number; max: number };
    gut: { min: number; max: number };
  };
  durchschnitt: number;
}

export const mietspiegelData: Record<string, MietspiegelEntry> = {
  "Berlin": {
    gemeinde: "Berlin", quelle: "Berliner Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 6.50, max: 8.50 }, mittel: { min: 8.50, max: 12.00 }, gut: { min: 12.00, max: 17.00 } },
    durchschnitt: 10.50,
  },
  "Köln": {
    gemeinde: "Köln", quelle: "Kölner Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 8.00, max: 10.50 }, mittel: { min: 10.50, max: 14.00 }, gut: { min: 14.00, max: 18.00 } },
    durchschnitt: 12.50,
  },
  "Düsseldorf": {
    gemeinde: "Düsseldorf", quelle: "Düsseldorfer Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 8.50, max: 11.00 }, mittel: { min: 11.00, max: 14.50 }, gut: { min: 14.50, max: 19.00 } },
    durchschnitt: 13.00,
  },
  "Dortmund": {
    gemeinde: "Dortmund", quelle: "Dortmunder Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 5.50, max: 7.50 }, mittel: { min: 7.50, max: 10.00 }, gut: { min: 10.00, max: 13.00 } },
    durchschnitt: 8.50,
  },
  "Essen": {
    gemeinde: "Essen", quelle: "Essener Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 5.50, max: 7.50 }, mittel: { min: 7.50, max: 10.50 }, gut: { min: 10.50, max: 13.50 } },
    durchschnitt: 8.80,
  },
  "Duisburg": {
    gemeinde: "Duisburg", quelle: "Duisburger Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 5.00, max: 7.00 }, mittel: { min: 7.00, max: 9.50 }, gut: { min: 9.50, max: 12.50 } },
    durchschnitt: 7.80,
  },
  "Bochum": {
    gemeinde: "Bochum", quelle: "Bochumer Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 5.50, max: 7.50 }, mittel: { min: 7.50, max: 10.00 }, gut: { min: 10.00, max: 12.50 } },
    durchschnitt: 8.20,
  },
  "Wuppertal": {
    gemeinde: "Wuppertal", quelle: "Wuppertaler Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 5.00, max: 7.00 }, mittel: { min: 7.00, max: 9.50 }, gut: { min: 9.50, max: 12.00 } },
    durchschnitt: 7.80,
  },
  "Bielefeld": {
    gemeinde: "Bielefeld", quelle: "Bielefelder Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 5.50, max: 7.50 }, mittel: { min: 7.50, max: 10.00 }, gut: { min: 10.00, max: 13.00 } },
    durchschnitt: 8.50,
  },
  "Bonn": {
    gemeinde: "Bonn", quelle: "Bonner Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 7.50, max: 10.00 }, mittel: { min: 10.00, max: 13.50 }, gut: { min: 13.50, max: 17.00 } },
    durchschnitt: 11.50,
  },
  "Münster": {
    gemeinde: "Münster", quelle: "Münsteraner Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 7.00, max: 9.50 }, mittel: { min: 9.50, max: 13.00 }, gut: { min: 13.00, max: 16.50 } },
    durchschnitt: 11.00,
  },
  "Aachen": {
    gemeinde: "Aachen", quelle: "Aachener Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 6.50, max: 9.00 }, mittel: { min: 9.00, max: 12.00 }, gut: { min: 12.00, max: 15.00 } },
    durchschnitt: 10.00,
  },
  "Gelsenkirchen": {
    gemeinde: "Gelsenkirchen", quelle: "Gelsenkirchener Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 4.50, max: 6.50 }, mittel: { min: 6.50, max: 8.50 }, gut: { min: 8.50, max: 11.00 } },
    durchschnitt: 7.00,
  },
  "Mönchengladbach": {
    gemeinde: "Mönchengladbach", quelle: "Mönchengladbacher Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 5.50, max: 7.50 }, mittel: { min: 7.50, max: 10.00 }, gut: { min: 10.00, max: 12.50 } },
    durchschnitt: 8.20,
  },
  "Krefeld": {
    gemeinde: "Krefeld", quelle: "Krefelder Mietspiegel 2024", stand: "2024",
    mieten: { einfach: { min: 5.50, max: 7.50 }, mittel: { min: 7.50, max: 10.00 }, gut: { min: 10.00, max: 12.50 } },
    durchschnitt: 8.30,
  },
};

export function getMietspiegel(gemeindeName: string): MietspiegelEntry | null {
  if (mietspiegelData[gemeindeName]) return mietspiegelData[gemeindeName];
  const key = Object.keys(mietspiegelData).find(k =>
    gemeindeName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(gemeindeName.toLowerCase())
  );
  return key ? mietspiegelData[key] : null;
}
