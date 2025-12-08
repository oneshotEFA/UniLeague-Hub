import { Group } from "./type";

export function buildLeagueShufflePrompt(fixture: any) {
  return `
You are given a football fixture. Your task is to reshuffle the TEAM PAIRINGS inside each matchWeek.

### Your goals:
1. For every matchWeek:
   - Take all teams appearing in the matches of that week.
   - Randomly re-pair them into new valid matches.
   - Example:
       Input:  A vs B, C vs D, E vs F
       Output: A vs F, B vs D, C vs E (or any valid reshuffle)

2. You MUST keep:
   - The same matchWeek number
   - The same number of matches
   - The same date assigned to each match
   - No team should appear more than once in the same week
   - No new teams added
   - No repeats or duplicates inside the week

3. Randomly flip some home/away assignments.

### Important Rules:
- Do NOT add or remove matches.
- Do NOT change the number of weeks.
- Do NOT change or invent team names.
- Do NOT regenerate the fixture logic. Only reshuffle pairings.

### Output Format:
Return ONLY valid JSON in the exact same structure as the input.

### Input Fixture:
${JSON.stringify(fixture)}
  `;
}
export function buildGroupShufflePrompt(groups: Group[]) {
  return `
You are given group-stage football fixtures. 
DO NOT change group names or team identity.

Your job:
 For every matchWeek:
   - Take all teams appearing in the matches of that week.
   - Randomly re-pair them into new valid matches.
   - Example:
       Input:  A vs B, C vs D, E vs F
       Output: A vs F, B vs D, C vs E (or any valid reshuffle)
### Important Rules:
1. Shuffle order of matches inside each group.
2. Randomly flip some home/away pairs.
3. Do NOT add, remove, or modify matches.
4. Output MUST be valid JSON.
5, Do NOT change or invent team names.

Here is the input:
${JSON.stringify(groups)}
  `;
}
export function buildKnockoutPrompt(bracket: any) {
  return `
You are given a knockout tournament bracket.
Do NOT change the bracket structure.

Your job:
1. Shuffle the match order *inside each round*.
2. Randomly flip homeTeamId and awayTeamId for some matches.
3. Never modify:
   - match.id
   - round
   - nextMatchId (winner path)
   - number of matches
   - team names
4. Never create new matches.
5. Never remove or replace teams.
6. If a team is "BYE", keep it untouched.

Output ONLY valid JSON following the exact original structure.

Here is the bracket:
${JSON.stringify(bracket)}
  `;
}

export function buildPoster(input: any) {
  return `
Create a professional football match poster.

Inputs:
- Home Team: Addis Ababa City
- Away Team: Hawassa United
- Two player images included in the request

Requirements:
- Blend both images in a symmetric composition
- Put “Addis Ababa City vs Hawassa United” in bold modern typography
- Add small match detail section at the bottom
- Use dark blue and red theme
- Maintain realistic lighting and clean sports poster style
- Return only the final poster image

    `;
}
