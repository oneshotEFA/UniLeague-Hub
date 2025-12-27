import { TeamInput } from "../_AI/utility/type";

type LeagueFixtureInput = BaseFixtureInput & {
  tournamentType: "League";
  rounds: number;
  matchesPerWeek: number;
  startingDate: string;
};
type BaseFixtureInput = {
  teams: TeamInput[];
};
type KnockoutFixtureInput = BaseFixtureInput & {
  tournamentType: "knockout";
  startingDate: Date;
};
export type GenerateFixtureInput = LeagueFixtureInput | KnockoutFixtureInput;
