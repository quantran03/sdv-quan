type AthleteEvent = {
  City: string;
  Event: string;
  Medal: string;
  NOC: string;
  Name: string;
  Season: string;
  Sex: string;
  Sport: string;
  Team: string;
  Year: string;
  player_id: string;
};

type MedalAgg = {
  Year: number;
  Team: string;
  Bronze_count: number;
  Silver_count: number;
  Gold_count: number;
  Medal_sum: number;
}