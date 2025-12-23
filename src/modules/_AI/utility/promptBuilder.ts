import {
  Group,
  PosterInput,
  PredictInput,
  TransferAnnouncementInput,
} from "./type";

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

export function buildPosterPrompt(input: PosterInput) {
  return `
Create a professional football match poster.

Home Team: ${input.homeTeam}
Away Team: ${input.awayTeam}

Instructions:
- Use the two provided team images
- Blend them symmetrically
- Use modern football poster style
- Add headline: "${input.homeTeam} vs ${input.awayTeam}"
- Add a small match detail section at the bottom
- Make color grading cinematic
- Return ONLY the poster as a base64 PNG. No text, no explanation.
`.trim();
}
export function buildTeamPowerPrompt(input: any) {
  return `You are a football analyst AI.

Using this raw team data from the last 5 matches:

${JSON.stringify(input, null, 2)}

Return ONLY a single number between 0 and 100 representing the team's power.
Do not write text, do not write explanation, only return the number.`;
}

export function buildPredictionPrompt(input: PredictInput) {
  return `
You are a football match prediction expert. 
Analyze the teams based on their performance power rating:

- Home Team: ${input.homeTeam}
- Home Team Power: ${input.homePower}

- Away Team: ${input.awayTeam}
- Away Team Power: ${input.awayPower}

Use the power ratings to estimate the probability of:
1. Home Win
2. Draw
3. Away Win

Guidelines:
- Higher power means stronger performance.
- Home advantage should increase home win probability slightly (5–10%).
- Ensure the percentages always total exactly 100%.
- Provide a short reasoning based only on the given power values.
- Keep the output objective and analytical.

Return the response in strictly this JSON structure:

{
  "homeWin": number,    // percentage
  "draw": number,       // percentage
  "awayWin": number,    // percentage
  "analysis": "short explanation"
}
  `;
}
export function buildTransferAnnouncementPrompt(
  input: TransferAnnouncementInput
) {
  return `
Write a short football transfer announcement.
Style: exciting, professional, social-media ready.

Player: ${input.playerName}
Position: ${input.position}
From: ${input.fromTeam}
To: ${input.toTeam}

Example tone:
"Here we go! ..."


Return the response in strictly this JSON structure:
{
  "announcement": "string"
}
`;
}
export function buildAnnouncementPrompt(input: any) {
  return `
You are writing an official announcement for a football tournament on a sports management platform.

Tone & Style:
- Professional
- Exciting
- Clear and engaging
- Suitable for in-app announcements and social media

Tournament Details:
- Tournament Name: ${input.name}
- Start Date: ${input.startDate}
${input.location ? `- Location: ${input.location}` : ""}
${input.organizer ? `- Organizer: ${input.organizer}` : ""}
${input.extraInfo ? `- Additional Info: ${input.extraInfo}` : ""}

Instructions:
- Write a short announcement (2–4 sentences)
- Do NOT use emojis
- Do NOT include hashtags
- Do NOT add extra explanations
- Focus on excitement and clarity

Return the response in strictly the following JSON format:
{
  "announcement": "string"
}
`;
}
export function buildErrorAnalysisPrompt(input: any) {
  return `
You are an advanced AI system specialized in analyzing software error logs and error messages.

Your task is to analyze the provided error information and return a clear, structured error analysis.

Input data:
${input}

Analysis Guidelines:
- Identify the **type of error** that occurred.
- Identify the **category of the error**, such as:
  - Database (validation errors, foreign key issues, transaction failures)
  - Network (timeouts, connectivity issues, unstable internet)
  - API (service not responding, invalid responses)
  - Data validation errors
  - Any other relevant category
- Write a **clear and concise explanation of the error** in non-technical language for a **content manager** (not a developer).
- If and only if the error severity is **critical or high**, include:
  - A developer-focused explanation of what caused the error
  - The **recommended solution or mitigation steps**
- Determine the **severity level** of the error:
  - critical
  - high
  - medium
  - low
  - warning

Instructions:
- Do NOT include hashtags
- Do NOT include any text outside the JSON response
- Ensure explanations are accurate and easy to understand

Return the response strictly in the following JSON format:
{
  "type": "string",
  "category": "string",
  "message": "string", 
  "messageDeveloper": "string",
  "severity": "string"
}
`;
}
