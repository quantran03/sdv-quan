import * as d3 from "d3";

export async function loadData<Type>(csvPath: string): Promise<Type[]> {
  return await d3.csv(csvPath) as unknown as Type[];
}

export function aggregateByTeamAndYear(data: AthleteEvent[]) {
  const seen = new Set<string>();

  const dedupedMedals = data.filter(record => {
    if (!record.Medal) return false;

    const key = `${record.Year}|${record.Event}|${record.NOC}|${record.Medal}`;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  })

  const agg = d3.rollup(
    dedupedMedals,
    (D) => {
      const bronze = D.filter((record) => record.Medal === 'Bronze').length;
      const silver = D.filter((record) => record.Medal === 'Silver').length;
      const gold = D.filter((record) => record.Medal === 'Gold').length;
      return [bronze, silver, gold];
    },
    (d) => d.Year,
    (d) => d.NOC,
  )
  return agg;
}

export function createFinalDF(data: d3.InternMap<string, d3.InternMap<string, number[]>>) {
  let finalDF: MedalAgg[] = [];
  for (const [year, teamMap] of data) {
    for (const [team, [bronze, silver, gold]] of teamMap) {
      finalDF.push({
        Year: +year,
        Team: team === "URS" || team === "ROC" ? "RUS" : team, // haha Russia
        Bronze_count: bronze,
        Silver_count: silver,
        Gold_count: gold,
        Medal_sum: bronze + silver*2 + gold*3
      })
    }
  }

  finalDF.sort(function(x, y){
    return d3.ascending(x.Year, y.Year);
  })

  return finalDF;
}

export function getTeams(data: MedalAgg[]) {
  const ROC = new Set<string>();
  data.forEach(d => ROC.add(d.Team));
  return ROC;
}

export function filterByYearRange(data: MedalAgg[], start: number, end: number) {
  const newData = data.filter(d => 
    (start <= d.Year && d.Year <= end)
  )
  return newData;
}

export function filterToOnlyTopTeams(data: MedalAgg[], threshold: number) {
  const teamMaxMedal = new Map<string, number>();
  data.forEach((d) => {
    teamMaxMedal.set(d.Team, Math.max((d.Team in teamMaxMedal ? teamMaxMedal.get(d.Team) : 0) as number, d.Medal_sum))
  });

  const newData = data.filter(d => {
    if (teamMaxMedal.get(d.Team)! >= threshold) {
      return true;
    }
    return false;
  });

  console.log(teamMaxMedal);
  return newData;
}

export function getCumSum(data: MedalAgg[]): MedalAgg[] {
  const teamCum = new Map<string, number>();
  const cumSumData = data.map(d => {
    if (!teamCum.get(d.Team)) {
      teamCum.set(d.Team, 0);
    }
    teamCum.set(d.Team, teamCum.get(d.Team)! + d.Medal_sum);;
    return {
      ...d,
      Medal_sum: teamCum.get(d.Team)!
    }
  })
  return cumSumData;
}

export async function process(file: string) {
  const raw: AthleteEvent[] = await loadData<AthleteEvent>(file);
  const agg = aggregateByTeamAndYear(raw);
  const final = createFinalDF(agg);
  return final;
}