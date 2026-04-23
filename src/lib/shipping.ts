// Mapa CEP prefix → UF
const CEP_TO_UF: Record<string, string> = {
  "01": "SP","02":"SP","03":"SP","04":"SP","05":"SP","06":"SP","07":"SP","08":"SP","09":"SP",
  "10":"SP","11":"SP","12":"SP","13":"SP","14":"SP","15":"SP","16":"SP","17":"SP","18":"SP","19":"SP",
  "20":"RJ","21":"RJ","22":"RJ","23":"RJ","24":"RJ","25":"RJ","26":"RJ","27":"RJ","28":"RJ",
  "29":"ES",
  "30":"MG","31":"MG","32":"MG","33":"MG","34":"MG","35":"MG","36":"MG","37":"MG","38":"MG","39":"MG",
  "40":"BA","41":"BA","42":"BA","43":"BA","44":"BA","45":"BA","46":"BA","47":"BA","48":"BA",
  "49":"SE",
  "50":"PE","51":"PE","52":"PE","53":"PE","54":"PE","55":"PE","56":"PE",
  "57":"AL",
  "58":"PB",
  "59":"RN",
  "60":"CE","61":"CE","62":"CE","63":"CE",
  "64":"PI",
  "65":"MA","66":"PA","67":"PA","68":"PA",
  "69":"AM",
  "70":"DF","71":"DF","72":"DF","73":"DF",
  "74":"GO","75":"GO","76":"GO",
  "77":"TO",
  "78":"MT",
  "79":"MS",
  "80":"PR","81":"PR","82":"PR","83":"PR","84":"PR","85":"PR","86":"PR","87":"PR",
  "88":"SC","89":"SC",
  "90":"RS","91":"RS","92":"RS","93":"RS","94":"RS","95":"RS","96":"RS","97":"RS","98":"RS","99":"RS",
};

const REGIONS: Record<string, string> = {
  SP:"sudeste", RJ:"sudeste", MG:"sudeste", ES:"sudeste",
  PR:"sul",     SC:"sul",     RS:"sul",
  DF:"centro",  GO:"centro",  MT:"centro", MS:"centro", TO:"centro",
  BA:"nordeste",SE:"nordeste",PE:"nordeste",AL:"nordeste",PB:"nordeste",
  RN:"nordeste",CE:"nordeste",PI:"nordeste",MA:"nordeste",
  PA:"norte",   AM:"norte",   AP:"norte",  RR:"norte",
  AC:"norte",   RO:"norte",
};

// Tabela de preços: [PAC, SEDEX] em R$ — por combinação de regiões
const RATE_TABLE: Record<string, [number, number]> = {
  "sudeste-sudeste": [14.90, 24.90],
  "sudeste-sul":     [18.90, 31.90],
  "sudeste-centro":  [22.90, 37.90],
  "sudeste-nordeste":[27.90, 45.90],
  "sudeste-norte":   [34.90, 57.90],
  "sul-sul":         [14.90, 24.90],
  "sul-sudeste":     [18.90, 31.90],
  "sul-centro":      [22.90, 37.90],
  "sul-nordeste":    [29.90, 48.90],
  "sul-norte":       [36.90, 59.90],
  "centro-centro":   [14.90, 24.90],
  "centro-sudeste":  [22.90, 37.90],
  "centro-sul":      [22.90, 37.90],
  "centro-nordeste": [25.90, 42.90],
  "centro-norte":    [28.90, 47.90],
  "nordeste-nordeste":[14.90, 24.90],
  "nordeste-sudeste":[27.90, 45.90],
  "nordeste-sul":    [29.90, 48.90],
  "nordeste-centro": [25.90, 42.90],
  "nordeste-norte":  [31.90, 51.90],
  "norte-norte":     [14.90, 24.90],
  "norte-sudeste":   [34.90, 57.90],
  "norte-sul":       [36.90, 59.90],
  "norte-centro":    [28.90, 47.90],
  "norte-nordeste":  [31.90, 51.90],
};

// Prazo em dias úteis: [PAC, SEDEX]
const DAYS_TABLE: Record<string, [number, number]> = {
  "sudeste-sudeste": [4, 1],
  "sudeste-sul":     [5, 2],
  "sudeste-centro":  [6, 2],
  "sudeste-nordeste":[8, 3],
  "sudeste-norte":   [10,4],
  "sul-sul":         [4, 1],
  "sul-sudeste":     [5, 2],
  "sul-centro":      [7, 3],
  "sul-nordeste":    [9, 4],
  "sul-norte":       [12,5],
  "centro-centro":   [4, 1],
  "centro-sudeste":  [6, 2],
  "centro-sul":      [7, 3],
  "centro-nordeste": [8, 3],
  "centro-norte":    [9, 4],
  "nordeste-nordeste":[4,1],
  "nordeste-sudeste":[8, 3],
  "nordeste-sul":    [9, 4],
  "nordeste-centro": [8, 3],
  "nordeste-norte":  [10,4],
  "norte-norte":     [4, 1],
  "norte-sudeste":   [10,4],
  "norte-sul":       [12,5],
  "norte-centro":    [9, 4],
  "norte-nordeste":  [10,4],
};

export interface ShippingOption {
  id: "PAC" | "SEDEX";
  label: string;
  description: string;
  price: number;
  days: number;
}

export function ufFromCep(cep: string): string | null {
  const digits = cep.replace(/\D/g, "");
  return CEP_TO_UF[digits.slice(0, 2)] ?? null;
}

export function calcShipping(
  originUf: string,
  destinationCep: string,
): ShippingOption[] {
  const destUf = ufFromCep(destinationCep);
  if (!destUf) return [];

  const originRegion = REGIONS[originUf] ?? "sudeste";
  const destRegion   = REGIONS[destUf]   ?? "sudeste";

  const key = `${originRegion}-${destRegion}`;
  const revKey = `${destRegion}-${originRegion}`;

  const [pacPrice, sedexPrice] = RATE_TABLE[key] ?? RATE_TABLE[revKey] ?? [29.90, 49.90];
  const [pacDays,  sedexDays]  = DAYS_TABLE[key] ?? DAYS_TABLE[revKey] ?? [8, 3];

  return [
    {
      id:   "PAC",
      label: "PAC — Econômico",
      description: `Entrega em até ${pacDays} dias úteis`,
      price: pacPrice,
      days:  pacDays,
    },
    {
      id:   "SEDEX",
      label: "SEDEX — Expresso",
      description: `Entrega em até ${sedexDays} dia${sedexDays > 1 ? "s" : ""} útil`,
      price: sedexPrice,
      days:  sedexDays,
    },
  ];
}
