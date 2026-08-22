const fs = require('fs');
const path = require('path');

// 176 Verified Active 2026 Offensive Skill Players (Eliminated Retired / Washed / Duplicate Players)
// Included Missing Superstars: Chris Olave, DeVonta Smith, Brandon Aiyuk, Rashee Rice, Jayden Reed, 
// Mark Andrews, T.J. Hockenson, Dalton Kincaid, J.K. Dobbins, Zach Charbonnet, Khalil Shakir, 
// Jameson Williams, Jordan Mason, Rashid Shaheed, Jauan Jennings, Christian Watson, Romeo Doubs, Jerry Jeudy, Ben Sinnott, Brock Purdy
const skillPlayers = [
  // 1-10 (Tier 1 Superstars)
  { name: "Bijan Robinson", pos: "RB", team: "ATL", age: 24, depth: "RB1", tier: 1, tag: "Consensus RB1", rank: 1, yahoo: 1.8, sleeper: 1.5, ecr: 1.0, rz: 52, desc: "Focal point of explosive Zac Robinson offense. 330+ touch ceiling with 75+ receptions and goal-line domination." },
  { name: "Ja'Marr Chase", pos: "WR", team: "CIN", age: 26, depth: "WR1", tier: 1, tag: "Triple Crown Threat", rank: 2, yahoo: 2.5, sleeper: 2.2, ecr: 2.0, rz: 26, desc: "Unmatched target concentration and red-zone priority with Joe Burrow in peak prime." },
  { name: "CeeDee Lamb", pos: "WR", team: "DAL", age: 27, depth: "WR1", tier: 1, tag: "Volume Alpha", rank: 3, yahoo: 3.2, sleeper: 3.0, ecr: 3.0, rz: 24, desc: "Guaranteed 165+ targets. Slot and boundary versatility creates weekly 30-point ceiling." },
  { name: "Justin Jefferson", pos: "WR", team: "MIN", age: 27, depth: "WR1", tier: 1, tag: "Elite Technician", rank: 4, yahoo: 4.1, sleeper: 4.5, ecr: 4.0, rz: 22, desc: "Quarterback-proof route technician with 30%+ target share and immense air-yard floor." },
  { name: "Ashton Jeanty", pos: "RB", team: "DAL", age: 22, depth: "RB1", tier: 1, tag: "Rookie Bellcow", rank: 5, yahoo: 16.0, sleeper: 9.5, ecr: 7.0, rz: 44, desc: "Immediate 3-down bellcow behind top offensive line. Elite tackle-breaking and receiving chops." },
  { name: "Jahmyr Gibbs", pos: "RB", team: "DET", age: 24, depth: "RB1", tier: 1, tag: "Explosive Playmaker", rank: 6, yahoo: 6.8, sleeper: 5.8, ecr: 6.0, rz: 38, desc: "Unbelievable efficiency on ground and through air behind league's premier run-blocking unit." },
  { name: "Breece Hall", pos: "RB", team: "NYJ", age: 25, depth: "RB1", tier: 1, tag: "Dual-Threat Weapon", rank: 7, yahoo: 7.5, sleeper: 7.0, ecr: 7.0, rz: 40, desc: "Workhorse backfield share with elite route participation and home-run open field speed." },
  { name: "Saquon Barkley", pos: "RB", team: "PHI", age: 29, depth: "RB1", tier: 1, tag: "Touchdown Monster", rank: 8, yahoo: 8.5, sleeper: 8.0, ecr: 8.0, rz: 46, desc: "High-floor anchor in dynamic Eagles rushing attack with weekly multi-touchdown upside." },
  { name: "Marvin Harrison Jr.", pos: "WR", team: "ARI", age: 24, depth: "WR1", tier: 1, tag: "Year 3 Alpha", rank: 9, yahoo: 12.5, sleeper: 8.8, ecr: 9.0, rz: 22, desc: "Ascending superstar WR with 40%+ air-yard dominance and locked-in red-zone targets." },
  { name: "Amon-Ra St. Brown", pos: "WR", team: "DET", age: 26, depth: "WR1", tier: 1, tag: "PPR Engine", rank: 10, yahoo: 10.0, sleeper: 11.0, ecr: 10.0, rz: 20, desc: "Most consistent first-down earner in football. 8+ receptions weekly baseline." },

  // 11-20
  { name: "Nico Collins", pos: "WR", team: "HOU", age: 27, depth: "WR1", tier: 1, tag: "YAC Dominator", rank: 11, yahoo: 14.0, sleeper: 13.0, ecr: 12.0, rz: 21, desc: "Top-tier yards per route run metric. Lethal deep target and red-zone mismatch with C.J. Stroud." },
  { name: "Malik Nabers", pos: "WR", team: "NYG", age: 23, depth: "WR1", tier: 1, tag: "Target Vacuum", rank: 12, yahoo: 24.0, sleeper: 15.5, ecr: 13.0, rz: 18, desc: "Absurd 32% target share. Improved QB play unlocks massive touchdown efficiency." },
  { name: "Rome Odunze", pos: "WR", team: "CHI", age: 24, depth: "WR1", tier: 1, tag: "Year 3 Breakout", rank: 13, yahoo: 34.0, sleeper: 21.0, ecr: 14.0, rz: 19, desc: "Vacated volume clear WR1 in high-flying Ben Johnson attack. Massive market gap target." },
  { name: "Christian McCaffrey", pos: "RB", team: "SF", age: 30, depth: "RB1", tier: 1, tag: "Elite Per-Game Legend", rank: 14, yahoo: 11.0, sleeper: 14.0, ecr: 13.0, rz: 35, desc: "When active, unmatched fantasy PPG engine. Managed snaps offset by hyper-efficient high-leverage touches." },
  { name: "Puka Nacua", pos: "WR", team: "LAR", age: 25, depth: "WR1", tier: 1, tag: "Route Craftsman", rank: 15, yahoo: 15.0, sleeper: 16.0, ecr: 15.0, rz: 18, desc: "Dominant middle-of-field target earner and chain-mover in Sean McVay scheme." },
  { name: "Brock Bowers", pos: "TE", team: "LV", age: 23, depth: "TE1", tier: 1, tag: "Positional Cheat Code", rank: 16, yahoo: 25.0, sleeper: 19.0, ecr: 16.0, rz: 19, desc: "Generational tight end used as de facto WR1. Massive VORP advantage over entire position." },
  { name: "Josh Allen", pos: "QB", team: "BUF", age: 30, depth: "QB1", tier: 1, tag: "QB1 Overall", rank: 17, yahoo: 22.0, sleeper: 20.0, ecr: 18.0, rz: 55, desc: "Rushing touchdown machine with 15+ rushing TD capability alongside 4,000+ pass yards." },
  { name: "Lamar Jackson", pos: "QB", team: "BAL", age: 29, depth: "QB1", tier: 1, tag: "Dual-Threat MVP", rank: 18, yahoo: 23.0, sleeper: 22.0, ecr: 19.0, rz: 48, desc: "Elite rushing yard floor and hyper-efficient passing metrics in Todd Monken system." },
  { name: "Jayden Daniels", pos: "QB", team: "WAS", age: 25, depth: "QB1", tier: 1, tag: "Konami Sensation", rank: 19, yahoo: 28.0, sleeper: 24.0, ecr: 20.0, rz: 42, desc: "Electrifying dual-threat with pinpoint deep ball accuracy and dynamic read-option equity." },
  { name: "Kyren Williams", pos: "RB", team: "LAR", age: 26, depth: "RB1", tier: 1, tag: "Red Zone Fiend", rank: 20, yahoo: 19.0, sleeper: 21.0, ecr: 20.0, rz: 45, desc: "Monopolizes goal-line carries in elite rushing scheme with high weekly touchdown probability." },

  // 21-30
  { name: "Jonathan Taylor", pos: "RB", team: "IND", age: 27, depth: "RB1", tier: 1, tag: "Pure Runner", rank: 21, yahoo: 20.0, sleeper: 23.0, ecr: 21.0, rz: 38, desc: "Dominant ground force benefiting from light boxes created by Anthony Richardson option threat." },
  { name: "A.J. Brown", pos: "WR", team: "PHI", age: 29, depth: "WR1", tier: 1, tag: "Physical Monster", rank: 22, yahoo: 21.0, sleeper: 25.0, ecr: 22.0, rz: 19, desc: "Elite target efficiency and game-breaking YAC ability on intermediate crossers and go-routes." },
  { name: "Garrett Wilson", pos: "WR", team: "NYJ", age: 26, depth: "WR1", tier: 1, tag: "Target Magnet", rank: 23, yahoo: 26.0, sleeper: 26.0, ecr: 23.0, rz: 17, desc: "Elite separation skills and 28% target share baseline ready for peak scoring explosion." },
  { name: "Drake London", pos: "WR", team: "ATL", age: 25, depth: "WR1", tier: 1, tag: "Contested Catch King", rank: 24, yahoo: 27.0, sleeper: 27.0, ecr: 24.0, rz: 21, desc: "Alpha target volume in rhythm passing attack with outstanding red-zone conversion rate." },
  { name: "De'Von Achane", pos: "RB", team: "MIA", age: 24, depth: "RB1", tier: 1, tag: "Home Run Hitter", rank: 25, yahoo: 29.0, sleeper: 28.0, ecr: 25.0, rz: 28, desc: "Historic per-touch efficiency and heavy receiving involvement in Mike McDaniel space scheme." },
  { name: "Kenneth Walker III", pos: "RB", team: "SEA", age: 25, depth: "RB1", tier: 2, tag: "Explosive Workhorse", rank: 26, yahoo: 32.0, sleeper: 30.0, ecr: 28.0, rz: 36, desc: "Dynamic playmaker with tackle-evading dominance in Ryan Grubb spread rushing offense." },
  { name: "Brian Thomas Jr.", pos: "WR", team: "JAX", age: 23, depth: "WR1", tier: 2, tag: "Deep Threat Alpha", rank: 27, yahoo: 36.0, sleeper: 29.0, ecr: 27.0, rz: 16, desc: "Rare size-speed combination with soaring air-yard metrics and primary red-zone role." },
  { name: "Chris Olave", pos: "WR", team: "NO", age: 26, depth: "WR1", tier: 2, tag: "Route Technician Alpha", rank: 28, yahoo: 30.0, sleeper: 31.0, ecr: 28.0, rz: 17, desc: "Alpha 30%+ target earner and premier air-yard dominator in Klint Kubiak play-action passing tree." },
  { name: "Trey McBride", pos: "TE", team: "ARI", age: 26, depth: "TE1", tier: 1, tag: "Target Vacuum TE", rank: 29, yahoo: 35.0, sleeper: 32.0, ecr: 29.0, rz: 18, desc: "25%+ target share tight end with massive reception volume and chain-moving reliability." },
  { name: "Josh Jacobs", pos: "RB", team: "GB", age: 28, depth: "RB1", tier: 2, tag: "Heavy Volume Anchor", rank: 30, yahoo: 30.0, sleeper: 34.0, ecr: 30.0, rz: 42, desc: "Clear goal-line and short-yardage hammer in Matt LaFleur top-tier scoring offense." },

  // 31-40
  { name: "Jalen Hurts", pos: "QB", team: "PHI", age: 28, depth: "QB1", tier: 1, tag: "Tush Push Legend", rank: 31, yahoo: 31.0, sleeper: 33.0, ecr: 31.0, rz: 50, desc: "Virtually guaranteed double-digit rushing touchdowns with elite surrounding receiving corps." },
  { name: "James Cook", pos: "RB", team: "BUF", age: 26, depth: "RB1", tier: 2, tag: "Dual-Threat Spark", rank: 32, yahoo: 38.0, sleeper: 35.0, ecr: 33.0, rz: 32, desc: "Explosive dual-threat back with expanded passing game role in Josh Allen led offense." },
  { name: "DeVonta Smith", pos: "WR", team: "PHI", age: 27, depth: "WR2", tier: 2, tag: "Smooth Separator", rank: 33, yahoo: 37.0, sleeper: 36.0, ecr: 34.0, rz: 16, desc: "Elite route technician who operates as a co-alpha with A.J. Brown in explosive Eagles passing tree." },
  { name: "Brandon Aiyuk", pos: "WR", team: "SF", age: 28, depth: "WR1", tier: 2, tag: "Separation Master", rank: 34, yahoo: 41.0, sleeper: 38.0, ecr: 35.0, rz: 16, desc: "Hyper-efficient intermediate target commanding high yards per route run in Shanahan scheme." },
  { name: "Sam LaPorta", pos: "TE", team: "DET", age: 25, depth: "TE1", tier: 1, tag: "Red Zone Target", rank: 35, yahoo: 39.0, sleeper: 37.0, ecr: 34.0, rz: 20, desc: "High-scoring offense centerpiece with outstanding red-zone touchdown conversion rate." },
  { name: "Rashee Rice", pos: "WR", team: "KC", age: 26, depth: "WR1", tier: 2, tag: "YAC Machine Target Hog", rank: 36, yahoo: 44.0, sleeper: 39.0, ecr: 36.0, rz: 18, desc: "Mahomes' favorite intermediate target with historic target share per route run on slants and crossers." },
  { name: "Jayden Reed", pos: "WR", team: "GB", age: 26, depth: "WR1", tier: 2, tag: "Versatile Electric Weapon", rank: 37, yahoo: 47.0, sleeper: 40.0, ecr: 37.0, rz: 16, desc: "Deebo-style gadget and slot dynamo with designed rushes, end-arounds, and red-zone end-zone equity." },
  { name: "Tee Higgins", pos: "WR", team: "CIN", age: 27, depth: "WR2", tier: 2, tag: "Elite 1B Receiver", rank: 38, yahoo: 40.0, sleeper: 41.0, ecr: 38.0, rz: 15, desc: "WR1 upside whenever Chase is bracketed. Elite boundary catch radius in potent passing attack." },
  { name: "Derrick Henry", pos: "RB", team: "BAL", age: 32, depth: "RB1", tier: 2, tag: "Goal Line Juggernaut", rank: 39, yahoo: 33.0, sleeper: 42.0, ecr: 39.0, rz: 46, desc: "Unstoppable red-zone force in Baltimore heavy-personnel scheme with 12+ touchdown baseline." },
  { name: "Ladd McConkey", pos: "WR", team: "LAC", age: 24, depth: "WR1", tier: 2, tag: "Separation Wizard", rank: 40, yahoo: 45.0, sleeper: 43.0, ecr: 40.0, rz: 14, desc: "Justin Herbert's favorite target. Elite separator against man and zone coverage from the slot." },

  // 41-50
  { name: "Chuba Hubbard", pos: "RB", team: "CAR", age: 27, depth: "RB1", tier: 2, tag: "Workhorse Volume", rank: 41, yahoo: 46.0, sleeper: 44.0, ecr: 41.0, rz: 34, desc: "Locked-in backfield touches and three-down work in ascending Dave Canales rushing scheme." },
  { name: "George Kittle", pos: "TE", team: "SF", age: 32, depth: "TE1", tier: 1, tag: "YAC Behemoth", rank: 42, yahoo: 48.0, sleeper: 46.0, ecr: 42.0, rz: 16, desc: "Devastating after the catch with spike-week multi-touchdown upside in Shanahan system." },
  { name: "Mark Andrews", pos: "TE", team: "BAL", age: 30, depth: "TE1", tier: 1, tag: "Lamar Red Zone Target", rank: 43, yahoo: 49.0, sleeper: 47.0, ecr: 43.0, rz: 18, desc: "Elite touchdown equity and seam-stretching target earner in top Ravens scoring machine." },
  { name: "T.J. Hockenson", pos: "TE", team: "MIN", age: 29, depth: "TE1", tier: 1, tag: "PPR Vacuum TE", rank: 44, yahoo: 51.0, sleeper: 48.0, ecr: 44.0, rz: 16, desc: "7+ targets per game baseline in Kevin O'Connell's tight-end friendly passing concepts." },
  { name: "Dalton Kincaid", pos: "TE", team: "BUF", age: 26, depth: "TE1", tier: 2, tag: "Slot Tight End Weapon", rank: 45, yahoo: 53.0, sleeper: 50.0, ecr: 45.0, rz: 15, desc: "Josh Allen's primary middle-of-field chain mover with high reception ceiling." },
  { name: "Chase Brown", pos: "RB", team: "CIN", age: 26, depth: "RB1", tier: 2, tag: "Speed Bellcow", rank: 46, yahoo: 44.0, sleeper: 45.0, ecr: 46.0, rz: 30, desc: "Home-run speed in high-scoring offense with high-volume receiving involvement." },
  { name: "Patrick Mahomes", pos: "QB", team: "KC", age: 30, depth: "QB1", tier: 1, tag: "Passing Genius", rank: 47, yahoo: 41.0, sleeper: 49.0, ecr: 47.0, rz: 35, desc: "4,500+ yard ceiling with revamped deep weapons and elite red-zone touchdown efficiency." },
  { name: "Joe Burrow", pos: "QB", team: "CIN", age: 29, depth: "QB1", tier: 1, tag: "Pass Volume King", rank: 48, yahoo: 43.0, sleeper: 51.0, ecr: 48.0, rz: 30, desc: "High-volume precision passer with top-tier receiver duo yielding huge weekly totals." },
  { name: "C.J. Stroud", pos: "QB", team: "HOU", age: 24, depth: "QB1", tier: 1, tag: "Deep Ball Maestro", rank: 49, yahoo: 49.0, sleeper: 52.0, ecr: 49.0, rz: 28, desc: "Surgically accurate pocket passer with elite supporting cast and 35+ touchdown ceiling." },
  { name: "Kyler Murray", pos: "QB", team: "ARI", age: 29, depth: "QB1", tier: 1, tag: "Rushing Weapon", rank: 50, yahoo: 52.0, sleeper: 53.0, ecr: 50.0, rz: 38, desc: "Elite rushing baseline paired with Marvin Harrison Jr. & Trey McBride connection." },

  // 51-60
  { name: "Kyle Pitts", pos: "TE", team: "ATL", age: 25, depth: "TE1", tier: 2, tag: "Athletic Freak", rank: 51, yahoo: 68.0, sleeper: 56.0, ecr: 51.0, rz: 15, desc: "Operates as mismatch X-receiver in Zac Robinson scheme with high ceiling outcomes." },
  { name: "Tetairoa McMillan", pos: "WR", team: "NE", age: 22, depth: "WR1", tier: 2, tag: "Rookie X-Receiver", rank: 52, yahoo: 55.0, sleeper: 54.0, ecr: 52.0, rz: 16, desc: "Towering 6'5 alpha target with supreme ball skills stepping directly into primary receiver role." },
  { name: "Travis Hunter", pos: "WR", team: "DEN", age: 23, depth: "WR1", tier: 2, tag: "Two-Way Marvel", rank: 53, yahoo: 62.0, sleeper: 55.0, ecr: 53.0, rz: 14, desc: "Electric dynamic threat with supreme route nuance and immediate featured target share." },
  { name: "Luther Burden III", pos: "WR", team: "CAR", age: 22, depth: "WR1", tier: 2, tag: "YAC Rocket", rank: 54, yahoo: 72.0, sleeper: 57.0, ecr: 54.0, rz: 15, desc: "Dynamic Deebo Samuel archetype weapon stepping in as Bryce Young's top playmaker." },
  { name: "Davante Adams", pos: "WR", team: "NYJ", age: 33, depth: "WR2", tier: 2, tag: "Red Zone Maestro", rank: 55, yahoo: 42.0, sleeper: 58.0, ecr: 55.0, rz: 20, desc: "Hall-of-fame route technician commanding elite red-zone target volume." },
  { name: "Jaylen Waddle", pos: "WR", team: "MIA", age: 27, depth: "WR2", tier: 2, tag: "Speed Demolisher", rank: 56, yahoo: 50.0, sleeper: 59.0, ecr: 56.0, rz: 14, desc: "Lethal open-field speed in motion-heavy offense with 1,200+ yard ceiling." },
  { name: "Bucky Irving", pos: "RB", team: "TB", age: 24, depth: "RB1", tier: 2, tag: "Contact Balance Star", rank: 57, yahoo: 54.0, sleeper: 60.0, ecr: 57.0, rz: 32, desc: "Outstanding missed tackles forced per attempt and dominant second-half rushing role." },
  { name: "Zay Flowers", pos: "WR", team: "BAL", age: 25, depth: "WR1", tier: 2, tag: "Space Weapon", rank: 58, yahoo: 53.0, sleeper: 61.0, ecr: 58.0, rz: 15, desc: "Primary target earner in Baltimore with explosive manufactured touch upside." },
  { name: "TreVeyon Henderson", pos: "RB", team: "LAC", age: 23, depth: "RB1", tier: 2, tag: "Rookie Slasher", rank: 59, yahoo: 70.0, sleeper: 62.0, ecr: 59.0, rz: 34, desc: "Greg Roman bellcow fit with elite speed to turn any interior carry into an 80-yard score." },
  { name: "Xavier Worthy", pos: "WR", team: "KC", age: 23, depth: "WR1", tier: 2, tag: "4.21 Speed Demon", rank: 60, yahoo: 56.0, sleeper: 63.0, ecr: 60.0, rz: 16, desc: "Expanded Year 3 route tree paired with Mahomes' deep arm creates huge weekly ceiling." },

  // 61-70
  { name: "Anthony Richardson", pos: "QB", team: "IND", age: 24, depth: "QB1", tier: 1, tag: "Ultimate Ceiling QB", rank: 61, yahoo: 57.0, sleeper: 64.0, ecr: 61.0, rz: 45, desc: "Historic athletic profile with 800+ rushing yard and 12+ rushing touchdown upside." },
  { name: "Quinshon Judkins", pos: "RB", team: "NYG", age: 22, depth: "RB1", tier: 2, tag: "Power Workhorse", rank: 62, yahoo: 75.0, sleeper: 65.0, ecr: 62.0, rz: 36, desc: "Punishing inside runner with immediate early-down and goal-line monopoly in NY." },
  { name: "J.K. Dobbins", pos: "RB", team: "LAC", age: 27, depth: "RB1", tier: 2, tag: "Resurgent Bellcow", rank: 63, yahoo: 65.0, sleeper: 66.0, ecr: 63.0, rz: 34, desc: "Elite tackle evasion and high touchdown conversion rate in Jim Harbaugh physical rushing attack." },
  { name: "Jaxson Dart", pos: "QB", team: "NYG", age: 23, depth: "QB1", tier: 2, tag: "Konami Rookie", rank: 64, yahoo: 160.0, sleeper: 110.0, ecr: 85.0, rz: 36, desc: "Huge rushing floor and aggressive downfield passer in Brian Daboll spread system." },
  { name: "Deebo Samuel", pos: "WR", team: "SF", age: 30, depth: "WR2", tier: 2, tag: "Offensive Weapon", rank: 65, yahoo: 58.0, sleeper: 67.0, ecr: 64.0, rz: 22, desc: "Unique hybrid role commanding designed handoffs and high-leverage red zone targets." },
  { name: "David Montgomery", pos: "RB", team: "DET", age: 29, depth: "RB2", tier: 2, tag: "Touchdown Hammer", rank: 66, yahoo: 59.0, sleeper: 68.0, ecr: 65.0, rz: 40, desc: "Locked-in goal-line priority behind elite Lions offensive front." },
  { name: "Jaxon Smith-Njigba", pos: "WR", team: "SEA", age: 24, depth: "WR2", tier: 2, tag: "Slot Machine", rank: 67, yahoo: 60.0, sleeper: 69.0, ecr: 66.0, rz: 14, desc: "High-volume slot receiver with top-tier separation metrics on 3rd down and red zone." },
  { name: "James Conner", pos: "RB", team: "ARI", age: 31, depth: "RB1", tier: 2, tag: "Goal Line Anchor", rank: 68, yahoo: 61.0, sleeper: 70.0, ecr: 67.0, rz: 35, desc: "Consistently out-produces ADP with heavy volume and locked-in red zone carries." },
  { name: "Caleb Williams", pos: "QB", team: "CHI", age: 24, depth: "QB1", tier: 2, tag: "Year 3 Ascent", rank: 69, yahoo: 65.0, sleeper: 71.0, ecr: 68.0, rz: 28, desc: "Sensational off-platform creator in Ben Johnson scheme with Odunze & elite targets." },
  { name: "Jordan Love", pos: "QB", team: "GB", age: 27, depth: "QB1", tier: 2, tag: "Touchdown Slinger", rank: 70, yahoo: 66.0, sleeper: 72.0, ecr: 69.0, rz: 26, desc: "High touchdown rate passer leading one of NFL's most balanced scoring offenses." },

  // 71-80
  { name: "Colston Loveland", pos: "TE", team: "CHI", age: 22, depth: "TE1", tier: 2, tag: "Rookie Weapon TE", rank: 71, yahoo: 95.0, sleeper: 74.0, ecr: 70.0, rz: 15, desc: "Elite move tight end with wide receiver movement skills in Ben Johnson TE-heavy concepts." },
  { name: "D'Andre Swift", pos: "RB", team: "CHI", age: 27, depth: "RB1", tier: 3, tag: "Space Back", rank: 72, yahoo: 67.0, sleeper: 73.0, ecr: 71.0, rz: 26, desc: "Dynamic receiving threat in Ben Johnson multiple backfield attack." },
  { name: "DK Metcalf", pos: "WR", team: "SEA", age: 28, depth: "WR1", tier: 2, tag: "End Zone Alpha", rank: 73, yahoo: 63.0, sleeper: 75.0, ecr: 72.0, rz: 18, desc: "Elite boundary jump-ball winner with 10+ touchdown capability every year." },
  { name: "Tony Pollard", pos: "RB", team: "TEN", age: 29, depth: "RB1", tier: 3, tag: "Dual Workhorse", rank: 74, yahoo: 69.0, sleeper: 76.0, ecr: 73.0, rz: 28, desc: "Heavy touch volume backfield leader with consistent receiving involvement." },
  { name: "Bo Nix", pos: "QB", team: "DEN", age: 26, depth: "QB1", tier: 2, tag: "Rushing Floor QB", rank: 75, yahoo: 78.0, sleeper: 77.0, ecr: 74.0, rz: 34, desc: "Underrated dual-threat in Sean Payton offense with 500+ rushing yard floor." },
  { name: "George Pickens", pos: "WR", team: "PIT", age: 25, depth: "WR1", tier: 2, tag: "Contested Catch Star", rank: 76, yahoo: 64.0, sleeper: 78.0, ecr: 75.0, rz: 16, desc: "Absurd contested catch ability and massive air-yard share on deep targets." },
  { name: "Tyler Warren", pos: "TE", team: "DEN", age: 23, depth: "TE1", tier: 2, tag: "Versatile Move TE", rank: 77, yahoo: 105.0, sleeper: 80.0, ecr: 76.0, rz: 14, desc: "Sean Payton dream weapon used all over formation from inline to wildcat QB." },
  { name: "Isiah Pacheco", pos: "RB", team: "KC", age: 27, depth: "RB1", tier: 3, tag: "Angry Runner", rank: 78, yahoo: 71.0, sleeper: 79.0, ecr: 77.0, rz: 32, desc: "High-intensity ground game leader in potent Patrick Mahomes led offense." },
  { name: "Drake Maye", pos: "QB", team: "NE", age: 24, depth: "QB1", tier: 2, tag: "Big Arm Dual Threat", rank: 79, yahoo: 85.0, sleeper: 81.0, ecr: 78.0, rz: 32, desc: "Ascending franchise QB with prototype size, big arm, and prolific scramble yards." },
  { name: "Brian Robinson Jr.", pos: "RB", team: "WAS", age: 27, depth: "RB1", tier: 3, tag: "Power Closer", rank: 80, yahoo: 73.0, sleeper: 82.0, ecr: 79.0, rz: 34, desc: "Red-zone hammer in high-scoring Jayden Daniels led Washington offensive attack." },

  // 81-90
  { name: "Evan Engram", pos: "TE", team: "JAX", age: 31, depth: "TE1", tier: 2, tag: "PPR Volume TE", rank: 81, yahoo: 74.0, sleeper: 83.0, ecr: 80.0, rz: 14, desc: "Target hog over middle of field with 90+ reception baseline in Liam Coen offense." },
  { name: "Ollie Gordon II", pos: "RB", team: "MIA", age: 22, depth: "RB2", tier: 3, tag: "Big Play Rookie", rank: 82, yahoo: 110.0, sleeper: 85.0, ecr: 81.0, rz: 28, desc: "Size-speed prototype back adding physical interior element to Dolphins speed offense." },
  { name: "Terry McLaurin", pos: "WR", team: "WAS", age: 30, depth: "WR1", tier: 3, tag: "Downfield Ace", rank: 83, yahoo: 76.0, sleeper: 84.0, ecr: 82.0, rz: 14, desc: "Deep threat chemistry with Jayden Daniels yielding high-efficiency splash plays." },
  { name: "Travis Etienne Jr.", pos: "RB", team: "JAX", age: 27, depth: "RB1", tier: 3, tag: "Space Slasher", rank: 84, yahoo: 77.0, sleeper: 86.0, ecr: 83.0, rz: 28, desc: "Versatile backfield threat with breakaway speed and passing down prowess." },
  { name: "Cooper Kupp", pos: "WR", team: "LAR", age: 33, depth: "WR2", tier: 3, tag: "Veteran Slot Master", rank: 85, yahoo: 72.0, sleeper: 87.0, ecr: 84.0, rz: 16, desc: "Masterful red-zone route runner with exceptional chemistry with Matthew Stafford." },
  { name: "David Njoku", pos: "TE", team: "CLE", age: 30, depth: "TE1", tier: 2, tag: "YAC Monster", rank: 86, yahoo: 80.0, sleeper: 88.0, ecr: 85.0, rz: 15, desc: "Dominant tight end in broken play creation and screen pass YAC volume." },
  { name: "Cam Ward", pos: "QB", team: "TEN", age: 24, depth: "QB1", tier: 2, tag: "Rookie Gunslinger", rank: 87, yahoo: 140.0, sleeper: 92.0, ecr: 86.0, rz: 28, desc: "Creative pocket escape artist with aggressive gunslinger mentality and rushing juice." },
  { name: "Chris Godwin", pos: "WR", team: "TB", age: 30, depth: "WR2", tier: 3, tag: "Slot Anchor", rank: 88, yahoo: 81.0, sleeper: 89.0, ecr: 87.0, rz: 14, desc: "High-floor slot technician with 100+ target volume projection from Baker Mayfield." },
  { name: "Rhamondre Stevenson", pos: "RB", team: "NE", age: 28, depth: "RB1", tier: 3, tag: "Physical Anchor", rank: 89, yahoo: 82.0, sleeper: 90.0, ecr: 88.0, rz: 28, desc: "Early-down volume anchor benefiting from Alex Van Pelt power running schemes." },
  { name: "Tank Dell", pos: "WR", team: "HOU", age: 26, depth: "WR2", tier: 3, tag: "Explosive Spark", rank: 90, yahoo: 83.0, sleeper: 91.0, ecr: 89.0, rz: 12, desc: "Devastating route twitch with home-run ability on every single touch." },

  // 91-100
  { name: "Baker Mayfield", pos: "QB", team: "TB", age: 31, depth: "QB1", tier: 2, tag: "Gunslinger Value", rank: 91, yahoo: 92.0, sleeper: 93.0, ecr: 90.0, rz: 26, desc: "Proven 4,000+ yard and 30+ TD ceiling in Liam Coen high-octane passing offense." },
  { name: "Stefon Diggs", pos: "WR", team: "HOU", age: 32, depth: "WR3", tier: 3, tag: "Route Veteran", rank: 92, yahoo: 79.0, sleeper: 94.0, ecr: 91.0, rz: 14, desc: "Surgical separator on 3rd downs and red-zone intermediate crossing routes." },
  { name: "Dallas Goedert", pos: "TE", team: "PHI", age: 31, depth: "TE1", tier: 3, tag: "Efficient Seam TE", rank: 93, yahoo: 88.0, sleeper: 95.0, ecr: 92.0, rz: 13, desc: "High yards-per-target tight end in elite scoring offense with consistent floor." },
  { name: "Jaylen Warren", pos: "RB", team: "PIT", age: 27, depth: "RB1", tier: 3, tag: "PPR Slasher", rank: 94, yahoo: 87.0, sleeper: 96.0, ecr: 93.0, rz: 22, desc: "Elite missed tackle rate and high passing down target share in Arthur Smith offense." },
  { name: "Courtland Sutton", pos: "WR", team: "DEN", age: 30, depth: "WR2", tier: 3, tag: "Touchdown Specialist", rank: 95, yahoo: 89.0, sleeper: 97.0, ecr: 94.0, rz: 16, desc: "Red-zone weapon with elite jump-ball box-out technique on perimeter fades." },
  { name: "Najee Harris", pos: "RB", team: "PIT", age: 28, depth: "RB2", tier: 3, tag: "Goal Line Hammer", rank: 96, yahoo: 86.0, sleeper: 98.0, ecr: 95.0, rz: 30, desc: "Physical interior runner with secured goal-line touches in run-first attack." },
  { name: "Keon Coleman", pos: "WR", team: "BUF", age: 23, depth: "WR1", tier: 3, tag: "Red Zone Jump Ball", rank: 97, yahoo: 96.0, sleeper: 99.0, ecr: 96.0, rz: 15, desc: "Josh Allen's top contested-catch weapon on boundary fades and end-zone looks." },
  { name: "Jake Ferguson", pos: "TE", team: "DAL", age: 27, depth: "TE1", tier: 3, tag: "Red Zone Target TE", rank: 98, yahoo: 90.0, sleeper: 100.0, ecr: 97.0, rz: 16, desc: "Dak Prescott's trusted second option in pass-heavy Dallas offensive attack." },
  { name: "Justin Fields", pos: "QB", team: "PIT", age: 27, depth: "QB1", tier: 2, tag: "Konami Cheat Code", rank: 99, yahoo: 102.0, sleeper: 101.0, ecr: 98.0, rz: 40, desc: "Top 3 rushing QB ceiling with Arthur Smith designed QB power and zone read volume." },
  { name: "Zach Charbonnet", pos: "RB", team: "SEA", age: 25, depth: "RB2", tier: 3, tag: "Premier Standalone Handcuff", rank: 100, yahoo: 98.0, sleeper: 102.0, ecr: 99.0, rz: 26, desc: "High-value standalone volume back with instant RB1 overall upside if Kenneth Walker misses any time." },

  // 101-110
  { name: "Nicholas Singleton", pos: "RB", team: "CLE", age: 22, depth: "RB1", tier: 3, tag: "Rookie Speedster", rank: 101, yahoo: 125.0, sleeper: 103.0, ecr: 100.0, rz: 24, desc: "Home run threat with 4.38 speed stepping into Kevin Stefanski outside zone scheme." },
  { name: "Trevor Lawrence", pos: "QB", team: "JAX", age: 26, depth: "QB1", tier: 3, tag: "Post-Hype Value", rank: 102, yahoo: 98.0, sleeper: 104.0, ecr: 101.0, rz: 24, desc: "Underpriced franchise QB with Brian Thomas Jr. and improved pass protection." },
  { name: "Khalil Shakir", pos: "WR", team: "BUF", age: 26, depth: "WR2", tier: 3, tag: "YAC Monster Slot", rank: 103, yahoo: 94.0, sleeper: 105.0, ecr: 102.0, rz: 14, desc: "Historic 85%+ catch rate and unmatched yards after catch over middle of field for Josh Allen." },
  { name: "DeMario Douglas", pos: "WR", team: "NE", age: 25, depth: "WR2", tier: 3, tag: "Slot Target Hog", rank: 104, yahoo: 112.0, sleeper: 106.0, ecr: 103.0, rz: 11, desc: "High-percentage route separator commanding heavy target share on early downs." },
  { name: "Javonte Williams", pos: "RB", team: "DEN", age: 26, depth: "RB1", tier: 3, tag: "Tackle Breaker", rank: 105, yahoo: 94.0, sleeper: 107.0, ecr: 104.0, rz: 26, desc: "Power runner with renewed explosiveness in Sean Payton multi-faceted rushing system." },
  { name: "Quinn Ewers", pos: "QB", team: "LV", age: 23, depth: "QB1", tier: 3, tag: "Rookie Arm Talent", rank: 106, yahoo: 165.0, sleeper: 115.0, ecr: 105.0, rz: 20, desc: "Natural arm talent with Brock Bowers and ascending weapons in Las Vegas." },
  { name: "Jordan Addison", pos: "WR", team: "MIN", age: 24, depth: "WR2", tier: 3, tag: "End Zone Craftsman", rank: 107, yahoo: 97.0, sleeper: 108.0, ecr: 106.0, rz: 13, desc: "Smooth route runner with high-end touchdown conversion rate opposite Justin Jefferson." },
  { name: "Rico Dowdle", pos: "RB", team: "DAL", age: 28, depth: "RB2", tier: 4, tag: "Change of Pace", rank: 108, yahoo: 104.0, sleeper: 109.0, ecr: 107.0, rz: 22, desc: "High-efficiency supplementary back in explosive Dallas offensive environment." },
  { name: "Christian Kirk", pos: "WR", team: "JAX", age: 29, depth: "WR2", tier: 3, tag: "Slot Chain Mover", rank: 109, yahoo: 101.0, sleeper: 110.0, ecr: 108.0, rz: 12, desc: "Reliable intermediate weapon with consistent 6-8 target floor from Trevor Lawrence." },
  { name: "Tucker Kraft", pos: "TE", team: "GB", age: 25, depth: "TE1", tier: 3, tag: "YAC Tight End", rank: 110, yahoo: 108.0, sleeper: 111.0, ecr: 109.0, rz: 14, desc: "Fierce YAC monster taking over primary tight end role in Matt LaFleur offense." },

  // 111-120
  { name: "Jameson Williams", pos: "WR", team: "DET", age: 25, depth: "WR2", tier: 3, tag: "Explosive Deep Alpha", rank: 111, yahoo: 102.0, sleeper: 112.0, ecr: 110.0, rz: 14, desc: "Game-breaking speed capable of 80-yard house calls on any snap in high-scoring Lions attack." },
  { name: "Rashod Bateman", pos: "WR", team: "BAL", age: 26, depth: "WR2", tier: 4, tag: "Boundary Separator", rank: 112, yahoo: 115.0, sleeper: 113.0, ecr: 111.0, rz: 10, desc: "Underrated separation metrics on boundary routes in efficient Lamar Jackson scheme." },
  { name: "Jerome Ford", pos: "RB", team: "CLE", age: 26, depth: "RB2", tier: 4, tag: "Big Play Back", rank: 113, yahoo: 106.0, sleeper: 114.0, ecr: 112.0, rz: 20, desc: "Explosive pass-catching back with home-run speed on perimeter runs." },
  { name: "Ricky Pearsall", pos: "WR", team: "SF", age: 25, depth: "WR3", tier: 4, tag: "Year 3 Ascent", rank: 114, yahoo: 120.0, sleeper: 115.0, ecr: 113.0, rz: 11, desc: "Elite hands and route nuance stepping into expanded role in Shanahan offense." },
  { name: "Jonathon Brooks", pos: "RB", team: "CAR", age: 23, depth: "RB2", tier: 4, tag: "Talented Slasher", rank: 115, yahoo: 114.0, sleeper: 116.0, ecr: 114.0, rz: 22, desc: "Dynamic backfield talent ready for expanded share alongside Chuba Hubbard." },
  { name: "Jared Goff", pos: "QB", team: "DET", age: 31, depth: "QB1", tier: 3, tag: "Dome Master", rank: 116, yahoo: 105.0, sleeper: 117.0, ecr: 115.0, rz: 22, desc: "Elite pocket passer playing majority of games in weather-controlled dome environments." },
  { name: "Josh Downs", pos: "WR", team: "IND", age: 25, depth: "WR2", tier: 4, tag: "Slot Spark", rank: 117, yahoo: 118.0, sleeper: 118.0, ecr: 116.0, rz: 10, desc: "Quick-twitch slot weapon with high target rate per route run metric." },
  { name: "Jordan Mason", pos: "RB", team: "SF", age: 27, depth: "RB2", tier: 4, tag: "Power Zone Runner", rank: 118, yahoo: 112.0, sleeper: 119.0, ecr: 117.0, rz: 24, desc: "Proven heavy-volume efficiency in Shanahan offense with massive contingency ceiling." },
  { name: "Zack Moss", pos: "RB", team: "CIN", age: 28, depth: "RB2", tier: 4, tag: "Goal Line Back", rank: 119, yahoo: 110.0, sleeper: 120.0, ecr: 118.0, rz: 25, desc: "Reliable short-yardage and goal-line contributor in potent Cincinnati offense." },
  { name: "Adonai Mitchell", pos: "WR", team: "IND", age: 23, depth: "WR3", tier: 4, tag: "Downfield Threat", rank: 120, yahoo: 128.0, sleeper: 121.0, ecr: 119.0, rz: 11, desc: "Freakish athletic profile with massive separation scores on deep vertical routes." },

  // 121-130
  { name: "Taysom Hill", pos: "TE", team: "NO", age: 36, depth: "TE2", tier: 3, tag: "Goal Line Cheat", rank: 121, yahoo: 122.0, sleeper: 122.0, ecr: 120.0, rz: 30, desc: "Direct-snap quarterback running plays near goal line provide weekly multi-TD upside." },
  { name: "Ray Davis", pos: "RB", team: "BUF", age: 26, depth: "RB2", tier: 4, tag: "Physical Complement", rank: 122, yahoo: 124.0, sleeper: 123.0, ecr: 121.0, rz: 22, desc: "Physical inside runner handling short-yardage dirty work behind James Cook." },
  { name: "Matthew Stafford", pos: "QB", team: "LAR", age: 38, depth: "QB1", tier: 3, tag: "No-Look Slinger", rank: 123, yahoo: 116.0, sleeper: 125.0, ecr: 122.0, rz: 20, desc: "Masterful distributor feeding Puka Nacua and Cooper Kupp with high TD ceiling." },
  { name: "Wan'Dale Robinson", pos: "WR", team: "NYG", age: 25, depth: "WR2", tier: 4, tag: "PPR Machine", rank: 124, yahoo: 126.0, sleeper: 124.0, ecr: 123.0, rz: 9, desc: "Short-area PPR vacuum commanding 7+ targets per game underneath Malik Nabers." },
  { name: "Tyjae Spears", pos: "RB", team: "TEN", age: 25, depth: "RB2", tier: 4, tag: "Agility Weapon", rank: 125, yahoo: 119.0, sleeper: 126.0, ecr: 124.0, rz: 18, desc: "Electric change-of-direction back with high receiving floor in space." },
  { name: "Demarcus Robinson", pos: "WR", team: "LAR", age: 31, depth: "WR3", tier: 4, tag: "Red Zone Target", rank: 126, yahoo: 130.0, sleeper: 128.0, ecr: 125.0, rz: 12, desc: "Stafford's trusted red-zone boundary target with steady touchdown conversion." },
  { name: "Isaiah Likely", pos: "TE", team: "BAL", age: 26, depth: "TE2", tier: 4, tag: "Hybrid Matchup", rank: 127, yahoo: 125.0, sleeper: 129.0, ecr: 126.0, rz: 13, desc: "Explosive seam receiver in two-TE sets with elite standalone handcuff value." },
  { name: "Rashid Shaheed", pos: "WR", team: "NO", age: 27, depth: "WR2", tier: 4, tag: "Deep Ball House Call", rank: 128, yahoo: 128.0, sleeper: 130.0, ecr: 127.0, rz: 10, desc: "Elite 4.3 speed with top-tier deep target EPA and kickoff/punt return scoring bonus equity." },
  { name: "Josh Palmer", pos: "WR", team: "LAC", age: 26, depth: "WR2", tier: 4, tag: "Herbert Target", rank: 129, yahoo: 132.0, sleeper: 131.0, ecr: 128.0, rz: 10, desc: "Dependable intermediate target with established trust from Justin Herbert." },
  { name: "Blake Corum", pos: "RB", team: "LAR", age: 25, depth: "RB2", tier: 4, tag: "Elite Handcuff", rank: 130, yahoo: 134.0, sleeper: 132.0, ecr: 129.0, rz: 20, desc: "High-end handcuff with immediate RB1 upside if Kyren Williams misses time." },

  // 131-140
  { name: "Darnell Mooney", pos: "WR", team: "ATL", age: 28, depth: "WR2", tier: 4, tag: "Speed Field Stretcher", rank: 131, yahoo: 131.0, sleeper: 134.0, ecr: 130.0, rz: 10, desc: "Consistent air-yard volume and downfield splash plays in Zac Robinson attack." },
  { name: "Jermaine Burton", pos: "WR", team: "CIN", age: 25, depth: "WR3", tier: 4, tag: "Deep Playmaker", rank: 132, yahoo: 145.0, sleeper: 135.0, ecr: 131.0, rz: 9, desc: "Blazing deep speed with expanded 3rd WR snaps in pass-happy Burrow offense." },
  { name: "Tyler Allgeier", pos: "RB", team: "ATL", age: 26, depth: "RB2", tier: 4, tag: "Physical Handcuff", rank: 133, yahoo: 135.0, sleeper: 137.0, ecr: 132.0, rz: 22, desc: "Premier standalone backup with guaranteed standalone touches and goal-line equity." },
  { name: "Justin Herbert", pos: "QB", team: "LAC", age: 28, depth: "QB1", tier: 3, tag: "Elite Arm Talent", rank: 134, yahoo: 121.0, sleeper: 136.0, ecr: 133.0, rz: 22, desc: "Hyper-efficient arm with Ladd McConkey emergence and high-leverage red zone passing." },
  { name: "Brock Purdy", pos: "QB", team: "SF", age: 26, depth: "QB1", tier: 3, tag: "Hyper-Efficient Maestro", rank: 135, yahoo: 123.0, sleeper: 138.0, ecr: 134.0, rz: 24, desc: "Top-tier passer rating and EPA per dropback in Shanahan's loaded offensive engine." },
  { name: "Ja'Lynn Polk", pos: "WR", team: "NE", age: 24, depth: "WR3", tier: 4, tag: "Contested Target", rank: 136, yahoo: 148.0, sleeper: 139.0, ecr: 135.0, rz: 9, desc: "Strong-handed boundary receiver developing chemistry with Drake Maye." },
  { name: "Braelon Allen", pos: "RB", team: "NYJ", age: 22, depth: "RB2", tier: 4, tag: "Bruiser Handcuff", rank: 137, yahoo: 138.0, sleeper: 140.0, ecr: 136.0, rz: 24, desc: "Massive 240-pound power back with standalone goal-line role and elite handcuff value." },
  { name: "Hunter Henry", pos: "TE", team: "NE", age: 31, depth: "TE1", tier: 4, tag: "Red Zone Safety Valve", rank: 138, yahoo: 139.0, sleeper: 141.0, ecr: 137.0, rz: 12, desc: "Drake Maye's go-to third-down and red-zone option with steady 5-target floor." },
  { name: "Trevor Etienne", pos: "RB", team: "DEN", age: 22, depth: "RB2", tier: 4, tag: "Rookie Dual Threat", rank: 139, yahoo: 162.0, sleeper: 142.0, ecr: 138.0, rz: 16, desc: "Sean Payton style satellite back with exceptional contact balance and vision." },
  { name: "Tyler Lockett", pos: "WR", team: "SEA", age: 33, depth: "WR3", tier: 4, tag: "Savvy Veteran", rank: 140, yahoo: 136.0, sleeper: 144.0, ecr: 139.0, rz: 10, desc: "Elite sideline toe-tap technician with reliable hands on high-leverage downs." },

  // 141-150
  { name: "Kimani Vidal", pos: "RB", team: "LAC", age: 24, depth: "RB2", tier: 4, tag: "Compact Slasher", rank: 141, yahoo: 142.0, sleeper: 143.0, ecr: 140.0, rz: 18, desc: "Greg Roman compact downhill runner with tackle-breaking burst in gap schemes." },
  { name: "Pat Freiermuth", pos: "TE", team: "PIT", age: 27, depth: "TE1", tier: 4, tag: "Muth Target", rank: 142, yahoo: 141.0, sleeper: 145.0, ecr: 141.0, rz: 11, desc: "Arthur Smith offense heavily emphasizes tight end targets over the middle." },
  { name: "Michael Pittman Jr.", pos: "WR", team: "IND", age: 28, depth: "WR1", tier: 3, tag: "Possession Alpha", rank: 143, yahoo: 109.0, sleeper: 127.0, ecr: 119.0, rz: 13, desc: "Physical possession receiver commanding targets on slant and curl concepts." },
  { name: "Jauan Jennings", pos: "WR", team: "SF", age: 29, depth: "WR3", tier: 4, tag: "Third Down Machine", rank: 144, yahoo: 144.0, sleeper: 146.0, ecr: 142.0, rz: 12, desc: "Clutch contested-catch winner and chain-mover who commands high red-zone trust from Purdy." },
  { name: "Christian Watson", pos: "WR", team: "GB", age: 27, depth: "WR2", tier: 4, tag: "Touchdown Anomaly", rank: 145, yahoo: 140.0, sleeper: 147.0, ecr: 143.0, rz: 14, desc: "6'4 speedster with huge multi-touchdown upside on boundary go-balls and end-zone fades." },
  { name: "Romeo Doubs", pos: "WR", team: "GB", age: 26, depth: "WR3", tier: 4, tag: "Red Zone Reliable", rank: 146, yahoo: 142.0, sleeper: 148.0, ecr: 144.0, rz: 15, desc: "Jordan Love's most trusted boundary boundary target on 3rd down and goal-to-go." },
  { name: "Jerry Jeudy", pos: "WR", team: "CLE", age: 27, depth: "WR1", tier: 4, tag: "Route Craftsman", rank: 147, yahoo: 138.0, sleeper: 149.0, ecr: 145.0, rz: 12, desc: "Primary target earner in Cleveland passing tree with top-tier route separation." },
  { name: "Cole Kmet", pos: "TE", team: "CHI", age: 27, depth: "TE2", tier: 4, tag: "Red Zone Giant", rank: 148, yahoo: 149.0, sleeper: 151.0, ecr: 146.0, rz: 11, desc: "Big-bodied red-zone target with reliable hands on Caleb Williams play-action throws." },
  { name: "Jaylen Wright", pos: "RB", team: "MIA", age: 23, depth: "RB3", tier: 4, tag: "4.38 Speed Spark", rank: 149, yahoo: 154.0, sleeper: 150.0, ecr: 147.0, rz: 15, desc: "Explosive one-cut slasher in Mike McDaniel space-creation run concepts." },
  { name: "MarShawn Lloyd", pos: "RB", team: "GB", age: 25, depth: "RB2", tier: 4, tag: "Dynamic Handcuff", rank: 150, yahoo: 155.0, sleeper: 152.0, ecr: 148.0, rz: 16, desc: "Explosive cutting ability and tackle evasion behind Josh Jacobs in Green Bay." },

  // 151-160
  { name: "Ben Sinnott", pos: "TE", team: "WAS", age: 24, depth: "TE1", tier: 4, tag: "Ascending Move TE", rank: 151, yahoo: 156.0, sleeper: 153.0, ecr: 149.0, rz: 14, desc: "Dynamic H-back weapon with huge YAC potential taking over featured TE snaps with Jayden Daniels." },
  { name: "Tyrone Tracy Jr.", pos: "RB", team: "NYG", age: 26, depth: "RB1", tier: 4, tag: "Workhorse Dynamic RB", rank: 152, yahoo: 145.0, sleeper: 154.0, ecr: 150.0, rz: 22, desc: "Dynamic tackle-breaking back with elite receiving chops commanding primary backfield role in NY." },
  { name: "Trey Benson", pos: "RB", team: "ARI", age: 24, depth: "RB2", tier: 4, tag: "Ascending Slasher", rank: 153, yahoo: 150.0, sleeper: 155.0, ecr: 151.0, rz: 18, desc: "Explosive 4.39 speed with expanding second-half workload behind James Conner." },
  { name: "Xavier Legette", pos: "WR", team: "CAR", age: 25, depth: "WR2", tier: 4, tag: "Size Speed Freak", rank: 154, yahoo: 152.0, sleeper: 156.0, ecr: 152.0, rz: 12, desc: "4.39 speed with 225-pound frame expanding sophomore year target share." },
  { name: "Troy Franklin", pos: "WR", team: "DEN", age: 23, depth: "WR3", tier: 4, tag: "Bo Nix Connection", rank: 155, yahoo: 158.0, sleeper: 157.0, ecr: 153.0, rz: 10, desc: "College teammate chemistry with Bo Nix unlocks built-in trust on deep concepts." },
  { name: "Chigoziem Okonkwo", pos: "TE", team: "TEN", age: 26, depth: "TE1", tier: 4, tag: "YAC Dynamic TE", rank: 156, yahoo: 161.0, sleeper: 158.0, ecr: 154.0, rz: 10, desc: "Hyper-athletic move tight end with exceptional yards after the catch on drag routes." },
  { name: "Bryce Young", pos: "QB", team: "CAR", age: 25, depth: "QB1", tier: 4, tag: "Post-Hype Sleeper", rank: 157, yahoo: 168.0, sleeper: 160.0, ecr: 155.0, rz: 15, desc: "Dave Canales offensive system and Luther Burden III upgrade unleash quick-game rhythm." },
  { name: "Cade Otton", pos: "TE", team: "TB", age: 27, depth: "TE1", tier: 4, tag: "Snap Share Leader", rank: 158, yahoo: 165.0, sleeper: 161.0, ecr: 156.0, rz: 11, desc: "Plays 95%+ of offensive snaps in high-scoring Baker Mayfield aerial attack." },
  { name: "J.J. McCarthy", pos: "QB", team: "MIN", age: 23, depth: "QB1", tier: 4, tag: "Kevin O'Connell Scheme", rank: 159, yahoo: 172.0, sleeper: 163.0, ecr: 157.0, rz: 18, desc: "Surrounded by Justin Jefferson, Jordan Addison, and elite offensive tackle play." },
  { name: "Michael Penix Jr.", pos: "QB", team: "ATL", age: 26, depth: "QB2", tier: 5, tag: "Left-Handed Cannon", rank: 160, yahoo: 180.0, sleeper: 165.0, ecr: 158.0, rz: 12, desc: "Elite arm strength in Zac Robinson high-powered offense with Bijan Robinson and Drake London." },

  // 161-176
  { name: "Roman Wilson", pos: "WR", team: "PIT", age: 25, depth: "WR2", tier: 5, tag: "Slot Separator", rank: 161, yahoo: 178.0, sleeper: 167.0, ecr: 159.0, rz: 8, desc: "High-motor slot route runner with 4.39 speed and elite contested-catch hands." },
  { name: "Jalen McMillan", pos: "WR", team: "TB", age: 24, depth: "WR3", tier: 5, tag: "Third Down Target", rank: 162, yahoo: 179.0, sleeper: 168.0, ecr: 160.0, rz: 9, desc: "Crisp intermediate route runner operating from the slot in pass-heavy Tampa scheme." },
  { name: "Malachi Corley", pos: "WR", team: "NYJ", age: 24, depth: "WR3", tier: 5, tag: "YAC Bowling Ball", rank: 163, yahoo: 182.0, sleeper: 169.0, ecr: 161.0, rz: 9, desc: "Manufactured touch specialist with tackle-breaking power on quick screens and jets." },
  { name: "Luke McCaffrey", pos: "WR", team: "WAS", age: 25, depth: "WR3", tier: 5, tag: "Slot Chain Mover", rank: 164, yahoo: 184.0, sleeper: 170.0, ecr: 162.0, rz: 8, desc: "Natural feel for zone coverage underneath Terry McLaurin deep crossers." },
  { name: "Roschon Johnson", pos: "RB", team: "CHI", age: 25, depth: "RB2", tier: 5, tag: "Goal Line Bruiser", rank: 165, yahoo: 183.0, sleeper: 171.0, ecr: 163.0, rz: 20, desc: "Pass protection specialist and short-yardage hammer in Chicago multi-back system." },
  { name: "Keaton Mitchell", pos: "RB", team: "BAL", age: 24, depth: "RB3", tier: 5, tag: "4.33 Lightning", rank: 166, yahoo: 186.0, sleeper: 172.0, ecr: 164.0, rz: 10, desc: "Explosive home-run threat capable of scoring on any outside pitch play." },
  { name: "Tank Bigsby", pos: "RB", team: "JAX", age: 24, depth: "RB2", tier: 5, tag: "Downhill Hammer", rank: 167, yahoo: 181.0, sleeper: 173.0, ecr: 165.0, rz: 22, desc: "Hard-nosed interior runner taking high-leverage early-down carries in Jacksonville." },
  { name: "Ty Chandler", pos: "RB", team: "MIN", age: 28, depth: "RB2", tier: 5, tag: "Speed Complement", rank: 168, yahoo: 188.0, sleeper: 174.0, ecr: 166.0, rz: 14, desc: "One-cut acceleration in Kevin O'Connell wide zone running concepts." },
  { name: "Audric Estimé", pos: "RB", team: "DEN", age: 23, depth: "RB3", tier: 5, tag: "Power Finisher", rank: 169, yahoo: 190.0, sleeper: 175.0, ecr: 167.0, rz: 18, desc: "230-pound goal-line weapon handling short-yardage and fourth-quarter clock killing." },
  { name: "Isaac Guerendo", pos: "RB", team: "SF", age: 26, depth: "RB2", tier: 5, tag: "4.33 Athletic Freak", rank: 170, yahoo: 187.0, sleeper: 176.0, ecr: 168.0, rz: 15, desc: "Freak athletic back in Kyle Shanahan zone scheme with massive handcuff value." },
  { name: "Kenneth Gainwell", pos: "RB", team: "PHI", age: 27, depth: "RB2", tier: 5, tag: "Pass Down Specialist", rank: 171, yahoo: 192.0, sleeper: 177.0, ecr: 169.0, rz: 14, desc: "Two-minute drill passing back with trusted pass blocking in Philadelphia." },
  { name: "Jaleel McLaughlin", pos: "RB", team: "DEN", age: 25, depth: "RB3", tier: 5, tag: "Quick Burst Spark", rank: 172, yahoo: 194.0, sleeper: 178.0, ecr: 170.0, rz: 12, desc: "Lightning quick change of pace runner with high yards-per-touch efficiency." },
  { name: "Theo Johnson", pos: "TE", team: "NYG", age: 25, depth: "TE1", tier: 5, tag: "9.99 RAS Athlete", rank: 173, yahoo: 195.0, sleeper: 179.0, ecr: 171.0, rz: 9, desc: "Generational athletic testing tight end commanding starting snaps in NY." },
  { name: "Gabe Davis", pos: "WR", team: "JAX", age: 27, depth: "WR3", tier: 5, tag: "Boom Bust Deep Threat", rank: 174, yahoo: 185.0, sleeper: 180.0, ecr: 172.0, rz: 10, desc: "Classic high-variance field stretcher capable of multi-touchdown spike weeks." },
  { name: "Dameon Pierce", pos: "RB", team: "HOU", age: 26, depth: "RB2", tier: 5, tag: "Power Handcuff", rank: 175, yahoo: 188.0, sleeper: 181.0, ecr: 173.0, rz: 15, desc: "Violent downhill runner serving as primary goal-line complement in Houston." },
  { name: "Kareem Hunt", pos: "RB", team: "KC", age: 31, depth: "RB3", tier: 5, tag: "Goal Line Vulture", rank: 176, yahoo: 189.0, sleeper: 182.0, ecr: 174.0, rz: 22, desc: "Physical short-yardage and goal-line specialist in Chiefs scoring machine." }
];

// Appended Kickers (K) (Rank 177 to 192)
const kickerOptions = [
  { name: "Brandon Aubrey", pos: "K", team: "DAL", age: 31, depth: "K1", tier: 1, tag: "Record Range Kicker", rank: 177, yahoo: 115.0, sleeper: 120.0, ecr: 110.0, rz: 0, desc: "NFL record 65+ yard range in highest scoring dome offense. Huge positional edge." },
  { name: "Justin Tucker", pos: "K", team: "BAL", age: 36, depth: "K1", tier: 1, tag: "Clutch Legend Kicker", rank: 178, yahoo: 125.0, sleeper: 130.0, ecr: 122.0, rz: 0, desc: "Automatic scoring opportunities in high-efficiency Lamar Jackson offense." },
  { name: "Ka'imi Fairbairn", pos: "K", team: "HOU", age: 32, depth: "K1", tier: 1, tag: "Dome Accuracy Kicker", rank: 179, yahoo: 138.0, sleeper: 135.0, ecr: 130.0, rz: 0, desc: "Elite dome conditions with high-scoring C.J. Stroud offense creating constant field goals." },
  { name: "Cameron Dicker", pos: "K", team: "LAC", age: 26, depth: "K1", tier: 1, tag: "Dicker the Kicker", rank: 180, yahoo: 140.0, sleeper: 138.0, ecr: 132.0, rz: 0, desc: "95%+ career field goal accuracy in weather-free SoFi stadium." },
  { name: "Harrison Butker", pos: "K", team: "KC", age: 31, depth: "K1", tier: 1, tag: "Chiefs Engine Kicker", rank: 181, yahoo: 144.0, sleeper: 142.0, ecr: 137.0, rz: 0, desc: "High volume extra points and reliable 50-yard strikes in Chiefs offense." },
  { name: "Jake Bates", pos: "K", team: "DET", age: 26, depth: "K1", tier: 2, tag: "64-Yard Monster Leg", rank: 182, yahoo: 152.0, sleeper: 147.0, ecr: 142.0, rz: 0, desc: "UFL sensation with 64-yard leg playing under Ford Field dome roof." },
  { name: "Chase McLaughlin", pos: "K", team: "TB", age: 30, depth: "K1", tier: 2, tag: "Deep Ball Striker", rank: 183, yahoo: 155.0, sleeper: 150.0, ecr: 146.0, rz: 0, desc: "Automatic from 50+ yards in sunny Tampa Bay scoring attack." },
  { name: "Jason Sanders", pos: "K", team: "MIA", age: 30, depth: "K1", tier: 2, tag: "Warm Weather Kicker", rank: 184, yahoo: 158.0, sleeper: 154.0, ecr: 148.0, rz: 0, desc: "Prolific volume in high-flying Miami offensive attack." },
  { name: "Greg Zuerlein", pos: "K", team: "NYJ", age: 38, depth: "K1", tier: 2, tag: "Greg the Leg", rank: 185, yahoo: 160.0, sleeper: 156.0, ecr: 150.0, rz: 0, desc: "Huge leg from 50+ yards with improved red-zone stall opportunities." },
  { name: "Chris Boswell", pos: "K", team: "PIT", age: 35, depth: "K1", tier: 2, tag: "Steel City Automatic", rank: 186, yahoo: 162.0, sleeper: 158.0, ecr: 152.0, rz: 0, desc: "Lethal 50+ yard accuracy carrying Pittsburgh offense in close games." },
  { name: "Younghoe Koo", pos: "K", team: "ATL", age: 32, depth: "K1", tier: 2, tag: "Dome Specialist", rank: 187, yahoo: 165.0, sleeper: 160.0, ecr: 154.0, rz: 0, desc: "Clutch dome kicker with prolific opportunities in Atlanta offense." },
  { name: "Jake Moody", pos: "K", team: "SF", age: 26, depth: "K1", tier: 2, tag: "Bay Area Leg", rank: 188, yahoo: 167.0, sleeper: 162.0, ecr: 156.0, rz: 0, desc: "High point total potential in high-scoring 49ers offensive engine." },
  { name: "Evan McPherson", pos: "K", team: "CIN", age: 27, depth: "K1", tier: 2, tag: "Money Mac Kicker", rank: 189, yahoo: 168.0, sleeper: 164.0, ecr: 158.0, rz: 0, desc: "High-scoring Bengals offense provides prolific extra points and long-distance field goals." },
  { name: "Matt Gay", pos: "K", team: "IND", age: 32, depth: "K1", tier: 2, tag: "Indy Dome Leg", rank: 190, yahoo: 170.0, sleeper: 166.0, ecr: 160.0, rz: 0, desc: "Lucas Oil Stadium dome conditions create reliable scoring environment." },
  { name: "Dustin Hopkins", pos: "K", team: "CLE", age: 35, depth: "K1", tier: 2, tag: "50-Yard Specialist", rank: 191, yahoo: 172.0, sleeper: 168.0, ecr: 162.0, rz: 0, desc: "Elite percentage on 50+ yard attempts." },
  { name: "Cairo Santos", pos: "K", team: "CHI", age: 34, depth: "K1", tier: 2, tag: "Windy City Precision", rank: 192, yahoo: 174.0, sleeper: 170.0, ecr: 164.0, rz: 0, desc: "Proven precision accuracy in outdoor northern weather." }
];

// Appended Defenses (DEF) (Rank 193 to 208)
const defenseOptions = [
  { name: "San Francisco 49ers", pos: "DEF", team: "SF", age: 0, depth: "DEF1", tier: 1, tag: "Turnover Force", rank: 193, yahoo: 130.0, sleeper: 125.0, ecr: 120.0, rz: 0, desc: "Elite pass rush with Nick Bosa and Fred Warner creating constant turnover opportunities." },
  { name: "Baltimore Ravens", pos: "DEF", team: "BAL", age: 0, depth: "DEF1", tier: 1, tag: "Pressure Monster", rank: 194, yahoo: 132.0, sleeper: 128.0, ecr: 122.0, rz: 0, desc: "Zach Orr blitz schemes generate top-tier sack totals and defensive touchdowns." },
  { name: "Pittsburgh Steelers", pos: "DEF", team: "PIT", age: 0, depth: "DEF1", tier: 1, tag: "Sack Machine", rank: 195, yahoo: 135.0, sleeper: 130.0, ecr: 125.0, rz: 0, desc: "T.J. Watt and Alex Highsmith provide league-highest pressure rate and strip-sack ceiling." },
  { name: "Buffalo Bills", pos: "DEF", team: "BUF", age: 0, depth: "DEF1", tier: 1, tag: "Takeaway Dominators", rank: 196, yahoo: 137.0, sleeper: 132.0, ecr: 128.0, rz: 0, desc: "Sean McDermott zone defense consistently finishes top 5 in interceptions." },
  { name: "Kansas City Chiefs", pos: "DEF", team: "KC", age: 0, depth: "DEF1", tier: 1, tag: "Spagnuolo Blitz Unit", rank: 197, yahoo: 142.0, sleeper: 136.0, ecr: 131.0, rz: 0, desc: "Steve Spagnuolo exotic blitz packages dominate 3rd down passing situations." },
  { name: "Houston Texans", pos: "DEF", team: "HOU", age: 0, depth: "DEF1", tier: 1, tag: "Ascending Pass Rush", rank: 198, yahoo: 145.0, sleeper: 139.0, ecr: 134.0, rz: 0, desc: "Will Anderson Jr. and Danielle Hunter form most terrifying edge rusher tandem in NFL." },
  { name: "Philadelphia Eagles", pos: "DEF", team: "PHI", age: 0, depth: "DEF1", tier: 1, tag: "Vic Fangio Scheme", rank: 199, yahoo: 147.0, sleeper: 141.0, ecr: 136.0, rz: 0, desc: "Elite secondary with Quinyon Mitchell and Cooper DeJean locking down opposing wideouts." },
  { name: "Detroit Lions", pos: "DEF", team: "DET", age: 0, depth: "DEF1", tier: 2, tag: "Smashmouth Front", rank: 200, yahoo: 150.0, sleeper: 145.0, ecr: 140.0, rz: 0, desc: "Aidan Hutchinson leads relentless pass rush forcing hurried quarterback throws." },
  { name: "Minnesota Vikings", pos: "DEF", team: "MIN", age: 0, depth: "DEF1", tier: 2, tag: "Flores Chaos Defense", rank: 201, yahoo: 153.0, sleeper: 148.0, ecr: 143.0, rz: 0, desc: "Brian Flores cover-zero blitz chaos generates league-leading quarterback confusion." },
  { name: "Denver Broncos", pos: "DEF", team: "DEN", age: 0, depth: "DEF1", tier: 2, tag: "Surtain Lockdown", rank: 202, yahoo: 155.0, sleeper: 150.0, ecr: 145.0, rz: 0, desc: "Patrick Surtain II erases opponent WR1s while front seven generates heavy sack volume." },
  { name: "Cleveland Browns", pos: "DEF", team: "CLE", age: 0, depth: "DEF1", tier: 2, tag: "Myles Garrett Engine", rank: 203, yahoo: 157.0, sleeper: 152.0, ecr: 147.0, rz: 0, desc: "Myles Garrett single-handedly wrecks offensive game plans at home in Cleveland weather." },
  { name: "New York Jets", pos: "DEF", team: "NYJ", age: 0, depth: "DEF1", tier: 2, tag: "Sauce Island Secondary", rank: 204, yahoo: 159.0, sleeper: 154.0, ecr: 149.0, rz: 0, desc: "Sauce Gardner leads elite coverage unit limiting opposing passing yardage." },
  { name: "Dallas Cowboys", pos: "DEF", team: "DAL", age: 0, depth: "DEF1", tier: 2, tag: "Parsons Havoc Unit", rank: 205, yahoo: 161.0, sleeper: 156.0, ecr: 151.0, rz: 0, desc: "Micah Parsons creates game-changing turnovers and strip sacks in high-scoring games." },
  { name: "Chicago Bears", pos: "DEF", team: "CHI", age: 0, depth: "DEF1", tier: 2, tag: "Montez Sweat Front", rank: 206, yahoo: 163.0, sleeper: 158.0, ecr: 153.0, rz: 0, desc: "Fast-flowing linebackers and aggressive ball-hawking secondary create defensive touchdowns." },
  { name: "Green Bay Packers", pos: "DEF", team: "GB", age: 0, depth: "DEF1", tier: 2, tag: "Hafley Fast Unit", rank: 207, yahoo: 165.0, sleeper: 160.0, ecr: 155.0, rz: 0, desc: "Xavier McKinney ball-hawking safety play anchors aggressive young defense." },
  { name: "Miami Dolphins", pos: "DEF", team: "MIA", age: 0, depth: "DEF1", tier: 2, tag: "Speed Blitz Attack", rank: 208, yahoo: 167.0, sleeper: 162.0, ecr: 157.0, rz: 0, desc: "High-octane pass rush with high turnover variance in warm weather conditions." }
];

const allCombined = [...skillPlayers, ...kickerOptions, ...defenseOptions];

console.log(`Curated ${allCombined.length} total players for Brown Ballers 2026 Engine...`);

// Helper to determine W1_4_Category
function getW14Category(p, rank, isQB, isRB, isWR, isTE, isK, isDef) {
  if (isQB) {
    if (rank <= 35 || p.desc.toLowerCase().includes('rush') || p.desc.toLowerCase().includes('konami') || p.desc.toLowerCase().includes('dual-threat')) {
      return 'Konami/Dual-Threat QBs';
    }
    return 'High-Floor FLEX Anchors';
  }
  if (isWR) {
    if (rank <= 30 || p.desc.toLowerCase().includes('alpha') || p.desc.toLowerCase().includes('target') || p.desc.toLowerCase().includes('volume')) {
      return 'Alpha Target Monsters';
    }
    if (p.desc.toLowerCase().includes('slot') || p.desc.toLowerCase().includes('ppr') || p.desc.toLowerCase().includes('separation')) {
      return 'PPR Pass-Catching Specialists';
    }
    if (rank > 70) {
      return 'Late Target Value Sleepers';
    }
    return 'High-Floor FLEX Anchors';
  }
  if (isRB) {
    if (rank <= 25 || p.desc.toLowerCase().includes('bellcow') || p.desc.toLowerCase().includes('workhorse')) {
      return 'High-Floor FLEX Anchors';
    }
    if (p.desc.toLowerCase().includes('speed') || p.desc.toLowerCase().includes('receiving') || p.desc.toLowerCase().includes('pass')) {
      return 'PPR Pass-Catching Specialists';
    }
    if (rank > 70) {
      return 'Late Target Value Sleepers';
    }
    return 'High-Floor FLEX Anchors';
  }
  if (isTE) {
    if (rank <= 35 || p.desc.toLowerCase().includes('cheat code') || p.desc.toLowerCase().includes('target vacuum')) {
      return 'Alpha Target Monsters';
    }
    if (rank > 60) {
      return 'Late Target Value Sleepers';
    }
    return 'High-Floor FLEX Anchors';
  }
  if (isK || isDef) {
    return 'High-Floor FLEX Anchors';
  }
  return 'High-Floor FLEX Anchors';
}

// Generate calibrated 208 players
const final208Players = allCombined.map((p, idx) => {
  const offlineRank = idx + 1;
  const yahooAdp = p.yahoo;
  const sleeperAdp = p.sleeper;
  const isQB = p.pos === 'QB';
  const isRB = p.pos === 'RB';
  const isWR = p.pos === 'WR';
  const isTE = p.pos === 'TE';
  const isK = p.pos === 'K';
  const isDef = p.pos === 'DEF';

  // Points Over ADP (POADP) Surplus Score: Market ADP - Draft Rank
  const poadpSurplus = Number((yahooAdp - offlineRank).toFixed(1));

  // Brown Ballers Scoring Calibrations
  let seasonPts = 0;
  let w14AvgPPG = 0;

  if (isQB) {
    if (offlineRank <= 25) { // Top QBs (Allen, Lamar, Jayden, Hurts)
      seasonPts = 415 - (offlineRank - 17) * 9;
      w14AvgPPG = 26.5 - (offlineRank - 17) * 0.45;
    } else if (offlineRank <= 55) { // Tier 1/2 QBs (Mahomes, Burrow, Stroud, Kyler)
      seasonPts = 350 - (offlineRank - 45) * 4;
      w14AvgPPG = 22.8 - (offlineRank - 45) * 0.25;
    } else { // Tier 3/4 QBs
      seasonPts = 295 - (offlineRank - 60) * 1.8;
      w14AvgPPG = 18.5 - (offlineRank - 60) * 0.12;
    }
  } else if (isRB) {
    if (offlineRank <= 10) { // Top RBs (Bijan, Jeanty, Gibbs, Hall, Saquon)
      seasonPts = 345 - (offlineRank - 1) * 7.5;
      w14AvgPPG = 21.8 - (offlineRank - 1) * 0.45;
    } else if (offlineRank <= 35) { // RB1/2 borderline
      seasonPts = 275 - (offlineRank - 11) * 3.8;
      w14AvgPPG = 17.5 - (offlineRank - 11) * 0.22;
    } else if (offlineRank <= 80) { // Solid flex / RB2
      seasonPts = 205 - (offlineRank - 36) * 1.6;
      w14AvgPPG = 13.4 - (offlineRank - 36) * 0.09;
    } else { // Handcuffs / late depth
      seasonPts = 135 - (offlineRank - 81) * 0.9;
      w14AvgPPG = 9.2 - (offlineRank - 81) * 0.06;
    }
  } else if (isWR) {
    if (offlineRank <= 15) { // Alpha WRs (Chase, Lamb, JJ, MHJ, ARSB, Nico, Nabers, Odunze)
      seasonPts = 330 - (offlineRank - 2) * 6.8;
      w14AvgPPG = 21.0 - (offlineRank - 2) * 0.38;
    } else if (offlineRank <= 40) { // High WR2s / Strong Flex
      seasonPts = 250 - (offlineRank - 16) * 3.4;
      w14AvgPPG = 16.2 - (offlineRank - 16) * 0.20;
    } else if (offlineRank <= 80) { // Solid WR3 / 2-FLEX starters
      seasonPts = 195 - (offlineRank - 41) * 1.5;
      w14AvgPPG = 12.8 - (offlineRank - 41) * 0.08;
    } else { // Late dart throws / slot volume
      seasonPts = 135 - (offlineRank - 81) * 0.9;
      w14AvgPPG = 9.1 - (offlineRank - 81) * 0.06;
    }
  } else if (isTE) {
    if (offlineRank <= 20) { // Brock Bowers (Cheat Code)
      seasonPts = 265;
      w14AvgPPG = 16.5;
    } else if (offlineRank <= 50) { // McBride, LaPorta, Kittle, Andrews, Hockenson, Pitts
      seasonPts = 215 - (offlineRank - 28) * 2.2;
      w14AvgPPG = 13.8 - (offlineRank - 28) * 0.15;
    } else { // Mid-tier & late TEs
      seasonPts = 145 - (offlineRank - 51) * 1.0;
      w14AvgPPG = 9.5 - (offlineRank - 51) * 0.07;
    }
  } else if (isK) {
    seasonPts = 145 - (offlineRank - 177) * 1.8;
    w14AvgPPG = 9.2 - (offlineRank - 177) * 0.12;
  } else if (isDef) {
    seasonPts = 135 - (offlineRank - 193) * 1.9;
    w14AvgPPG = 8.8 - (offlineRank - 193) * 0.14;
  }

  seasonPts = Math.round(Math.max(60, seasonPts));
  w14AvgPPG = Number(Math.max(4.5, w14AvgPPG).toFixed(1));
  const w14TotalPts = Number((w14AvgPPG * 4).toFixed(1));

  const w14Cat = getW14Category(p, offlineRank, isQB, isRB, isWR, isTE, isK, isDef);

  let weeklyOpp = `${p.depth} starter role. `;
  if (isQB) weeklyOpp += `Expected 34+ pass attempts and dynamic red-zone goal-line option looks.`;
  else if (isRB) weeklyOpp += `18-22 high-value touches with primary red-zone rushing priority.`;
  else if (isWR) weeklyOpp += `8-10 targets per game with 35%+ intermediate/deep air-yard volume.`;
  else if (isTE) weeklyOpp += `6-8 targets concentrated in intermediate middle of the field and end-zone looks.`;
  else if (isK) weeklyOpp += `High-scoring offense creates 2-3 field goal attempts and 3+ extra points per game.`;
  else if (isDef) weeklyOpp += `Aggressive blitz schemes generate 3+ sacks and high turnover conversion.`;

  let dosAndDonts = `DO: Draft as key core piece for Brown Ballers scoring rules. DON'T: Overpay past market threshold.`;
  if (poadpSurplus >= 8) {
    dosAndDonts = `SMASH VALUE: Huge +${poadpSurplus} surplus over Yahoo ADP. Priority draft target.`;
  } else if (poadpSurplus <= -8) {
    dosAndDonts = `CAUTION: Drafting ahead of market ADP (${yahooAdp}). Only reach if you are anchoring positional scarcity.`;
  }

  return {
    Player_ID: 2026000 + offlineRank,
    Player_Name: p.name,
    Pos: p.pos,
    Team: p.team,
    Offline_Draft_Rank: offlineRank,
    Yahoo_ADP: yahooAdp,
    Sleeper_ADP: sleeperAdp,
    ECR_Rank: p.ecr || offlineRank,
    VORP: Number((seasonPts - 100).toFixed(1)),
    Volatility: (p.tier === 1 ? 'Low' : p.tier === 2 ? 'Medium' : 'High'),
    POADP_Points_Over_ADP: poadpSurplus,
    Proj_Fantasy_Pts_2026: seasonPts,
    W1_4_Proj_PPG: w14AvgPPG,
    W1_4_Proj_Total_Pts: w14TotalPts,
    Position_Tier: p.tier,
    W1_4_Category: w14Cat,
    Primary_Weekly_Opportunity: weeklyOpp,
    Dos_And_Donts: dosAndDonts,
    Notable_Description: p.desc,
    Sleeper_Tag: p.tag,
    Age: p.age,
    Proj_PPG_26: w14AvgPPG,
    Ceiling_PPG_26: Number((w14AvgPPG * 1.35).toFixed(1)),
    Floor_PPG_26: Number((w14AvgPPG * 0.72).toFixed(1))
  };
});

// Output code generation for src/data.ts
const defaultTeamsCode = `import { Player, TeamConfig, H2HRule } from './types';

export const defaultTeams: TeamConfig[] = [
  {
    "id": 1,
    "name": "Team 1 (Brown Baller 1)",
    "slot": 1,
    "isUser": false,
    "archetype": "Consensus ADP Follower",
    "colorTheme": "blue"
  },
  {
    "id": 2,
    "name": "Team 2 (Brown Baller 2)",
    "slot": 2,
    "isUser": false,
    "archetype": "Hero RB Anchor",
    "colorTheme": "indigo"
  },
  {
    "id": 3,
    "name": "Team 3 (Brown Baller 3)",
    "slot": 3,
    "isUser": false,
    "archetype": "Zero RB Wideout Heavy",
    "colorTheme": "emerald"
  },
  {
    "id": 4,
    "name": "Team 4 (Brown Baller 4)",
    "slot": 4,
    "isUser": false,
    "archetype": "Elite QB/TE Hunter",
    "colorTheme": "purple"
  },
  {
    "id": 5,
    "name": "Team 5 (Brown Baller 5)",
    "slot": 5,
    "isUser": false,
    "archetype": "Dual Workhorse RB",
    "colorTheme": "blue"
  },
  {
    "id": 6,
    "name": "Team 6 (Brown Baller 6)",
    "slot": 6,
    "isUser": false,
    "archetype": "Balanced Value Drafter",
    "colorTheme": "teal"
  },
  {
    "id": 7,
    "name": "Team 7 (Agent Chaplo)",
    "slot": 7,
    "isUser": true,
    "archetype": "BPA & VORP Maximizer",
    "colorTheme": "amber"
  },
  {
    "id": 8,
    "name": "Team 8 (Brown Baller 8)",
    "slot": 8,
    "isUser": false,
    "archetype": "Heavy Red-Zone Believer",
    "colorTheme": "amber"
  },
  {
    "id": 9,
    "name": "Team 9 (Brown Baller 9)",
    "slot": 9,
    "isUser": false,
    "archetype": "PPR Volume Stacker",
    "colorTheme": "cyan"
  },
  {
    "id": 10,
    "name": "Team 10 (Brown Baller 10)",
    "slot": 10,
    "isUser": false,
    "archetype": "Market ADP Follower",
    "colorTheme": "indigo"
  },
  {
    "id": 11,
    "name": "Team 11 (Brown Baller 11)",
    "slot": 11,
    "isUser": false,
    "archetype": "Robust RB & Trench",
    "colorTheme": "emerald"
  },
  {
    "id": 12,
    "name": "Team 12 (Brown Baller 12)",
    "slot": 12,
    "isUser": false,
    "archetype": "Turnover & Ceiling Seeker",
    "colorTheme": "purple"
  }
];

export const h2hRules: H2HRule[] = [
  {
    id: "h2h-1",
    title: "Alpha Target Monsters vs Ambiguous Committee Backs",
    category: "WR",
    winner: "Alpha Target Monster (8.5+ Tgts/G)",
    verdict: "Draft the Alpha WR (e.g. CeeDee / Chase / JJ / MHJ / Nabers) over committee RBs.",
    reasoning: "In 0.5 PPR, a 28%+ target share WR yields an unmatched weekly floor and ceiling compared to timeshare RBs with fluctuating touch counts."
  },
  {
    id: "h2h-2",
    title: "Hero RB Anchor vs Zero-RB Construction in Rounds 1-2",
    category: "RB",
    winner: "Hero RB Anchor (Bijan / Jeanty / Gibbs / Saquon)",
    verdict: "Lock in an elite dual-threat 3-down bellcow in Round 1 before the Tier 1 cliff.",
    reasoning: "Securing 22+ touches with goal-line monopoly eliminates running back volatility while giving you flexibility to hoard high-upside WRs in Rounds 3-7."
  },
  {
    id: "h2h-3",
    title: "Brock Bowers (Positional Cheat Code) vs High-End WR2",
    category: "TE",
    winner: "Brock Bowers (Tier 1 Positional Advantage)",
    verdict: "Draft Bowers at the 2.06 turn over standard WR2s.",
    reasoning: "Bowers functions as a de facto #1 wide receiver from the tight end slot, generating an insurmountable +6.5 PPG positional VORP edge over replacement TEs."
  },
  {
    id: "h2h-4",
    title: "Konami Dual-Threat QB vs Pocket Precision QB",
    category: "QB",
    winner: "Konami Dual-Threat (Josh Allen / Lamar / Jayden Daniels / Hurts)",
    verdict: "Prioritize QBs with 600+ rush yards and designed goal-line rushing equity.",
    reasoning: "Every rushing TD (6 pts) and 10 rushing yards (1 pt) equals 2.5x the fantasy value of passing production, providing an unshakeable 20-point weekly floor."
  },
  {
    id: "h2h-5",
    title: "2-FLEX Lineup Strategy: WR Target Depth vs Backup RBs",
    category: "FLEX",
    winner: "High-Target WRs (Ladd McConkey / Jayden Reed / Rashee Rice / Shakir)",
    verdict: "Fill both FLEX spots with high-volume WRs before drafting bench RBs.",
    reasoning: "In Brown Ballers leagues starting 2 FLEX spots (10 starters), WRs in the 100-130 target range offer far superior weekly baseline PPG than early-down committee RBs."
  },
  {
    id: "h2h-6",
    title: "Late-Round Streamers: Dome Kickers & Elite Pass Rushes",
    category: "FLEX",
    winner: "Dome Kickers (Fairbairn, Dicker, Aubrey) & High-Pressure DEF (SF, BAL, PIT)",
    verdict: "Wait until Rounds 14-15 and target weather-free kickers and top sack-rate defenses.",
    reasoning: "Do not waste early draft capital on K/DEF. Weather-controlled dome kickers provide reliable +9 PPG, while aggressive turnover defenses create weekly ceiling spikes."
  },
  {
    id: "h2h-7",
    title: "Pick #7 Anchor Strategy: Hero RB vs Elite Tier 1 WR & 2.06 Turn",
    category: "DRAFT_SLOT",
    winner: "Elite Hero Anchor (Breece Hall / Saquon / Bijan / MHJ)",
    verdict: "At Pick #7, anchor with an elite Tier 1 pillar, setting up Brock Bowers or Alpha WR at Pick 18 (2.06).",
    reasoning: "Draft Slot #7 gives you ideal draft leverage: 11 picks between Turn 1 and Turn 2 lets you exploit ADP fallers without suffering the 22-pick drought of the edges."
  }
];

export const raw208Players: Player[] = ${JSON.stringify(final208Players, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data.ts'), defaultTeamsCode);
console.log("Successfully generated cleaned 208-player dataset in src/data.ts!");
