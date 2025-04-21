import * as d3 from "d3";

export async function loadData<Type>(csvPath: string): Promise<Type[]> {
  return await d3.csv(csvPath) as unknown as Type[];
}

export async function aggregateByTeamAndYear(data: d3.DSVRowArray<string>) {
  return;
}
