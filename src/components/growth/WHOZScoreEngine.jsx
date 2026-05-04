// WHO Z-Score reference tables (LMS method)
// Source: WHO Child Growth Standards (0-5 years) + WHO Reference 2007 (5-19 years)
// L = Box-Cox power, M = Median, S = Coefficient of variation

// Weight-for-Age Boys 0-60 months (monthly, key values)
const WAZ_BOYS = [
  // [months, L, M, S]
  [0,0.3487,3.3464,0.14602],[1,0.2297,4.4709,0.13395],[2,0.1970,5.5675,0.12985],
  [3,0.2536,6.3762,0.12703],[4,0.3114,7.0023,0.12663],[5,0.3521,7.5105,0.12719],
  [6,0.3624,7.9340,0.12785],[9,0.3671,9.1835,0.13196],[12,0.3316,10.1669,0.13479],
  [18,0.2735,11.4801,0.13602],[24,0.2169,12.5545,0.13422],[36,0.1723,14.3441,0.13166],
  [48,0.1166,16.3065,0.13332],[60,0.0748,18.3043,0.13685]
];
const WAZ_GIRLS = [
  [0,0.3809,3.2322,0.14171],[1,0.1714,4.1873,0.13724],[2,0.2979,5.1282,0.13801],
  [3,0.2376,5.8458,0.13516],[4,0.2360,6.4232,0.13163],[5,0.3112,6.8990,0.13009],
  [6,0.3416,7.2972,0.13092],[9,0.3823,8.4809,0.13505],[12,0.3525,9.5250,0.13701],
  [18,0.2929,10.8089,0.13441],[24,0.2374,11.8917,0.13115],[36,0.1967,13.9313,0.13076],
  [48,0.1394,15.9637,0.13396],[60,0.0808,18.2427,0.13957]
];

// Height-for-Age Boys 0-60 months
const HAZ_BOYS = [
  [0,1,49.8842,0.03795],[1,1,54.7244,0.03557],[2,1,58.4249,0.03424],
  [3,1,61.4292,0.03328],[6,1,67.6236,0.03166],[9,1,72.7681,0.03124],
  [12,1,76.9922,0.03145],[18,1,84.1872,0.03178],[24,1,87.8161,0.03311],
  [36,1,96.1004,0.03514],[48,1,103.3125,0.03740],[60,1,110.0349,0.03962]
];
const HAZ_GIRLS = [
  [0,1,49.1477,0.03790],[1,1,53.6872,0.03596],[2,1,57.0673,0.03891],
  [3,1,59.8029,0.03780],[6,1,65.7301,0.03580],[9,1,70.9957,0.03545],
  [12,1,75.7562,0.03560],[18,1,83.2205,0.03535],[24,1,86.4153,0.03598],
  [36,1,95.1308,0.03801],[48,1,102.7297,0.04041],[60,1,109.4102,0.04245]
];

// BMI-for-Age Boys 2-60 months
const BAZ_BOYS = [
  [24,-1.9940,16.3654,0.09263],[30,-1.9940,15.8480,0.09393],[36,-2.0996,15.4524,0.09352],
  [42,-2.1641,15.2089,0.09316],[48,-2.2029,15.0301,0.09312],[54,-2.2274,14.9139,0.09327],[60,-2.2343,14.8342,0.09335]
];
const BAZ_GIRLS = [
  [24,-1.3396,15.8834,0.09310],[30,-1.4739,15.3748,0.09319],[36,-1.5997,15.0256,0.09277],
  [42,-1.7180,14.7748,0.09254],[48,-1.8271,14.5870,0.09262],[54,-1.9275,14.4682,0.09282],[60,-2.0205,14.3982,0.09306]
];

// Weight-for-Height Boys (45-120 cm)
const WHZ_BOYS_BY_HEIGHT = [
  [45,0.1714,2.441,0.09182],[50,0.2680,3.275,0.09008],[55,0.3384,4.415,0.08849],
  [60,0.3877,5.765,0.08799],[65,0.3993,7.239,0.08866],[70,0.3772,8.680,0.08906],
  [75,0.3264,10.018,0.08954],[80,0.2535,11.269,0.09009],[85,0.1697,12.456,0.09017],
  [90,0.0869,13.603,0.09022],[95,0.0095,14.718,0.09064],[100,-0.0576,15.814,0.09148],
  [105,-0.1155,16.928,0.09291],[110,-0.1636,18.059,0.09477],[115,-0.2026,19.178,0.09657],[120,-0.2316,20.235,0.09794]
];

function interpolate(table, x, col = 0) {
  if (!table.length) return null;
  if (x <= table[0][col]) return table[0];
  if (x >= table[table.length - 1][col]) return table[table.length - 1];
  for (let i = 0; i < table.length - 1; i++) {
    if (x >= table[i][col] && x <= table[i + 1][col]) {
      const t = (x - table[i][col]) / (table[i + 1][col] - table[i][col]);
      return [
        table[i][col],
        table[i][1] + t * (table[i + 1][1] - table[i][1]),
        table[i][2] + t * (table[i + 1][2] - table[i][2]),
        (table[i][3] || 0) + t * ((table[i + 1][3] || 0) - (table[i][3] || 0))
      ];
    }
  }
  return table[table.length - 1];
}

function calcZScore(val, L, M, S) {
  if (!val || !M || !S) return null;
  if (L === 0) return Math.log(val / M) / S;
  return (Math.pow(val / M, L) - 1) / (L * S);
}

// Clamp Z to ±4 (WHO standard)
function clampZ(z) {
  if (z === null) return null;
  return Math.max(-4, Math.min(4, z));
}

// Normal distribution CDF approximation
function normCDF(z) {
  if (z === null) return null;
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

export function zToCentile(z) {
  if (z === null) return null;
  return Math.round(normCDF(z) * 100 * 10) / 10;
}

export function calcWAZ(ageMonths, weightKg, sex) {
  const table = sex === 'male' ? WAZ_BOYS : WAZ_GIRLS;
  const row = interpolate(table, ageMonths);
  if (!row) return null;
  return clampZ(calcZScore(weightKg, row[1], row[2], row[3]));
}

export function calcHAZ(ageMonths, heightCm, sex) {
  const table = sex === 'male' ? HAZ_BOYS : HAZ_GIRLS;
  const row = interpolate(table, ageMonths);
  if (!row) return null;
  return clampZ(calcZScore(heightCm, row[1], row[2], row[3]));
}

export function calcBAZ(ageMonths, bmi, sex) {
  if (ageMonths < 24) return null;
  const table = sex === 'male' ? BAZ_BOYS : BAZ_GIRLS;
  const row = interpolate(table, ageMonths);
  if (!row) return null;
  return clampZ(calcZScore(bmi, row[1], row[2], row[3]));
}

export function calcWHZ(heightCm, weightKg) {
  if (heightCm < 45 || heightCm > 120) return null;
  const row = interpolate(WHZ_BOYS_BY_HEIGHT, heightCm);
  if (!row) return null;
  return clampZ(calcZScore(weightKg, row[1], row[2], row[3]));
}

export function interpretZ(z, type) {
  if (z === null) return { label: 'N/A', color: 'gray', severity: 'unknown' };
  if (type === 'WAZ') {
    if (z < -3) return { label: 'Severe Underweight', color: 'red', severity: 'severe' };
    if (z < -2) return { label: 'Underweight', color: 'amber', severity: 'moderate' };
    if (z > 2) return { label: 'Overweight', color: 'orange', severity: 'mild' };
    return { label: 'Normal', color: 'green', severity: 'normal' };
  }
  if (type === 'HAZ') {
    if (z < -3) return { label: 'Severe Stunting', color: 'red', severity: 'severe' };
    if (z < -2) return { label: 'Stunting', color: 'amber', severity: 'moderate' };
    if (z > 2) return { label: 'Tall for Age', color: 'blue', severity: 'normal' };
    return { label: 'Normal', color: 'green', severity: 'normal' };
  }
  if (type === 'WHZ') {
    if (z < -3) return { label: 'Severe Wasting', color: 'red', severity: 'severe' };
    if (z < -2) return { label: 'Wasting', color: 'amber', severity: 'moderate' };
    if (z > 2) return { label: 'Risk of Overweight', color: 'orange', severity: 'mild' };
    if (z > 3) return { label: 'Overweight/Obese', color: 'orange', severity: 'mild' };
    return { label: 'Normal', color: 'green', severity: 'normal' };
  }
  if (type === 'BAZ') {
    if (z < -3) return { label: 'Severely Thin', color: 'red', severity: 'severe' };
    if (z < -2) return { label: 'Thin', color: 'amber', severity: 'moderate' };
    if (z > 2) return { label: 'Overweight', color: 'orange', severity: 'mild' };
    if (z > 3) return { label: 'Obese', color: 'red', severity: 'moderate' };
    return { label: 'Normal', color: 'green', severity: 'normal' };
  }
  return { label: 'N/A', color: 'gray', severity: 'unknown' };
}

// WHO centile reference points for chart lines
export function getWHOCentileLines(sex, type, ageRange = [0, 60]) {
  // Returns {centile: [age, value]} arrays for 3rd, 15th, 50th, 85th, 97th
  const zValues = { p3: -1.88, p15: -1.04, p50: 0, p85: 1.04, p97: 1.88 };
  const centiles = {};
  Object.entries(zValues).forEach(([key, zVal]) => {
    centiles[key] = [];
    for (let age = ageRange[0]; age <= ageRange[1]; age += 3) {
      let table = type === 'WAZ' ? (sex === 'male' ? WAZ_BOYS : WAZ_GIRLS) :
                  type === 'HAZ' ? (sex === 'male' ? HAZ_BOYS : HAZ_GIRLS) : null;
      if (!table) return;
      const row = interpolate(table, age);
      if (row) {
        const [L, M, S] = [row[1], row[2], row[3]];
        let val;
        if (L === 0) val = M * Math.exp(S * zVal);
        else val = M * Math.pow(1 + L * S * zVal, 1 / L);
        centiles[key].push({ age, value: Math.round(val * 100) / 100 });
      }
    }
  });
  return centiles;
}