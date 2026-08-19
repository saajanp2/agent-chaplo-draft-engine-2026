const fs = require('fs');
const path = require('path');

// 200 Offensive Skill Players (QBs, RBs, WRs, TEs)
const skillPlayers = [
  // 1-10
  { name: "Bijan Robinson", pos: "RB", team: "ATL", team25: "ATL", age: 24, depth: "RB1", tier: 1, tag: "Consensus RB1", rank: 1, yahoo: 1.8, sleeper: 1.5, ecr: 1.0, rz: 52, moved: false, desc: "Focal point of explosive Zac Robinson offense. 330+ touch ceiling with 75+ receptions and goal-line domination." },
  { name: "Ja'Marr Chase", pos: "WR", team: "CIN", team25: "CIN", age: 26, depth: "WR1", tier: 1, tag: "Triple Crown Threat", rank: 2, yahoo: 2.5, sleeper: 2.2, ecr: 2.0, rz: 26, moved: false, desc: "Unmatched target concentration and red-zone priority with Joe Burrow in peak prime." },
  { name: "CeeDee Lamb", pos: "WR", team: "DAL", team25: "DAL", age: 27, depth: "WR1", tier: 1, tag: "Volume Alpha", rank: 3, yahoo: 3.2, sleeper: 3.0, ecr: 3.0, rz: 24, moved: false, desc: "Guaranteed 165+ targets. Slot and boundary versatility creates weekly 30-point ceiling." },
  { name: "Justin Jefferson", pos: "WR", team: "MIN", team25: "MIN", age: 27, depth: "WR1", tier: 1, tag: "Elite Technician", rank: 4, yahoo: 4.1, sleeper: 4.5, ecr: 4.0, rz: 22, moved: false, desc: "Quarterback-proof route technician with 30%+ target share and immense air-yard floor." },
  { name: "Ashton Jeanty", pos: "RB", team: "DAL", team25: "BSU", age: 22, depth: "RB1", tier: 1, tag: "Rookie Bellcow", rank: 5, yahoo: 16.0, sleeper: 9.5, ecr: 7.0, rz: 44, moved: true, desc: "Immediate 3-down bellcow behind top offensive line. Elite tackle-breaking and receiving chops." },
  { name: "Jahmyr Gibbs", pos: "RB", team: "DET", team25: "DET", age: 24, depth: "RB1", tier: 1, tag: "Explosive Playmaker", rank: 6, yahoo: 6.8, sleeper: 5.8, ecr: 6.0, rz: 38, moved: false, desc: "Unbelievable efficiency on ground and through air behind league's premier run-blocking unit." },
  { name: "Breece Hall", pos: "RB", team: "NYJ", team25: "NYJ", age: 25, depth: "RB1", tier: 1, tag: "Dual-Threat Weapon", rank: 7, yahoo: 7.5, sleeper: 7.0, ecr: 7.0, rz: 40, moved: false, desc: "Workhorse backfield share with elite route participation and home-run open field speed." },
  { name: "Saquon Barkley", pos: "RB", team: "PHI", team25: "PHI", age: 29, depth: "RB1", tier: 1, tag: "Touchdown Monster", rank: 8, yahoo: 8.5, sleeper: 8.0, ecr: 8.0, rz: 46, moved: false, desc: "High-floor anchor in dynamic Eagles rushing attack with weekly multi-touchdown upside." },
  { name: "Marvin Harrison Jr.", pos: "WR", team: "ARI", team25: "ARI", age: 24, depth: "WR1", tier: 1, tag: "Year 3 Alpha", rank: 9, yahoo: 12.5, sleeper: 8.8, ecr: 9.0, rz: 22, moved: false, desc: "Ascending superstar WR with 40%+ air-yard dominance and locked-in red-zone targets." },
  { name: "Amon-Ra St. Brown", pos: "WR", team: "DET", team25: "DET", age: 26, depth: "WR1", tier: 1, tag: "PPR Engine", rank: 10, yahoo: 10.0, sleeper: 11.0, ecr: 10.0, rz: 20, moved: false, desc: "Most consistent first-down earner in football. 8+ receptions weekly baseline." },

  // 11-20
  { name: "Nico Collins", pos: "WR", team: "HOU", team25: "HOU", age: 27, depth: "WR1", tier: 1, tag: "YAC Dominator", rank: 11, yahoo: 14.0, sleeper: 13.0, ecr: 12.0, rz: 21, moved: false, desc: "Top-tier yards per route run metric. Lethal deep target and red-zone mismatch with C.J. Stroud." },
  { name: "Malik Nabers", pos: "WR", team: "NYG", team25: "NYG", age: 23, depth: "WR1", tier: 1, tag: "Target Vacuum", rank: 12, yahoo: 24.0, sleeper: 15.5, ecr: 13.0, rz: 18, moved: false, desc: "Absurd 32% target share. Improved QB play unlocks massive touchdown efficiency." },
  { name: "Rome Odunze", pos: "WR", team: "CHI", team25: "CHI", age: 24, depth: "WR1", tier: 1, tag: "Year 3 Breakout", rank: 13, yahoo: 34.0, sleeper: 21.0, ecr: 14.0, rz: 19, moved: false, desc: "Vacated volume clear WR1 in high-flying Ben Johnson attack. Massive market gap target." },
  { name: "Christian McCaffrey", pos: "RB", team: "SF", team25: "SF", age: 30, depth: "RB1", tier: 1, tag: "Elite Per-Game Legend", rank: 14, yahoo: 11.0, sleeper: 14.0, ecr: 13.0, rz: 35, moved: false, desc: "When active, unmatched fantasy PPG engine. Managed snaps offset by hyper-efficient high-leverage touches." },
  { name: "Puka Nacua", pos: "WR", team: "LAR", team25: "LAR", age: 25, depth: "WR1", tier: 1, tag: "Route Craftsman", rank: 15, yahoo: 15.0, sleeper: 16.0, ecr: 15.0, rz: 18, moved: false, desc: "Dominant middle-of-field target earner and chain-mover in Sean McVay scheme." },
  { name: "Brock Bowers", pos: "TE", team: "LV", team25: "LV", age: 23, depth: "TE1", tier: 1, tag: "Positional Cheat Code", rank: 16, yahoo: 25.0, sleeper: 19.0, ecr: 16.0, rz: 19, moved: false, desc: "Generational tight end used as de facto WR1. Massive VORP advantage over entire position." },
  { name: "Josh Allen", pos: "QB", team: "BUF", team25: "BUF", age: 30, depth: "QB1", tier: 1, tag: "QB1 Overall", rank: 17, yahoo: 22.0, sleeper: 20.0, ecr: 18.0, rz: 55, moved: false, desc: "Rushing touchdown machine with 15+ rushing TD capability alongside 4,000+ pass yards." },
  { name: "Lamar Jackson", pos: "QB", team: "BAL", team25: "BAL", age: 29, depth: "QB1", tier: 1, tag: "Dual-Threat MVP", rank: 18, yahoo: 23.0, sleeper: 22.0, ecr: 19.0, rz: 48, moved: false, desc: "Elite rushing yard floor and hyper-efficient passing metrics in Todd Monken system." },
  { name: "Jayden Daniels", pos: "QB", team: "WAS", team25: "WAS", age: 25, depth: "QB1", tier: 1, tag: "Konami Sensation", rank: 19, yahoo: 28.0, sleeper: 24.0, ecr: 20.0, rz: 42, moved: false, desc: "Electrifying dual-threat with pinpoint deep ball accuracy and dynamic read-option equity." },
  { name: "Kyren Williams", pos: "RB", team: "LAR", team25: "LAR", age: 26, depth: "RB1", tier: 1, tag: "Red Zone Fiend", rank: 20, yahoo: 19.0, sleeper: 21.0, ecr: 20.0, rz: 45, moved: false, desc: "Monopolizes goal-line carries in elite rushing scheme with high weekly touchdown probability." },

  // 21-30
  { name: "Jonathan Taylor", pos: "RB", team: "IND", team25: "IND", age: 27, depth: "RB1", tier: 1, tag: "Pure Runner", rank: 21, yahoo: 20.0, sleeper: 23.0, ecr: 21.0, rz: 38, moved: false, desc: "Dominant ground force benefiting from light boxes created by Anthony Richardson option threat." },
  { name: "A.J. Brown", pos: "WR", team: "PHI", team25: "PHI", age: 29, depth: "WR1", tier: 1, tag: "Physical Monster", rank: 22, yahoo: 21.0, sleeper: 25.0, ecr: 22.0, rz: 19, moved: false, desc: "Elite target efficiency and game-breaking YAC ability on intermediate crossers and go-routes." },
  { name: "Garrett Wilson", pos: "WR", team: "NYJ", team25: "NYJ", age: 26, depth: "WR1", tier: 1, tag: "Target Magnet", rank: 23, yahoo: 26.0, sleeper: 26.0, ecr: 23.0, rz: 17, moved: false, desc: "Elite separation skills and 28% target share baseline ready for peak scoring explosion." },
  { name: "Drake London", pos: "WR", team: "ATL", team25: "ATL", age: 25, depth: "WR1", tier: 1, tag: "Contested Catch King", rank: 24, yahoo: 27.0, sleeper: 27.0, ecr: 24.0, rz: 21, moved: false, desc: "Alpha target volume in rhythm passing attack with outstanding red-zone conversion rate." },
  { name: "De'Von Achane", pos: "RB", team: "MIA", team25: "MIA", age: 24, depth: "RB1", tier: 1, tag: "Home Run Hitter", rank: 25, yahoo: 29.0, sleeper: 28.0, ecr: 25.0, rz: 28, moved: false, desc: "Historic per-touch efficiency and heavy receiving involvement in Mike McDaniel space scheme." },
  { name: "Kenneth Walker III", pos: "RB", team: "SEA", team25: "SEA", age: 25, depth: "RB1", tier: 2, tag: "Explosive Workhorse", rank: 26, yahoo: 32.0, sleeper: 30.0, ecr: 28.0, rz: 36, moved: false, desc: "Dynamic playmaker with tackle-evading dominance in Ryan Grubb spread rushing offense." },
  { name: "Brian Thomas Jr.", pos: "WR", team: "JAX", team25: "JAX", age: 23, depth: "WR1", tier: 2, tag: "Deep Threat Alpha", rank: 27, yahoo: 36.0, sleeper: 29.0, ecr: 27.0, rz: 16, moved: false, desc: "Rare size-speed combination with soaring air-yard metrics and primary red-zone role." },
  { name: "Trey McBride", pos: "TE", team: "ARI", team25: "ARI", age: 26, depth: "TE1", tier: 1, tag: "Target Vacuum TE", rank: 28, yahoo: 35.0, sleeper: 32.0, ecr: 29.0, rz: 18, moved: false, desc: "25%+ target share tight end with massive reception volume and chain-moving reliability." },
  { name: "Josh Jacobs", pos: "RB", team: "GB", team25: "GB", age: 28, depth: "RB1", tier: 2, tag: "Heavy Volume Anchor", rank: 29, yahoo: 30.0, sleeper: 34.0, ecr: 30.0, rz: 42, moved: false, desc: "Clear goal-line and short-yardage hammer in Matt LaFleur top-tier scoring offense." },
  { name: "Jalen Hurts", pos: "QB", team: "PHI", team25: "PHI", age: 28, depth: "QB1", tier: 1, tag: "Tush Push Legend", rank: 30, yahoo: 31.0, sleeper: 33.0, ecr: 31.0, rz: 50, moved: false, desc: "Virtually guaranteed double-digit rushing touchdowns with elite surrounding receiving corps." },

  // 31-40
  { name: "James Cook", pos: "RB", team: "BUF", team25: "BUF", age: 26, depth: "RB1", tier: 2, tag: "Dual-Threat Spark", rank: 31, yahoo: 38.0, sleeper: 35.0, ecr: 33.0, rz: 32, moved: false, desc: "Explosive dual-threat back with expanded passing game role in Josh Allen led offense." },
  { name: "Tetairoa McMillan", pos: "WR", team: "NE", team25: "ARIZ", age: 22, depth: "WR1", tier: 2, tag: "Rookie X-Receiver", rank: 32, yahoo: 55.0, sleeper: 38.0, ecr: 35.0, rz: 16, moved: true, desc: "Towering 6'5 alpha target with supreme ball skills stepping directly into primary receiver role." },
  { name: "Sam LaPorta", pos: "TE", team: "DET", team25: "DET", age: 25, depth: "TE1", tier: 1, tag: "Red Zone Target", rank: 33, yahoo: 39.0, sleeper: 37.0, ecr: 34.0, rz: 20, moved: false, desc: "High-scoring offense centerpiece with outstanding red-zone touchdown conversion rate." },
  { name: "Tee Higgins", pos: "WR", team: "CIN", team25: "CIN", age: 27, depth: "WR2", tier: 2, tag: "Elite 1B Receiver", rank: 34, yahoo: 40.0, sleeper: 41.0, ecr: 36.0, rz: 15, moved: false, desc: "WR1 upside whenever Chase is bracketed. Elite boundary catch radius in potent passing attack." },
  { name: "Derrick Henry", pos: "RB", team: "BAL", team25: "BAL", age: 32, depth: "RB1", tier: 2, tag: "Goal Line Juggernaut", rank: 35, yahoo: 33.0, sleeper: 42.0, ecr: 38.0, rz: 46, moved: false, desc: "Unstoppable red-zone force in Baltimore heavy-personnel scheme with 12+ touchdown baseline." },
  { name: "Ladd McConkey", pos: "WR", team: "LAC", team25: "LAC", age: 24, depth: "WR1", tier: 2, tag: "Separation Wizard", rank: 36, yahoo: 45.0, sleeper: 39.0, ecr: 37.0, rz: 14, moved: false, desc: "Justin Herbert's favorite target. Elite separator against man and zone coverage from the slot." },
  { name: "Chuba Hubbard", pos: "RB", team: "CAR", team25: "CAR", age: 27, depth: "RB1", tier: 2, tag: "Workhorse Volume", rank: 37, yahoo: 46.0, sleeper: 44.0, ecr: 40.0, rz: 34, moved: false, desc: "Locked-in backfield touches and three-down work in ascending Dave Canales rushing scheme." },
  { name: "George Kittle", pos: "TE", team: "SF", team25: "SF", age: 32, depth: "TE1", tier: 1, tag: "YAC Behemoth", rank: 38, yahoo: 48.0, sleeper: 46.0, ecr: 42.0, rz: 16, moved: false, desc: "Devastating after the catch with spike-week multi-touchdown upside in Shanahan system." },
  { name: "Travis Hunter", pos: "WR", team: "DEN", team25: "COLO", age: 23, depth: "WR1", tier: 2, tag: "Two-Way Marvel", rank: 39, yahoo: 62.0, sleeper: 45.0, ecr: 41.0, rz: 14, moved: true, desc: "Electric dynamic threat with supreme route nuance and immediate featured target share." },
  { name: "Chase Brown", pos: "RB", team: "CIN", team25: "CIN", age: 26, depth: "RB1", tier: 2, tag: "Speed Bellcow", rank: 40, yahoo: 44.0, sleeper: 43.0, ecr: 39.0, rz: 30, moved: false, desc: "Home-run speed in high-scoring offense with high-volume receiving involvement." },

  // 41-50
  { name: "Patrick Mahomes", pos: "QB", team: "KC", team25: "KC", age: 30, depth: "QB1", tier: 1, tag: "Passing Genius", rank: 41, yahoo: 41.0, sleeper: 47.0, ecr: 43.0, rz: 35, moved: false, desc: "4,500+ yard ceiling with revamped deep weapons and elite red-zone touchdown efficiency." },
  { name: "Joe Burrow", pos: "QB", team: "CIN", team25: "CIN", age: 29, depth: "QB1", tier: 1, tag: "Pass Volume King", rank: 42, yahoo: 43.0, sleeper: 48.0, ecr: 44.0, rz: 30, moved: false, desc: "High-volume precision passer with top-tier receiver duo yielding huge weekly totals." },
  { name: "C.J. Stroud", pos: "QB", team: "HOU", team25: "HOU", age: 24, depth: "QB1", tier: 1, tag: "Deep Ball Maestro", rank: 43, yahoo: 49.0, sleeper: 50.0, ecr: 45.0, rz: 28, moved: false, desc: "Surgically accurate pocket passer with elite supporting cast and 35+ touchdown ceiling." },
  { name: "Kyler Murray", pos: "QB", team: "ARI", team25: "ARI", age: 29, depth: "QB1", tier: 1, tag: "Rushing Weapon", rank: 44, yahoo: 52.0, sleeper: 51.0, ecr: 46.0, rz: 38, moved: false, desc: "Elite rushing baseline paired with Marvin Harrison Jr. & Trey McBride connection." },
  { name: "Kyle Pitts", pos: "TE", team: "ATL", team25: "ATL", age: 25, depth: "TE1", tier: 2, tag: "Athletic Freak", rank: 45, yahoo: 68.0, sleeper: 56.0, ecr: 48.0, rz: 15, moved: false, desc: "Operates as mismatch X-receiver in Zac Robinson scheme with high ceiling outcomes." },
  { name: "Luther Burden III", pos: "WR", team: "CAR", team25: "MIZZ", age: 22, depth: "WR1", tier: 2, tag: "YAC Rocket", rank: 46, yahoo: 72.0, sleeper: 54.0, ecr: 49.0, rz: 15, moved: true, desc: "Dynamic Deebo Samuel archetype weapon stepping in as Bryce Young's top playmaker." },
  { name: "Davante Adams", pos: "WR", team: "NYJ", team25: "NYJ", age: 33, depth: "WR2", tier: 2, tag: "Red Zone Maestro", rank: 47, yahoo: 42.0, sleeper: 52.0, ecr: 47.0, rz: 20, moved: false, desc: "Hall-of-fame route technician commanding elite red-zone target volume." },
  { name: "Devon Achane", pos: "RB", team: "MIA", team25: "MIA", age: 24, depth: "RB1", tier: 2, tag: "Space Creator", rank: 48, yahoo: 37.0, sleeper: 36.0, ecr: 32.0, rz: 25, moved: false, desc: "Lighting in a bottle with huge fantasy points per opportunity and receiving floor." },
  { name: "Jaylen Waddle", pos: "WR", team: "MIA", team25: "MIA", age: 27, depth: "WR2", tier: 2, tag: "Speed Demolisher", rank: 49, yahoo: 50.0, sleeper: 53.0, ecr: 50.0, rz: 14, moved: false, desc: "Lethal open-field speed in motion-heavy offense with 1,200+ yard ceiling." },
  { name: "Bucky Irving", pos: "RB", team: "TB", team25: "TB", age: 24, depth: "RB1", tier: 2, tag: "Contact Balance Star", rank: 50, yahoo: 54.0, sleeper: 49.0, ecr: 51.0, rz: 32, moved: false, desc: "Outstanding missed tackles forced per attempt and dominant second-half rushing role." },

  // 51-60
  { name: "Zay Flowers", pos: "WR", team: "BAL", team25: "BAL", age: 25, depth: "WR1", tier: 2, tag: "Space Weapon", rank: 51, yahoo: 53.0, sleeper: 55.0, ecr: 52.0, rz: 15, moved: false, desc: "Primary target earner in Baltimore with explosive manufactured touch upside." },
  { name: "TreVeyon Henderson", pos: "RB", team: "LAC", team25: "OSU", age: 23, depth: "RB1", tier: 2, tag: "Rookie Slasher", rank: 52, yahoo: 70.0, sleeper: 57.0, ecr: 53.0, rz: 34, moved: true, desc: "Greg Roman bellcow fit with elite speed to turn any interior carry into an 80-yard score." },
  { name: "Xavier Worthy", pos: "WR", team: "KC", team25: "KC", age: 23, depth: "WR1", tier: 2, tag: "4.21 Speed Demon", rank: 53, yahoo: 56.0, sleeper: 58.0, ecr: 54.0, rz: 16, moved: false, desc: "Expanded Year 3 route tree paired with Mahomes' deep arm creates huge weekly ceiling." },
  { name: "Anthony Richardson", pos: "QB", team: "IND", team25: "IND", age: 24, depth: "QB1", tier: 1, tag: "Ultimate Ceiling QB", rank: 54, yahoo: 57.0, sleeper: 59.0, ecr: 55.0, rz: 45, moved: false, desc: "Historic athletic profile with 800+ rushing yard and 12+ rushing touchdown upside." },
  { name: "Quinshon Judkins", pos: "RB", team: "NYG", team25: "OSU", age: 22, depth: "RB1", tier: 2, tag: "Power Workhorse", rank: 55, yahoo: 75.0, sleeper: 60.0, ecr: 56.0, rz: 36, moved: true, desc: "Punishing inside runner with immediate early-down and goal-line monopoly in NY." },
  { name: "Jaxson Dart", pos: "QB", team: "NYG", team25: "MISS", age: 23, depth: "QB1", tier: 2, tag: "Konami Rookie", rank: 56, yahoo: 160.0, sleeper: 120.0, ecr: 88.0, rz: 36, moved: true, desc: "Huge rushing floor and aggressive downfield passer in Brian Daboll spread system." },
  { name: "Deebo Samuel", pos: "WR", team: "SF", team25: "SF", age: 30, depth: "WR2", tier: 2, tag: "Offensive Weapon", rank: 57, yahoo: 58.0, sleeper: 61.0, ecr: 57.0, rz: 22, moved: false, desc: "Unique hybrid role commanding designed handoffs and high-leverage red zone targets." },
  { name: "David Montgomery", pos: "RB", team: "DET", team25: "DET", age: 29, depth: "RB2", tier: 2, tag: "Touchdown Hammer", rank: 58, yahoo: 59.0, sleeper: 63.0, ecr: 58.0, rz: 40, moved: false, desc: "Locked-in goal-line priority behind elite Lions offensive front." },
  { name: "Jaxon Smith-Njigba", pos: "WR", team: "SEA", team25: "SEA", age: 24, depth: "WR2", tier: 2, tag: "Slot Machine", rank: 59, yahoo: 60.0, sleeper: 62.0, ecr: 59.0, rz: 14, moved: false, desc: "High-volume slot receiver with top-tier separation metrics on 3rd down and red zone." },
  { name: "James Conner", pos: "RB", team: "ARI", team25: "ARI", age: 31, depth: "RB1", tier: 2, tag: "Goal Line Anchor", rank: 60, yahoo: 61.0, sleeper: 65.0, ecr: 60.0, rz: 35, moved: false, desc: "Consistently out-produces ADP with heavy volume and locked-in red zone carries." },

  // 61-70
  { name: "Caleb Williams", pos: "QB", team: "CHI", team25: "CHI", age: 24, depth: "QB1", tier: 2, tag: "Year 3 Ascent", rank: 61, yahoo: 65.0, sleeper: 66.0, ecr: 61.0, rz: 28, moved: false, desc: "Sensational off-platform creator in Ben Johnson scheme with Odunze & elite targets." },
  { name: "Jordan Love", pos: "QB", team: "GB", team25: "GB", age: 27, depth: "QB1", tier: 2, tag: "Touchdown Slinger", rank: 62, yahoo: 66.0, sleeper: 67.0, ecr: 62.0, rz: 26, moved: false, desc: "High touchdown rate passer leading one of NFL's most balanced scoring offenses." },
  { name: "Colston Loveland", pos: "TE", team: "CHI", team25: "MICH", age: 22, depth: "TE1", tier: 2, tag: "Rookie Weapon TE", rank: 63, yahoo: 95.0, sleeper: 74.0, ecr: 68.0, rz: 15, moved: true, desc: "Elite move tight end with wide receiver movement skills in Ben Johnson TE-heavy concepts." },
  { name: "D'Andre Swift", pos: "RB", team: "CHI", team25: "CHI", age: 27, depth: "RB1", tier: 3, tag: "Space Back", rank: 64, yahoo: 67.0, sleeper: 68.0, ecr: 64.0, rz: 26, moved: false, desc: "Dynamic receiving threat in Ben Johnson multiple backfield attack." },
  { name: "DK Metcalf", pos: "WR", team: "SEA", team25: "SEA", age: 28, depth: "WR1", tier: 2, tag: "End Zone Alpha", rank: 65, yahoo: 63.0, sleeper: 64.0, ecr: 63.0, rz: 18, moved: false, desc: "Elite boundary jump-ball winner with 10+ touchdown capability every year." },
  { name: "Tony Pollard", pos: "RB", team: "TEN", team25: "TEN", age: 29, depth: "RB1", tier: 3, tag: "Dual Workhorse", rank: 66, yahoo: 69.0, sleeper: 70.0, ecr: 66.0, rz: 28, moved: false, desc: "Heavy touch volume backfield leader with consistent receiving involvement." },
  { name: "Bo Nix", pos: "QB", team: "DEN", team25: "DEN", age: 26, depth: "QB1", tier: 2, tag: "Rushing Floor QB", rank: 67, yahoo: 78.0, sleeper: 72.0, ecr: 67.0, rz: 34, moved: false, desc: "Underrated dual-threat in Sean Payton offense with 500+ rushing yard floor." },
  { name: "George Pickens", pos: "WR", team: "PIT", team25: "PIT", age: 25, depth: "WR1", tier: 2, tag: "Contested Catch Star", rank: 68, yahoo: 64.0, sleeper: 69.0, ecr: 65.0, rz: 16, moved: false, desc: "Absurd contested catch ability and massive air-yard share on deep targets." },
  { name: "Tyler Warren", pos: "TE", team: "DEN", team25: "PSU", age: 23, depth: "TE1", tier: 2, tag: "Versatile Move TE", rank: 69, yahoo: 105.0, sleeper: 80.0, ecr: 72.0, rz: 14, moved: true, desc: "Sean Payton dream weapon used all over formation from inline to wildcat QB." },
  { name: "Isiah Pacheco", pos: "RB", team: "KC", team25: "KC", age: 27, depth: "RB1", tier: 3, tag: "Angry Runner", rank: 70, yahoo: 71.0, sleeper: 73.0, ecr: 70.0, rz: 32, moved: false, desc: "High-intensity ground game leader in potent Patrick Mahomes led offense." },

  // 71-80
  { name: "Drake Maye", pos: "QB", team: "NE", team25: "NE", age: 24, depth: "QB1", tier: 2, tag: "Big Arm Dual Threat", rank: 71, yahoo: 85.0, sleeper: 75.0, ecr: 71.0, rz: 32, moved: false, desc: "Ascending franchise QB with prototype size, big arm, and prolific scramble yards." },
  { name: "Brian Robinson Jr.", pos: "RB", team: "WAS", team25: "WAS", age: 27, depth: "RB1", tier: 3, tag: "Power Closer", rank: 72, yahoo: 73.0, sleeper: 76.0, ecr: 73.0, rz: 34, moved: false, desc: "Red-zone hammer in high-scoring Jayden Daniels led Washington offensive attack." },
  { name: "Evan Engram", pos: "TE", team: "JAX", team25: "JAX", age: 31, depth: "TE1", tier: 2, tag: "PPR Volume TE", rank: 73, yahoo: 74.0, sleeper: 77.0, ecr: 74.0, rz: 14, moved: false, desc: "Target hog over middle of field with 90+ reception baseline in Liam Coen offense." },
  { name: "Ollie Gordon II", pos: "RB", team: "MIA", team25: "OKST", age: 22, depth: "RB2", tier: 3, tag: "Big Play Rookie", rank: 74, yahoo: 110.0, sleeper: 82.0, ecr: 75.0, rz: 28, moved: true, desc: "Size-speed prototype back adding physical interior element to Dolphins speed offense." },
  { name: "Terry McLaurin", pos: "WR", team: "WAS", team25: "WAS", age: 30, depth: "WR1", tier: 3, tag: "Downfield Ace", rank: 75, yahoo: 76.0, sleeper: 78.0, ecr: 76.0, rz: 14, moved: false, desc: "Deep threat chemistry with Jayden Daniels yielding high-efficiency splash plays." },
  { name: "Travis Etienne Jr.", pos: "RB", team: "JAX", team25: "JAX", age: 27, depth: "RB1", tier: 3, tag: "Space Slasher", rank: 76, yahoo: 77.0, sleeper: 79.0, ecr: 77.0, rz: 28, moved: false, desc: "Versatile backfield threat with breakaway speed and passing down prowess." },
  { name: "Cooper Kupp", pos: "WR", team: "LAR", team25: "LAR", age: 33, depth: "WR2", tier: 3, tag: "Veteran Slot Master", rank: 77, yahoo: 72.0, sleeper: 81.0, ecr: 78.0, rz: 16, moved: false, desc: "Masterful red-zone route runner with exceptional chemistry with Matthew Stafford." },
  { name: "David Njoku", pos: "TE", team: "CLE", team25: "CLE", age: 30, depth: "TE1", tier: 2, tag: "YAC Monster", rank: 78, yahoo: 80.0, sleeper: 83.0, ecr: 79.0, rz: 15, moved: false, desc: "Dominant tight end in broken play creation and screen pass YAC volume." },
  { name: "Cam Ward", pos: "QB", team: "TEN", team25: "MIA", age: 24, depth: "QB1", tier: 2, tag: "Rookie Gunslinger", rank: 79, yahoo: 140.0, sleeper: 95.0, ecr: 82.0, rz: 28, moved: true, desc: "Creative pocket escape artist with aggressive gunslinger mentality and rushing juice." },
  { name: "Chris Godwin", pos: "WR", team: "TB", team25: "TB", age: 30, depth: "WR2", tier: 3, tag: "Slot Anchor", rank: 80, yahoo: 81.0, sleeper: 84.0, ecr: 80.0, rz: 14, moved: false, desc: "High-floor slot technician with 100+ target volume projection from Baker Mayfield." },

  // 81-90
  { name: "Rhamondre Stevenson", pos: "RB", team: "NE", team25: "NE", age: 28, depth: "RB1", tier: 3, tag: "Physical Anchor", rank: 81, yahoo: 82.0, sleeper: 85.0, ecr: 81.0, rz: 28, moved: false, desc: "Early-down volume anchor benefiting from Alex Van Pelt power running schemes." },
  { name: "Tank Dell", pos: "WR", team: "HOU", team25: "HOU", age: 26, depth: "WR2", tier: 3, tag: "Explosive Spark", rank: 82, yahoo: 83.0, sleeper: 86.0, ecr: 83.0, rz: 12, moved: false, desc: "Devastating route twitch with home-run ability on every single touch." },
  { name: "Baker Mayfield", pos: "QB", team: "TB", team25: "TB", age: 31, depth: "QB1", tier: 2, tag: "Gunslinger Value", rank: 83, yahoo: 92.0, sleeper: 88.0, ecr: 84.0, rz: 26, moved: false, desc: "Proven 4,000+ yard and 30+ TD ceiling in Liam Coen high-octane passing offense." },
  { name: "Stefon Diggs", pos: "WR", team: "HOU", team25: "HOU", age: 32, depth: "WR3", tier: 3, tag: "Route Veteran", rank: 84, yahoo: 79.0, sleeper: 89.0, ecr: 85.0, rz: 14, moved: false, desc: "Surgical separator on 3rd downs and red-zone intermediate crossing routes." },
  { name: "Dallas Goedert", pos: "TE", team: "PHI", team25: "PHI", age: 31, depth: "TE1", tier: 3, tag: "Efficient Seam TE", rank: 85, yahoo: 88.0, sleeper: 91.0, ecr: 86.0, rz: 13, moved: false, desc: "High yards-per-target tight end in elite scoring offense with consistent floor." },
  { name: "Jaylen Warren", pos: "RB", team: "PIT", team25: "PIT", age: 27, depth: "RB1", tier: 3, tag: "PPR Slasher", rank: 86, yahoo: 87.0, sleeper: 90.0, ecr: 87.0, rz: 22, moved: false, desc: "Elite missed tackle rate and high passing down target share in Arthur Smith offense." },
  { name: "Courtland Sutton", pos: "WR", team: "DEN", team25: "DEN", age: 30, depth: "WR2", tier: 3, tag: "Touchdown Specialist", rank: 87, yahoo: 89.0, sleeper: 92.0, ecr: 89.0, rz: 16, moved: false, desc: "Red-zone weapon with elite jump-ball box-out technique on perimeter fades." },
  { name: "Najee Harris", pos: "RB", team: "PIT", team25: "PIT", age: 28, depth: "RB2", tier: 3, tag: "Goal Line Hammer", rank: 88, yahoo: 86.0, sleeper: 93.0, ecr: 90.0, rz: 30, moved: false, desc: "Physical interior runner with secured goal-line touches in run-first attack." },
  { name: "Keon Coleman", pos: "WR", team: "BUF", team25: "BUF", age: 23, depth: "WR1", tier: 3, tag: "Red Zone Jump Ball", rank: 89, yahoo: 96.0, sleeper: 94.0, ecr: 91.0, rz: 15, moved: false, desc: "Josh Allen's top contested-catch weapon on boundary fades and end-zone looks." },
  { name: "Jake Ferguson", pos: "TE", team: "DAL", team25: "DAL", age: 27, depth: "TE1", tier: 3, tag: "Red Zone Target TE", rank: 90, yahoo: 90.0, sleeper: 96.0, ecr: 92.0, rz: 16, moved: false, desc: "Dak Prescott's trusted second option in pass-heavy Dallas offensive attack." },

  // 91-100
  { name: "Justin Fields", pos: "QB", team: "PIT", team25: "PIT", age: 27, depth: "QB1", tier: 2, tag: "Konami Cheat Code", rank: 91, yahoo: 102.0, sleeper: 97.0, ecr: 93.0, rz: 40, moved: false, desc: "Top 3 rushing QB ceiling with Arthur Smith designed QB power and zone read volume." },
  { name: "Nicholas Singleton", pos: "RB", team: "CLE", team25: "PSU", age: 22, depth: "RB1", tier: 3, tag: "Rookie Speedster", rank: 92, yahoo: 125.0, sleeper: 98.0, ecr: 94.0, rz: 24, moved: true, desc: "Home run threat with 4.38 speed stepping into Kevin Stefanski outside zone scheme." },
  { name: "Trevor Lawrence", pos: "QB", team: "JAX", team25: "JAX", age: 26, depth: "QB1", tier: 3, tag: "Post-Hype Value", rank: 93, yahoo: 98.0, sleeper: 99.0, ecr: 95.0, rz: 24, moved: false, desc: "Underpriced franchise QB with Brian Thomas Jr. and improved pass protection." },
  { name: "DeMario Douglas", pos: "WR", team: "NE", team25: "NE", age: 25, depth: "WR2", tier: 3, tag: "Slot Target Hog", rank: 94, yahoo: 112.0, sleeper: 101.0, ecr: 96.0, rz: 11, moved: false, desc: "High-percentage route separator commanding heavy target share on early downs." },
  { name: "Javonte Williams", pos: "RB", team: "DEN", team25: "DEN", age: 26, depth: "RB1", tier: 3, tag: "Tackle Breaker", rank: 95, yahoo: 94.0, sleeper: 102.0, ecr: 97.0, rz: 26, moved: false, desc: "Power runner with renewed explosiveness in Sean Payton multi-faceted rushing system." },
  { name: "Quinn Ewers", pos: "QB", team: "LV", team25: "TEX", age: 23, depth: "QB1", tier: 3, tag: "Rookie Arm Talent", rank: 96, yahoo: 165.0, sleeper: 115.0, ecr: 105.0, rz: 20, moved: true, desc: "Natural arm talent with Brock Bowers and ascending weapons in Las Vegas." },
  { name: "Jordan Addison", pos: "WR", team: "MIN", team25: "MIN", age: 24, depth: "WR2", tier: 3, tag: "End Zone Craftsman", rank: 97, yahoo: 97.0, sleeper: 104.0, ecr: 98.0, rz: 13, moved: false, desc: "Smooth route runner with high-end touchdown conversion rate opposite Justin Jefferson." },
  { name: "Rico Dowdle", pos: "RB", team: "DAL", team25: "DAL", age: 28, depth: "RB2", tier: 4, tag: "Change of Pace", rank: 98, yahoo: 104.0, sleeper: 106.0, ecr: 100.0, rz: 22, moved: false, desc: "High-efficiency supplementary back in explosive Dallas offensive environment." },
  { name: "Christian Kirk", pos: "WR", team: "JAX", team25: "JAX", age: 29, depth: "WR2", tier: 3, tag: "Slot Chain Mover", rank: 99, yahoo: 101.0, sleeper: 107.0, ecr: 101.0, rz: 12, moved: false, desc: "Reliable intermediate weapon with consistent 6-8 target floor from Trevor Lawrence." },
  { name: "Tucker Kraft", pos: "TE", team: "GB", team25: "GB", age: 25, depth: "TE1", tier: 3, tag: "YAC Tight End", rank: 100, yahoo: 108.0, sleeper: 105.0, ecr: 102.0, rz: 14, moved: false, desc: "Fierce YAC monster taking over primary tight end role in Matt LaFleur offense." },

  // 101-110
  { name: "Rashod Bateman", pos: "WR", team: "BAL", team25: "BAL", age: 26, depth: "WR2", tier: 4, tag: "Boundary Separator", rank: 101, yahoo: 115.0, sleeper: 110.0, ecr: 104.0, rz: 10, moved: false, desc: "Underrated separation metrics on boundary routes in efficient Lamar Jackson scheme." },
  { name: "Jerome Ford", pos: "RB", team: "CLE", team25: "CLE", age: 26, depth: "RB2", tier: 4, tag: "Big Play Back", rank: 102, yahoo: 106.0, sleeper: 112.0, ecr: 106.0, rz: 20, moved: false, desc: "Explosive pass-catching back with home-run speed on perimeter runs." },
  { name: "Ricky Pearsall", pos: "WR", team: "SF", team25: "SF", age: 25, depth: "WR3", tier: 4, tag: "Year 3 Ascent", rank: 103, yahoo: 120.0, sleeper: 111.0, ecr: 107.0, rz: 11, moved: false, desc: "Elite hands and route nuance stepping into expanded role in Shanahan offense." },
  { name: "Jonathon Brooks", pos: "RB", team: "CAR", team25: "CAR", age: 23, depth: "RB2", tier: 4, tag: "Talented Slasher", rank: 104, yahoo: 114.0, sleeper: 113.0, ecr: 108.0, rz: 22, moved: false, desc: "Dynamic backfield talent ready for expanded share alongside Chuba Hubbard." },
  { name: "Jared Goff", pos: "QB", team: "DET", team25: "DET", age: 31, depth: "QB1", tier: 3, tag: "Dome Master", rank: 105, yahoo: 105.0, sleeper: 114.0, ecr: 109.0, rz: 22, moved: false, desc: "Elite pocket passer playing majority of games in weather-controlled dome environments." },
  { name: "Josh Downs", pos: "WR", team: "IND", team25: "IND", age: 25, depth: "WR2", tier: 4, tag: "Slot Spark", rank: 106, yahoo: 118.0, sleeper: 116.0, ecr: 110.0, rz: 10, moved: false, desc: "Quick-twitch slot weapon with high target rate per route run metric." },
  { name: "Zack Moss", pos: "RB", team: "CIN", team25: "CIN", age: 28, depth: "RB2", tier: 4, tag: "Goal Line Back", rank: 107, yahoo: 110.0, sleeper: 118.0, ecr: 111.0, rz: 25, moved: false, desc: "Reliable short-yardage and goal-line contributor in potent Cincinnati offense." },
  { name: "Adonai Mitchell", pos: "WR", team: "IND", team25: "IND", age: 23, depth: "WR3", tier: 4, tag: "Downfield Threat", rank: 108, yahoo: 128.0, sleeper: 117.0, ecr: 112.0, rz: 11, moved: false, desc: "Freakish athletic profile with massive separation scores on deep vertical routes." },
  { name: "Taysom Hill", pos: "TE", team: "NO", team25: "NO", age: 36, depth: "TE2", tier: 3, tag: "Goal Line Cheat", rank: 109, yahoo: 122.0, sleeper: 121.0, ecr: 114.0, rz: 30, moved: false, desc: "Direct-snap quarterback running plays near goal line provide weekly multi-TD upside." },
  { name: "Ray Davis", pos: "RB", team: "BUF", team25: "BUF", age: 26, depth: "RB2", tier: 4, tag: "Physical Complement", rank: 110, yahoo: 124.0, sleeper: 122.0, ecr: 115.0, rz: 22, moved: false, desc: "Physical inside runner handling short-yardage dirty work behind James Cook." },

  // 111-120
  { name: "Matthew Stafford", pos: "QB", team: "LAR", team25: "LAR", age: 38, depth: "QB1", tier: 3, tag: "No-Look Slinger", rank: 111, yahoo: 116.0, sleeper: 125.0, ecr: 116.0, rz: 20, moved: false, desc: "Masterful distributor feeding Puka Nacua and Cooper Kupp with high TD ceiling." },
  { name: "Wan'Dale Robinson", pos: "WR", team: "NYG", team25: "NYG", age: 25, depth: "WR2", tier: 4, tag: "PPR Machine", rank: 112, yahoo: 126.0, sleeper: 124.0, ecr: 117.0, rz: 9, moved: false, desc: "Short-area PPR vacuum commanding 7+ targets per game underneath Malik Nabers." },
  { name: "Tyjae Spears", pos: "RB", team: "TEN", team25: "TEN", age: 25, depth: "RB2", tier: 4, tag: "Agility Weapon", rank: 113, yahoo: 119.0, sleeper: 126.0, ecr: 118.0, rz: 18, moved: false, desc: "Electric change-of-direction back with high receiving floor in space." },
  { name: "Demarcus Robinson", pos: "WR", team: "LAR", team25: "LAR", age: 31, depth: "WR3", tier: 4, tag: "Red Zone Target", rank: 114, yahoo: 130.0, sleeper: 128.0, ecr: 120.0, rz: 12, moved: false, desc: "Stafford's trusted red-zone boundary target with steady touchdown conversion." },
  { name: "Isaiah Likely", pos: "TE", team: "BAL", team25: "BAL", age: 26, depth: "TE2", tier: 4, tag: "Hybrid Matchup", rank: 115, yahoo: 125.0, sleeper: 129.0, ecr: 121.0, rz: 13, moved: false, desc: "Explosive seam receiver in two-TE sets with elite standalone handcuff value." },
  { name: "Kareem Hunt", pos: "RB", team: "KC", team25: "KC", age: 31, depth: "RB2", tier: 4, tag: "Goal Line Vulture", rank: 116, yahoo: 127.0, sleeper: 130.0, ecr: 122.0, rz: 26, moved: false, desc: "Physical short-yardage and goal-line specialist in Chiefs scoring machine." },
  { name: "Josh Palmer", pos: "WR", team: "LAC", team25: "LAC", age: 26, depth: "WR2", tier: 4, tag: "Herbert Target", rank: 117, yahoo: 132.0, sleeper: 131.0, ecr: 123.0, rz: 10, moved: false, desc: "Dependable intermediate target with established trust from Justin Herbert." },
  { name: "Geno Smith", pos: "QB", team: "SEA", team25: "SEA", age: 35, depth: "QB1", tier: 4, tag: "Deep Ball Slinger", rank: 118, yahoo: 129.0, sleeper: 133.0, ecr: 124.0, rz: 18, moved: false, desc: "Ryan Grubb offense unlocks high-volume deep passing with DK Metcalf & JSN." },
  { name: "Blake Corum", pos: "RB", team: "LAR", team25: "LAR", age: 25, depth: "RB2", tier: 4, tag: "Elite Handcuff", rank: 119, yahoo: 134.0, sleeper: 132.0, ecr: 125.0, rz: 20, moved: false, desc: "High-end handcuff with immediate RB1 upside if Kyren Williams misses time." },
  { name: "Darnell Mooney", pos: "WR", team: "ATL", team25: "ATL", age: 28, depth: "WR2", tier: 4, tag: "Speed Field Stretcher", rank: 120, yahoo: 131.0, sleeper: 134.0, ecr: 126.0, rz: 10, moved: false, desc: "Consistent air-yard volume and downfield splash plays in Zac Robinson attack." },

  // 121-130
  { name: "Jermaine Burton", pos: "WR", team: "CIN", team25: "CIN", age: 25, depth: "WR3", tier: 4, tag: "Deep Playmaker", rank: 121, yahoo: 145.0, sleeper: 135.0, ecr: 128.0, rz: 9, moved: false, desc: "Blazing deep speed with expanded 3rd WR snaps in pass-happy Burrow offense." },
  { name: "Tyler Allgeier", pos: "RB", team: "ATL", team25: "ATL", age: 26, depth: "RB2", tier: 4, tag: "Physical Handcuff", rank: 122, yahoo: 135.0, sleeper: 137.0, ecr: 129.0, rz: 22, moved: false, desc: "Premier standalone backup with guaranteed standalone touches and goal-line equity." },
  { name: "Justin Herbert", pos: "QB", team: "LAC", team25: "LAC", age: 28, depth: "QB1", tier: 3, tag: "Elite Arm Talent", rank: 123, yahoo: 121.0, sleeper: 136.0, ecr: 127.0, rz: 22, moved: false, desc: "Hyper-efficient arm with Ladd McConkey emergence and high-leverage red zone passing." },
  { name: "Ja'Lynn Polk", pos: "WR", team: "NE", team25: "NE", age: 24, depth: "WR3", tier: 4, tag: "Contested Target", rank: 124, yahoo: 148.0, sleeper: 138.0, ecr: 130.0, rz: 9, moved: false, desc: "Strong-handed boundary receiver developing chemistry with Drake Maye." },
  { name: "Braelon Allen", pos: "RB", team: "NYJ", team25: "NYJ", age: 22, depth: "RB2", tier: 4, tag: "Bruiser Handcuff", rank: 125, yahoo: 138.0, sleeper: 139.0, ecr: 131.0, rz: 24, moved: false, desc: "Massive 240-pound power back with standalone goal-line role and elite handcuff value." },
  { name: "Hunter Henry", pos: "TE", team: "NE", team25: "NE", age: 31, depth: "TE1", tier: 4, tag: "Red Zone Safety Valve", rank: 126, yahoo: 139.0, sleeper: 140.0, ecr: 132.0, rz: 12, moved: false, desc: "Drake Maye's go-to third-down and red-zone option with steady 5-target floor." },
  { name: "Trevor Etienne", pos: "RB", team: "DEN", team25: "UGA", age: 22, depth: "RB2", tier: 4, tag: "Rookie Dual Threat", rank: 127, yahoo: 162.0, sleeper: 141.0, ecr: 133.0, rz: 16, moved: true, desc: "Sean Payton style satellite back with exceptional contact balance and vision." },
  { name: "Tyler Lockett", pos: "WR", team: "SEA", team25: "SEA", age: 33, depth: "WR3", tier: 4, tag: "Savvy Veteran", rank: 128, yahoo: 136.0, sleeper: 144.0, ecr: 135.0, rz: 10, moved: false, desc: "Elite sideline toe-tap technician with reliable hands on high-leverage downs." },
  { name: "Kimani Vidal", pos: "RB", team: "LAC", team25: "LAC", age: 24, depth: "RB2", tier: 4, tag: "Compact Slasher", rank: 129, yahoo: 142.0, sleeper: 142.0, ecr: 134.0, rz: 18, moved: false, desc: "Greg Roman compact downhill runner with tackle-breaking burst in gap schemes." },
  { name: "Pat Freiermuth", pos: "TE", team: "PIT", team25: "PIT", age: 27, depth: "TE1", tier: 4, tag: "Muth Target", rank: 130, yahoo: 141.0, sleeper: 143.0, ecr: 136.0, rz: 11, moved: false, desc: "Arthur Smith offense heavily emphasizes tight end targets over the middle." },

  // 131-140
  { name: "Ezekiel Elliott", pos: "RB", team: "DAL", team25: "DAL", age: 31, depth: "RB3", tier: 5, tag: "Goal Line Specialist", rank: 131, yahoo: 143.0, sleeper: 146.0, ecr: 138.0, rz: 22, moved: false, desc: "Short-yardage short hammer with high conversion on 1-yard scoring plunges." },
  { name: "Michael Pittman Jr.", pos: "WR", team: "IND", team25: "IND", age: 28, depth: "WR1", tier: 3, tag: "Possession Alpha", rank: 132, yahoo: 109.0, sleeper: 127.0, ecr: 119.0, rz: 13, moved: false, desc: "Physical possession receiver commanding targets on slant and curl concepts." },
  { name: "Will Levis", pos: "QB", team: "TEN", team25: "TEN", age: 27, depth: "QB2", tier: 4, tag: "Cannon Arm", rank: 133, yahoo: 152.0, sleeper: 148.0, ecr: 140.0, rz: 18, moved: false, desc: "Big arm aggressive downfield thrower with rushing upside near the goal line." },
  { name: "Gabe Davis", pos: "WR", team: "JAX", team25: "JAX", age: 27, depth: "WR3", tier: 4, tag: "Boom Bust Deep Threat", rank: 134, yahoo: 146.0, sleeper: 150.0, ecr: 142.0, rz: 10, moved: false, desc: "Classic high-variance field stretcher capable of multi-touchdown spike weeks." },
  { name: "Miles Sanders", pos: "RB", team: "CAR", team25: "CAR", age: 29, depth: "RB3", tier: 5, tag: "Veteran Backup", rank: 135, yahoo: 150.0, sleeper: 152.0, ecr: 144.0, rz: 14, moved: false, desc: "Experienced change-of-pace option with solid pass protection credentials." },
  { name: "Cole Kmet", pos: "TE", team: "CHI", team25: "CHI", age: 27, depth: "TE2", tier: 4, tag: "Red Zone Giant", rank: 136, yahoo: 149.0, sleeper: 151.0, ecr: 143.0, rz: 11, moved: false, desc: "Big-bodied red-zone target with reliable hands on Caleb Williams play-action throws." },
  { name: "Jaylen Wright", pos: "RB", team: "MIA", team25: "MIA", age: 23, depth: "RB3", tier: 4, tag: "4.38 Speed Spark", rank: 137, yahoo: 154.0, sleeper: 149.0, ecr: 141.0, rz: 15, moved: false, desc: "Explosive one-cut slasher in Mike McDaniel space-creation run concepts." },
  { name: "Troy Franklin", pos: "WR", team: "DEN", team25: "DEN", age: 23, depth: "WR3", tier: 4, tag: "Bo Nix Connection", rank: 138, yahoo: 158.0, sleeper: 153.0, ecr: 145.0, rz: 8, moved: false, desc: "College teammate chemistry with Bo Nix unlocks built-in trust on deep concepts." },
  { name: "MarShawn Lloyd", pos: "RB", team: "GB", team25: "GB", age: 25, depth: "RB2", tier: 4, tag: "Dynamic Handcuff", rank: 139, yahoo: 155.0, sleeper: 155.0, ecr: 147.0, rz: 16, moved: false, desc: "Explosive cutting ability and tackle evasion behind Josh Jacobs in Green Bay." },
  { name: "Zach Ertz", pos: "TE", team: "WAS", team25: "WAS", age: 35, depth: "TE1", tier: 4, tag: "Kliff Kingsbury Fav", rank: 140, yahoo: 156.0, sleeper: 157.0, ecr: 149.0, rz: 10, moved: false, desc: "Veteran third-down safety blanket with heavy short-area target concentration." },

  // 141-150
  { name: "Deshaun Watson", pos: "QB", team: "CLE", team25: "CLE", age: 30, depth: "QB1", tier: 4, tag: "Dual Threat Anchor", rank: 141, yahoo: 151.0, sleeper: 159.0, ecr: 150.0, rz: 18, moved: false, desc: "Mobile quarterback with scramble yards and goal-line designed carries." },
  { name: "Antonio Gibson", pos: "RB", team: "NE", team25: "NE", age: 28, depth: "RB2", tier: 5, tag: "Passing Down Back", rank: 142, yahoo: 157.0, sleeper: 158.0, ecr: 151.0, rz: 14, moved: false, desc: "Former college wide receiver with high targets on 3rd down passing situations." },
  { name: "Noah Brown", pos: "WR", team: "WAS", team25: "WAS", age: 30, depth: "WR3", tier: 5, tag: "Big Slot Threat", rank: 143, yahoo: 163.0, sleeper: 160.0, ecr: 152.0, rz: 8, moved: false, desc: "Physical perimeter and big-slot blocker with splash play deep catch ability." },
  { name: "Alexander Mattison", pos: "RB", team: "LV", team25: "LV", age: 28, depth: "RB2", tier: 5, tag: "Downhill Plunger", rank: 144, yahoo: 159.0, sleeper: 161.0, ecr: 153.0, rz: 18, moved: false, desc: "Physical between-the-tackles grinder with goal-line punch capability." },
  { name: "Chigoziem Okonkwo", pos: "TE", team: "TEN", team25: "TEN", age: 26, depth: "TE1", tier: 4, tag: "YAC Dynamic TE", rank: 145, yahoo: 161.0, sleeper: 162.0, ecr: 154.0, rz: 9, moved: false, desc: "Hyper-athletic move tight end with exceptional yards after the catch on drag routes." },
  { name: "Bryce Young", pos: "QB", team: "CAR", team25: "CAR", age: 25, depth: "QB1", tier: 4, tag: "Post-Hype Sleeper", rank: 146, yahoo: 168.0, sleeper: 164.0, ecr: 155.0, rz: 15, moved: false, desc: "Dave Canales offensive system and Luther Burden III upgrade unleash quick-game rhythm." },
  { name: "Tyler Boyd", pos: "WR", team: "TEN", team25: "TEN", age: 31, depth: "WR3", tier: 5, tag: "Slot Chain Mover", rank: 147, yahoo: 164.0, sleeper: 165.0, ecr: 156.0, rz: 7, moved: false, desc: "Brian Callahan scheme slot fixture providing reliable 3rd down hands." },
  { name: "Justice Hill", pos: "RB", team: "BAL", team25: "BAL", age: 28, depth: "RB2", tier: 5, tag: "Pass Pro Specialist", rank: 148, yahoo: 166.0, sleeper: 166.0, ecr: 157.0, rz: 12, moved: false, desc: "Two-minute drill and third-down staple with consistent reception floor." },
  { name: "Kendrick Bourne", pos: "WR", team: "NE", team25: "NE", age: 31, depth: "WR4", tier: 5, tag: "Intermediate Route", rank: 149, yahoo: 170.0, sleeper: 168.0, ecr: 158.0, rz: 7, moved: false, desc: "Veteran chain-mover with quick-separation skills on boundary hitch concepts." },
  { name: "Cade Otton", pos: "TE", team: "TB", team25: "TB", age: 27, depth: "TE1", tier: 4, tag: "Snap Share Leader", rank: 150, yahoo: 165.0, sleeper: 167.0, ecr: 159.0, rz: 11, moved: false, desc: "Plays 95%+ of offensive snaps in high-scoring Baker Mayfield aerial attack." },

  // 151-160 (Offensive Skill Players)
  { name: "Sam Howell", pos: "QB", team: "SEA", team25: "SEA", age: 25, depth: "QB2", tier: 5, tag: "High Motor Backup", rank: 151, yahoo: 175.0, sleeper: 172.0, ecr: 162.0, rz: 12, moved: false, desc: "Aggressive downfield thrower with rushing juice whenever on the field." },
  { name: "Dameon Pierce", pos: "RB", team: "HOU", team25: "HOU", age: 26, depth: "RB2", tier: 5, tag: "Power Handcuff", rank: 152, yahoo: 171.0, sleeper: 170.0, ecr: 161.0, rz: 15, moved: false, desc: "Violent downhill runner serving as primary goal-line complement in Houston." },
  { name: "Michael Penix Jr.", pos: "QB", team: "ATL", team25: "ATL", age: 26, depth: "QB2", tier: 5, tag: "Left-Handed Cannon", rank: 153, yahoo: 180.0, sleeper: 174.0, ecr: 163.0, rz: 10, moved: false, desc: "Elite arm strength in Zac Robinson high-powered offense with Bijan Robinson and Drake London." },
  { name: "J.J. McCarthy", pos: "QB", team: "MIN", team25: "MIN", age: 23, depth: "QB1", tier: 4, tag: "Kevin O'Connell Scheme", rank: 154, yahoo: 172.0, sleeper: 169.0, ecr: 160.0, rz: 18, moved: false, desc: "Surrounded by Justin Jefferson, Jordan Addison, and elite offensive tackle play." },
  { name: "Tyrone Tracy Jr.", pos: "RB", team: "NYG", team25: "NYG", age: 26, depth: "RB2", tier: 4, tag: "Converted WR Weapon", rank: 155, yahoo: 169.0, sleeper: 165.0, ecr: 159.0, rz: 16, moved: false, desc: "Former college receiver with tackle-breaking agility and heavy passing-down targets." },
  { name: "Trey Benson", pos: "RB", team: "ARI", team25: "ARI", age: 24, depth: "RB2", tier: 4, tag: "Ascending Slasher", rank: 156, yahoo: 167.0, sleeper: 163.0, ecr: 157.0, rz: 18, moved: false, desc: "Explosive 4.39 speed with expanding second-half workload behind James Conner." },
  { name: "Roman Wilson", pos: "WR", team: "PIT", team25: "PIT", age: 25, depth: "WR2", tier: 5, tag: "Slot Separator", rank: 157, yahoo: 178.0, sleeper: 175.0, ecr: 165.0, rz: 8, moved: false, desc: "High-motor slot route runner with 4.39 speed and elite contested-catch hands." },
  { name: "Jalen McMillan", pos: "WR", team: "TB", team25: "TB", age: 24, depth: "WR3", tier: 5, tag: "Third Down Target", rank: 158, yahoo: 179.0, sleeper: 176.0, ecr: 166.0, rz: 9, moved: false, desc: "Crisp intermediate route runner operating from the slot in pass-heavy Tampa scheme." },
  { name: "Malachi Corley", pos: "WR", team: "NYJ", team25: "NYJ", age: 24, depth: "WR3", tier: 5, tag: "YAC Bowling Ball", rank: 159, yahoo: 182.0, sleeper: 178.0, ecr: 168.0, rz: 9, moved: false, desc: "Manufactured touch specialist with tackle-breaking power on quick screens and jets." },
  { name: "Luke McCaffrey", pos: "WR", team: "WAS", team25: "WAS", age: 25, depth: "WR3", tier: 5, tag: "Slot Chain Mover", rank: 160, yahoo: 184.0, sleeper: 180.0, ecr: 170.0, rz: 8, moved: false, desc: "Natural feel for zone coverage underneath Terry McLaurin deep crossers." },

  // 161-170 (Offensive Skill Players)
  { name: "Aaron Rodgers", pos: "QB", team: "NYJ", team25: "NYJ", age: 42, depth: "QB1", tier: 4, tag: "Veteran Gunslinger", rank: 161, yahoo: 165.0, sleeper: 171.0, ecr: 164.0, rz: 22, moved: false, desc: "Masterful pre-snap technician feeding Garrett Wilson and Davante Adams in red zone." },
  { name: "Russell Wilson", pos: "QB", team: "PIT", team25: "PIT", age: 37, depth: "QB2", tier: 5, tag: "Moon Ball Slinger", rank: 162, yahoo: 185.0, sleeper: 182.0, ecr: 172.0, rz: 16, moved: false, desc: "Deep ball efficiency and play-action shot plays to George Pickens." },
  { name: "Roschon Johnson", pos: "RB", team: "CHI", team25: "CHI", age: 25, depth: "RB2", tier: 5, tag: "Goal Line Bruiser", rank: 163, yahoo: 183.0, sleeper: 181.0, ecr: 171.0, rz: 20, moved: false, desc: "Pass protection specialist and short-yardage hammer in Chicago multi-back system." },
  { name: "Keaton Mitchell", pos: "RB", team: "BAL", team25: "BAL", age: 24, depth: "RB3", tier: 5, tag: "4.33 Lightning", rank: 164, yahoo: 186.0, sleeper: 183.0, ecr: 173.0, rz: 10, moved: false, desc: "Explosive home-run threat capable of scoring on any outside pitch play." },
  { name: "Tank Bigsby", pos: "RB", team: "JAX", team25: "JAX", age: 24, depth: "RB2", tier: 5, tag: "Downhill Hammer", rank: 165, yahoo: 181.0, sleeper: 179.0, ecr: 169.0, rz: 22, moved: false, desc: "Hard-nosed interior runner taking high-leverage early-down carries in Jacksonville." },
  { name: "Ty Chandler", pos: "RB", team: "MIN", team25: "MIN", age: 28, depth: "RB2", tier: 5, tag: "Speed Complement", rank: 166, yahoo: 188.0, sleeper: 185.0, ecr: 175.0, rz: 14, moved: false, desc: "One-cut acceleration in Kevin O'Connell wide zone running concepts." },
  { name: "Audric Estimé", pos: "RB", team: "DEN", team25: "DEN", age: 23, depth: "RB3", tier: 5, tag: "Power Finisher", rank: 167, yahoo: 190.0, sleeper: 187.0, ecr: 177.0, rz: 18, moved: false, desc: "230-pound goal-line weapon handling short-yardage and fourth-quarter clock killing." },
  { name: "Isaac Guerendo", pos: "RB", team: "SF", team25: "SF", age: 26, depth: "RB2", tier: 5, tag: "4.33 Athletic Freak", rank: 168, yahoo: 187.0, sleeper: 184.0, ecr: 174.0, rz: 15, moved: false, desc: "Freak athletic back in Kyle Shanahan zone scheme with massive handcuff value." },
  { name: "Javon Baker", pos: "WR", team: "NE", team25: "NE", age: 24, depth: "WR4", tier: 5, tag: "Contested Ball Winner", rank: 169, yahoo: 192.0, sleeper: 189.0, ecr: 179.0, rz: 8, moved: false, desc: "Deep boundary receiver with exceptional tracking and high yards per target." },
  { name: "Devontez Walker", pos: "WR", team: "BAL", team25: "BAL", age: 25, depth: "WR3", tier: 5, tag: "Field Stretcher", rank: 170, yahoo: 194.0, sleeper: 191.0, ecr: 181.0, rz: 7, moved: false, desc: "Vertical speed weapon taking top off opposing defenses for Lamar Jackson." },

  // 171-180 (Offensive Skill Players)
  { name: "Derek Carr", pos: "QB", team: "NO", team25: "NO", age: 35, depth: "QB1", tier: 5, tag: "Rhythm Passer", rank: 171, yahoo: 189.0, sleeper: 188.0, ecr: 178.0, rz: 18, moved: false, desc: "Klint Kubiak play-action passing system generates steady 200+ yard passing baseline." },
  { name: "Daniel Jones", pos: "QB", team: "NYG", team25: "NYG", age: 29, depth: "QB2", tier: 5, tag: "Rushing Threat", rank: 172, yahoo: 193.0, sleeper: 190.0, ecr: 180.0, rz: 20, moved: false, desc: "Dual-threat quarterback with designed QB runs and scramble yard equity." },
  { name: "Darius Slayton", pos: "WR", team: "NYG", team25: "NYG", age: 29, depth: "WR3", tier: 5, tag: "Deep Ball Veteran", rank: 173, yahoo: 195.0, sleeper: 192.0, ecr: 182.0, rz: 8, moved: false, desc: "Perennial yards-per-catch leader with proven downfield burst." },
  { name: "Curtis Samuel", pos: "WR", team: "BUF", team25: "BUF", age: 30, depth: "WR2", tier: 5, tag: "Gadget Weapon", rank: 174, yahoo: 191.0, sleeper: 193.0, ecr: 183.0, rz: 9, moved: false, desc: "Versatile playmaker used on sweeps, screens, and intermediate option routes." },
  { name: "Brandin Cooks", pos: "WR", team: "DAL", team25: "DAL", age: 32, depth: "WR2", tier: 5, tag: "Veteran Separator", rank: 175, yahoo: 196.0, sleeper: 194.0, ecr: 184.0, rz: 9, moved: false, desc: "Dak Prescott's veteran perimeter target with proven end-zone conversion." },
  { name: "Adam Thielen", pos: "WR", team: "CAR", team25: "CAR", age: 36, depth: "WR3", tier: 5, tag: "Chain Mover", rank: 176, yahoo: 198.0, sleeper: 196.0, ecr: 186.0, rz: 10, moved: false, desc: "Reliable veteran 3rd-down option with elite footwork and contested hands." },
  { name: "Kenneth Gainwell", pos: "RB", team: "PHI", team25: "PHI", age: 27, depth: "RB2", tier: 5, tag: "Pass Down Specialist", rank: 177, yahoo: 197.0, sleeper: 195.0, ecr: 185.0, rz: 14, moved: false, desc: "Two-minute drill passing back with trusted pass blocking in Philadelphia." },
  { name: "Jaleel McLaughlin", pos: "RB", team: "DEN", team25: "DEN", age: 25, depth: "RB3", tier: 5, tag: "Quick Burst Spark", rank: 178, yahoo: 199.0, sleeper: 197.0, ecr: 187.0, rz: 12, moved: false, desc: "Lightning quick change of pace runner with high yards-per-touch efficiency." },
  { name: "Noah Fant", pos: "TE", team: "SEA", team25: "SEA", age: 28, depth: "TE1", tier: 5, tag: "Seam Threat", rank: 179, yahoo: 200.0, sleeper: 198.0, ecr: 188.0, rz: 10, moved: false, desc: "Athletic tight end operating in Ryan Grubb spread formations." },
  { name: "Jonnu Smith", pos: "TE", team: "MIA", team25: "MIA", age: 31, depth: "TE1", tier: 5, tag: "YAC Heavy TE", rank: 180, yahoo: 201.0, sleeper: 199.0, ecr: 189.0, rz: 11, moved: false, desc: "Dynamic tight end used on tight-end screens and shallow crosses in space." },

  // 181-190 (Offensive Skill Players)
  { name: "Gardner Minshew", pos: "QB", team: "LV", team25: "LV", age: 30, depth: "QB2", tier: 5, tag: "Scrappy Passer", rank: 181, yahoo: 203.0, sleeper: 201.0, ecr: 191.0, rz: 12, moved: false, desc: "High-energy distributor capable of multi-touchdown spot starts." },
  { name: "Jacoby Brissett", pos: "QB", team: "NE", team25: "NE", age: 33, depth: "QB2", tier: 5, tag: "Veteran Mentor", rank: 182, yahoo: 205.0, sleeper: 203.0, ecr: 193.0, rz: 14, moved: false, desc: "Steady pocket presence and goal-line QB sneak specialist." },
  { name: "Andrei Iosivas", pos: "WR", team: "CIN", team25: "CIN", age: 26, depth: "WR4", tier: 5, tag: "Red Zone Giant", rank: 183, yahoo: 202.0, sleeper: 200.0, ecr: 190.0, rz: 11, moved: false, desc: "6'3 mismatch weapon with exceptional red-zone catch radius from Joe Burrow." },
  { name: "Greg Dortch", pos: "WR", team: "ARI", team25: "ARI", age: 28, depth: "WR3", tier: 5, tag: "Slot Sparkplug", rank: 184, yahoo: 204.0, sleeper: 202.0, ecr: 192.0, rz: 7, moved: false, desc: "Hyper-efficient target earner on shallow crossing routes and quick outs." },
  { name: "Jalen Tolbert", pos: "WR", team: "DAL", team25: "DAL", age: 27, depth: "WR3", tier: 5, tag: "Boundary Target", rank: 185, yahoo: 206.0, sleeper: 204.0, ecr: 194.0, rz: 8, moved: false, desc: "Expanding route tree in high-volume Dak Prescott passing offense." },
  { name: "Tre Tucker", pos: "WR", team: "LV", team25: "LV", age: 25, depth: "WR2", tier: 5, tag: "Deep Burner", rank: 186, yahoo: 207.0, sleeper: 205.0, ecr: 195.0, rz: 6, moved: false, desc: "Blazing 4.3 speed with significant air-yard share on deep vertical routes." },
  { name: "Tyler Conklin", pos: "TE", team: "NYJ", team25: "NYJ", age: 31, depth: "TE1", tier: 5, tag: "High Snap TE", rank: 187, yahoo: 208.0, sleeper: 206.0, ecr: 196.0, rz: 10, moved: false, desc: "Consistent snap share and safety blanket in New York intermediate passing game." },
  { name: "Juwan Johnson", pos: "TE", team: "NO", team25: "NO", age: 29, depth: "TE1", tier: 5, tag: "Converted WR TE", rank: 188, yahoo: 209.0, sleeper: 207.0, ecr: 197.0, rz: 9, moved: false, desc: "Former receiver with excellent seam-stretching speed and red-zone ball skills." },
  { name: "Colby Parkinson", pos: "TE", team: "LAR", team25: "LAR", age: 27, depth: "TE1", tier: 5, tag: "Red Zone Tower", rank: 189, yahoo: 210.0, sleeper: 208.0, ecr: 198.0, rz: 10, moved: false, desc: "6'7 red-zone target playing primary tight end snaps in Sean McVay offense." },
  { name: "Mike Gesicki", pos: "TE", team: "CIN", team25: "CIN", age: 30, depth: "TE1", tier: 5, tag: "Slot Matchup TE", rank: 190, yahoo: 211.0, sleeper: 209.0, ecr: 199.0, rz: 9, moved: false, desc: "Operates as large slot receiver with high TD equity in Cincinnati passing system." },

  // 191-200 (Offensive Skill Players)
  { name: "Drew Lock", pos: "QB", team: "NYG", team25: "NYG", age: 29, depth: "QB3", tier: 5, tag: "Gunslinger Backup", rank: 191, yahoo: 215.0, sleeper: 212.0, ecr: 202.0, rz: 10, moved: false, desc: "High-variance pocket passer with aggressive downfield throw mentality." },
  { name: "Spencer Rattler", pos: "QB", team: "NO", team25: "NO", age: 25, depth: "QB2", tier: 5, tag: "Young Slinger", rank: 192, yahoo: 217.0, sleeper: 214.0, ecr: 204.0, rz: 12, moved: false, desc: "Natural arm elasticity with off-platform playmaking ability." },
  { name: "Clyde Edwards-Helaire", pos: "RB", team: "KC", team25: "KC", age: 27, depth: "RB3", tier: 5, tag: "Pass Catching Back", rank: 193, yahoo: 212.0, sleeper: 210.0, ecr: 200.0, rz: 12, moved: false, desc: "Familiarity with Andy Reid offense and reliable receiving hands." },
  { name: "Samaje Perine", pos: "RB", team: "KC", team25: "KC", age: 30, depth: "RB3", tier: 5, tag: "Third Down Specialist", rank: 194, yahoo: 213.0, sleeper: 211.0, ecr: 201.0, rz: 10, moved: false, desc: "Elite third-down pass blocking and screen pass execution for Patrick Mahomes." },
  { name: "Cam Akers", pos: "RB", team: "MIN", team25: "MIN", age: 27, depth: "RB3", tier: 5, tag: "Rotational Runner", rank: 195, yahoo: 214.0, sleeper: 213.0, ecr: 203.0, rz: 11, moved: false, desc: "Decisive one-cut runner providing experienced depth in Minnesota backfield." },
  { name: "Kalif Raymond", pos: "WR", team: "DET", team25: "DET", age: 32, depth: "WR3", tier: 5, tag: "Speed Complement", rank: 196, yahoo: 216.0, sleeper: 215.0, ecr: 205.0, rz: 6, moved: false, desc: "Blazing speed specialist capable of long touchdown receptions in Detroit." },
  { name: "Xavier Legette", pos: "WR", team: "CAR", team25: "CAR", age: 25, depth: "WR2", tier: 5, tag: "Size Speed Freak", rank: 197, yahoo: 218.0, sleeper: 216.0, ecr: 206.0, rz: 8, moved: false, desc: "4.39 speed with 225-pound frame expanding sophomore year target share." },
  { name: "Ben Sinnott", pos: "TE", team: "WAS", team25: "WAS", age: 24, depth: "TE2", tier: 5, tag: "Ascending Move TE", rank: 198, yahoo: 219.0, sleeper: 217.0, ecr: 207.0, rz: 8, moved: false, desc: "Dynamic H-back weapon with huge YAC potential taking on expanding role." },
  { name: "Theo Johnson", pos: "TE", team: "NYG", team25: "NYG", age: 25, depth: "TE1", tier: 5, tag: "9.99 RAS Athlete", rank: 199, yahoo: 220.0, sleeper: 218.0, ecr: 208.0, rz: 9, moved: false, desc: "Generational athletic testing tight end commanding starting snaps in NY." },
  { name: "Ja'Tavion Sanders", pos: "TE", team: "CAR", team25: "CAR", age: 23, depth: "TE1", tier: 5, tag: "Smooth Receiver TE", rank: 200, yahoo: 221.0, sleeper: 219.0, ecr: 209.0, rz: 8, moved: false, desc: "Fluid route runner developing into Bryce Young's favorite middle-field target." }
];

// Appended Kickers (K)
const kickerOptions = [
  { name: "Brandon Aubrey", pos: "K", team: "DAL", team25: "DAL", age: 31, depth: "K1", tier: 1, tag: "Record Range Kicker", rank: 201, yahoo: 115.0, sleeper: 120.0, ecr: 110.0, rz: 0, moved: false, desc: "NFL record 65+ yard range in highest scoring dome offense. Huge positional edge." },
  { name: "Justin Tucker", pos: "K", team: "BAL", team25: "BAL", age: 36, depth: "K1", tier: 1, tag: "Clutch Legend Kicker", rank: 202, yahoo: 125.0, sleeper: 130.0, ecr: 122.0, rz: 0, moved: false, desc: "Automatic scoring opportunities in high-efficiency Lamar Jackson offense." },
  { name: "Ka'imi Fairbairn", pos: "K", team: "HOU", team25: "HOU", age: 32, depth: "K1", tier: 1, tag: "Dome Accuracy Kicker", rank: 203, yahoo: 138.0, sleeper: 135.0, ecr: 130.0, rz: 0, moved: false, desc: "Elite dome conditions with high-scoring C.J. Stroud offense creating constant field goals." },
  { name: "Cameron Dicker", pos: "K", team: "LAC", team25: "LAC", age: 26, depth: "K1", tier: 1, tag: "Dicker the Kicker", rank: 204, yahoo: 140.0, sleeper: 138.0, ecr: 132.0, rz: 0, moved: false, desc: "95%+ career field goal accuracy in weather-free SoFi stadium." },
  { name: "Harrison Butker", pos: "K", team: "KC", team25: "KC", age: 31, depth: "K1", tier: 1, tag: "Chiefs Engine Kicker", rank: 205, yahoo: 144.0, sleeper: 142.0, ecr: 137.0, rz: 0, moved: false, desc: "High volume extra points and reliable 50-yard strikes in Chiefs offense." },
  { name: "Jake Bates", pos: "K", team: "DET", team25: "DET", age: 26, depth: "K1", tier: 2, tag: "64-Yard Monster Leg", rank: 206, yahoo: 152.0, sleeper: 147.0, ecr: 142.0, rz: 0, moved: false, desc: "UFL sensation with 64-yard leg playing under Ford Field dome roof." },
  { name: "Chase McLaughlin", pos: "K", team: "TB", team25: "TB", age: 30, depth: "K1", tier: 2, tag: "Deep Ball Striker", rank: 207, yahoo: 155.0, sleeper: 150.0, ecr: 146.0, rz: 0, moved: false, desc: "Automatic from 50+ yards in sunny Tampa Bay scoring attack." },
  { name: "Jason Sanders", pos: "K", team: "MIA", team25: "MIA", age: 30, depth: "K1", tier: 2, tag: "Warm Weather Kicker", rank: 208, yahoo: 158.0, sleeper: 154.0, ecr: 148.0, rz: 0, moved: false, desc: "Prolific volume in high-flying Miami offensive attack." },
  { name: "Greg Zuerlein", pos: "K", team: "NYJ", team25: "NYJ", age: 38, depth: "K1", tier: 2, tag: "Greg the Leg", rank: 209, yahoo: 160.0, sleeper: 156.0, ecr: 150.0, rz: 0, moved: false, desc: "Huge leg from 50+ yards with improved red-zone stall opportunities." },
  { name: "Chris Boswell", pos: "K", team: "PIT", team25: "PIT", age: 35, depth: "K1", tier: 2, tag: "Steel City Automatic", rank: 210, yahoo: 162.0, sleeper: 158.0, ecr: 152.0, rz: 0, moved: false, desc: "Lethal 50+ yard accuracy carrying Pittsburgh offense in close games." },
  { name: "Younghoe Koo", pos: "K", team: "ATL", team25: "ATL", age: 32, depth: "K1", tier: 2, tag: "Dome Specialist", rank: 211, yahoo: 165.0, sleeper: 160.0, ecr: 154.0, rz: 0, moved: false, desc: "Clutch dome kicker with prolific opportunities in Atlanta offense." },
  { name: "Jake Moody", pos: "K", team: "SF", team25: "SF", age: 26, depth: "K1", tier: 2, tag: "Bay Area Leg", rank: 212, yahoo: 167.0, sleeper: 162.0, ecr: 156.0, rz: 0, moved: false, desc: "High point total potential in high-scoring 49ers offensive engine." },
  { name: "Evan McPherson", pos: "K", team: "CIN", team25: "CIN", age: 27, depth: "K1", tier: 2, tag: "Money Mac", rank: 213, yahoo: 168.0, sleeper: 164.0, ecr: 158.0, rz: 0, moved: false, desc: "Huge postseason clutch leg attached to Joe Burrow high-scoring unit." },
  { name: "Matt Gay", pos: "K", team: "IND", team25: "IND", age: 32, depth: "K1", tier: 2, tag: "Indy Dome Ace", rank: 214, yahoo: 170.0, sleeper: 166.0, ecr: 160.0, rz: 0, moved: false, desc: "Lucas Oil Stadium dome kicker with reliable 50+ yard range." },
  { name: "Dustin Hopkins", pos: "K", team: "CLE", team25: "CLE", age: 35, depth: "K1", tier: 2, tag: "Long Range Ace", rank: 215, yahoo: 172.0, sleeper: 168.0, ecr: 162.0, rz: 0, moved: false, desc: "Consistently drilled 50+ yard field goals in tough conditions." },
  { name: "Cairo Santos", pos: "K", team: "CHI", team25: "CHI", age: 34, depth: "K1", tier: 2, tag: "Windy City Sniper", rank: 216, yahoo: 174.0, sleeper: 170.0, ecr: 164.0, rz: 0, moved: false, desc: "Outstanding accuracy benefiting from high-scoring Ben Johnson offense." }
];

// Appended Defenses (DEF)
const defenseOptions = [
  { name: "San Francisco 49ers", pos: "DEF", team: "SF", team25: "SF", age: 28, depth: "DEF1", tier: 1, tag: "Elite Turnovers DEF", rank: 217, yahoo: 130.0, sleeper: 125.0, ecr: 120.0, rz: 0, moved: false, desc: "Dominant defensive front with Nick Bosa generating constant sacks and takeaways." },
  { name: "Baltimore Ravens", pos: "DEF", team: "BAL", team25: "BAL", age: 27, depth: "DEF1", tier: 1, tag: "Sack Machine DEF", rank: 218, yahoo: 132.0, sleeper: 128.0, ecr: 124.0, rz: 0, moved: false, desc: "Blitz-heavy scheme with elite safety play forcing multi-turnover games." },
  { name: "Pittsburgh Steelers", pos: "DEF", team: "PIT", team25: "PIT", age: 28, depth: "DEF1", tier: 1, tag: "T.J. Watt Havoc DEF", rank: 219, yahoo: 135.0, sleeper: 132.0, ecr: 126.0, rz: 0, moved: false, desc: "T.J. Watt and elite pass rush lead NFL in defensive touchdowns and strip sacks." },
  { name: "Buffalo Bills", pos: "DEF", team: "BUF", team25: "BUF", age: 28, depth: "DEF1", tier: 1, tag: "Opportunistic DEF", rank: 220, yahoo: 137.0, sleeper: 135.0, ecr: 131.0, rz: 0, moved: false, desc: "Sean McDermott ball-hawking secondary consistently wins turnover battles." },
  { name: "Kansas City Chiefs", pos: "DEF", team: "KC", team25: "KC", age: 26, depth: "DEF1", tier: 1, tag: "Spagnuolo Blitz DEF", rank: 221, yahoo: 142.0, sleeper: 139.0, ecr: 135.0, rz: 0, moved: false, desc: "Steve Spagnuolo exotic blitz packages create constant 3rd-down sacks and INTs." },
  { name: "Houston Texans", pos: "DEF", team: "HOU", team25: "HOU", age: 26, depth: "DEF1", tier: 1, tag: "DeMeco Ryans Swarm", rank: 222, yahoo: 145.0, sleeper: 140.0, ecr: 136.0, rz: 0, moved: false, desc: "Will Anderson Jr. and Danielle Hunter create ferocious edge rush pressure." },
  { name: "Philadelphia Eagles", pos: "DEF", team: "PHI", team25: "PHI", age: 27, depth: "DEF1", tier: 2, tag: "Vic Fangio Scheme", rank: 223, yahoo: 147.0, sleeper: 144.0, ecr: 139.0, rz: 0, moved: false, desc: "Talented young secondary with Jalen Carter wrecking interior offensive lines." },
  { name: "Detroit Lions", pos: "DEF", team: "DET", team25: "DET", age: 27, depth: "DEF1", tier: 2, tag: "Aidan Hutchinson Edge", rank: 224, yahoo: 150.0, sleeper: 146.0, ecr: 143.0, rz: 0, moved: false, desc: "Aidan Hutchinson pass rush engine forcing quarterbacks into hurried throws." },
  { name: "Minnesota Vikings", pos: "DEF", team: "MIN", team25: "MIN", age: 28, depth: "DEF1", tier: 2, tag: "Brian Flores Chaos DEF", rank: 225, yahoo: 153.0, sleeper: 148.0, ecr: 145.0, rz: 0, moved: false, desc: "Brian Flores psycho blitz packages confuse opposing QBs for cheap pick-sixes." },
  { name: "Denver Broncos", pos: "DEF", team: "DEN", team25: "DEN", age: 27, depth: "DEF1", tier: 2, tag: "Surtain Lock Island", rank: 226, yahoo: 155.0, sleeper: 150.0, ecr: 147.0, rz: 0, moved: false, desc: "Patrick Surtain II erases opponent WR1s while defensive front racks up sacks." },
  { name: "Cleveland Browns", pos: "DEF", team: "CLE", team25: "CLE", age: 28, depth: "DEF1", tier: 2, tag: "Myles Garrett Force", rank: 227, yahoo: 157.0, sleeper: 152.0, ecr: 149.0, rz: 0, moved: false, desc: "Myles Garrett terrorizes pocket passers with league-leading sack pressure." },
  { name: "New York Jets", pos: "DEF", team: "NYJ", team25: "NYJ", age: 27, depth: "DEF1", tier: 2, tag: "Sauce Island Blanket", rank: 228, yahoo: 159.0, sleeper: 154.0, ecr: 151.0, rz: 0, moved: false, desc: "Sauce Gardner lockdown boundary coverage limits big passing plays." },
  { name: "Dallas Cowboys", pos: "DEF", team: "DAL", team25: "DAL", age: 27, depth: "DEF1", tier: 2, tag: "Micah Parsons Havoc", rank: 229, yahoo: 161.0, sleeper: 156.0, ecr: 153.0, rz: 0, moved: false, desc: "Micah Parsons lightning first-step generates constant strip sacks and fumbles." },
  { name: "Chicago Bears", pos: "DEF", team: "CHI", team25: "CHI", age: 26, depth: "DEF1", tier: 2, tag: "Montez Sweat Pass Rush", rank: 230, yahoo: 163.0, sleeper: 158.0, ecr: 155.0, rz: 0, moved: false, desc: "Turnover-forcing secondary and Montez Sweat interior pocket push." },
  { name: "Green Bay Packers", pos: "DEF", team: "GB", team25: "GB", age: 26, depth: "DEF1", tier: 2, tag: "Jeff Hafley Aggression", rank: 231, yahoo: 165.0, sleeper: 160.0, ecr: 157.0, rz: 0, moved: false, desc: "Xavier McKinney ball-hawking safety play creating regular interception returns." },
  { name: "Miami Dolphins", pos: "DEF", team: "MIA", team25: "MIA", age: 28, depth: "DEF1", tier: 2, tag: "Anthony Weaver Pressure", rank: 232, yahoo: 167.0, sleeper: 162.0, ecr: 159.0, rz: 0, moved: false, desc: "Speed rushers capitalizing on opponents playing from behind against Miami." }
];

const allPlayers = [...skillPlayers, ...kickerOptions, ...defenseOptions];

console.log(`Generated ${skillPlayers.length} skill players + ${kickerOptions.length} Kickers + ${defenseOptions.length} Defenses = ${allPlayers.length} total players.`);

function generatePlayerRaw(p, index) {
  const id = index + 1;
  const rank = p.rank;
  const isK = p.pos === 'K';
  const isDef = p.pos === 'DEF';
  const isQB = p.pos === 'QB';
  const isRB = p.pos === 'RB';
  const isWR = p.pos === 'WR';
  const isTE = p.pos === 'TE';

  // Realistic stat defaults based on pos & rank
  let ppg25 = 12.0;
  let projPpg = 12.0;
  let ceilPpg = 18.0;
  let floorPpg = 6.0;
  let boom = 0.25;
  let bust = 0.15;
  let rz = p.rz || 0;
  let tgtShare = 0.18;
  let snapShare = 0.70;
  let epa = 0.12;

  if (isQB) {
    // 6-pt Passing TD League: Elite dual-threat and volume passers surge
    ppg25 = Number(Math.max(17.5, 27.5 - (rank * 0.09)).toFixed(1));
    projPpg = Number(Math.max(18.0, 28.2 - (rank * 0.08)).toFixed(1));
    ceilPpg = Number((projPpg * 1.36).toFixed(1));
    floorPpg = Number((projPpg * 0.68).toFixed(1));
    boom = 0.38;
    bust = 0.10;
    tgtShare = 0;
    snapShare = 0.98;
    epa = Number((0.32 - rank * 0.0012).toFixed(2));
  } else if (isRB) {
    // Half-PPR (0.5 PPR): Workhorse RBs with goal line monopolization dominate
    ppg25 = Number(Math.max(6.2, 20.5 - (rank * 0.082)).toFixed(1));
    projPpg = Number(Math.max(6.8, 21.0 - (rank * 0.078)).toFixed(1));
    ceilPpg = Number((projPpg * 1.45).toFixed(1));
    floorPpg = Number((projPpg * 0.55).toFixed(1));
    boom = Number(Math.max(0.12, 0.45 - rank * 0.002).toFixed(2));
    bust = Number(Math.min(0.35, 0.08 + rank * 0.0015).toFixed(2));
    tgtShare = Number(Math.max(0.04, 0.20 - rank * 0.0008).toFixed(2));
    snapShare = Number(Math.max(0.35, 0.85 - rank * 0.0025).toFixed(2));
    epa = Number((0.24 - rank * 0.001).toFixed(2));
  } else if (isWR) {
    // Half-PPR (0.5 PPR): High target share alpha receivers
    ppg25 = Number(Math.max(5.8, 20.2 - (rank * 0.082)).toFixed(1));
    projPpg = Number(Math.max(6.2, 20.8 - (rank * 0.078)).toFixed(1));
    ceilPpg = Number((projPpg * 1.48).toFixed(1));
    floorPpg = Number((projPpg * 0.52).toFixed(1));
    boom = Number(Math.max(0.14, 0.46 - rank * 0.002).toFixed(2));
    bust = Number(Math.min(0.32, 0.09 + rank * 0.0014).toFixed(2));
    tgtShare = Number(Math.max(0.10, 0.32 - rank * 0.0012).toFixed(2));
    snapShare = Number(Math.max(0.50, 0.92 - rank * 0.002).toFixed(2));
    epa = Number((0.25 - rank * 0.001).toFixed(2));
  } else if (isTE) {
    // Half-PPR (0.5 PPR): Tier 1 elite TEs provide massive positional dropoff
    ppg25 = Number(Math.max(4.8, 15.5 - (rank * 0.058)).toFixed(1));
    projPpg = Number(Math.max(5.2, 16.0 - (rank * 0.052)).toFixed(1));
    ceilPpg = Number((projPpg * 1.46).toFixed(1));
    floorPpg = Number((projPpg * 0.54).toFixed(1));
    boom = Number(Math.max(0.10, 0.38 - rank * 0.0018).toFixed(2));
    bust = Number(Math.min(0.35, 0.10 + rank * 0.0015).toFixed(2));
    tgtShare = Number(Math.max(0.08, 0.25 - rank * 0.001).toFixed(2));
    snapShare = Number(Math.max(0.45, 0.88 - rank * 0.002).toFixed(2));
    epa = Number((0.20 - rank * 0.001).toFixed(2));
  } else if (isK) {
    ppg25 = Number((10.2 - (rank - 200) * 0.12).toFixed(1));
    projPpg = Number((9.8 - (rank - 200) * 0.10).toFixed(1));
    ceilPpg = Number((projPpg + 6.0).toFixed(1));
    floorPpg = Number((projPpg - 4.5).toFixed(1));
    boom = 0.22;
    bust = 0.14;
    tgtShare = 0;
    snapShare = 0.70;
    epa = 0.10;
    rz = 0;
  } else if (isDef) {
    ppg25 = Number((10.5 - (rank - 216) * 0.15).toFixed(1));
    projPpg = Number((10.0 - (rank - 216) * 0.12).toFixed(1));
    ceilPpg = Number((projPpg + 7.5).toFixed(1));
    floorPpg = Number((projPpg - 4.8).toFixed(1));
    boom = 0.26;
    bust = 0.16;
    tgtShare = 0;
    snapShare = 0.70;
    epa = 0.10;
    rz = 0;
  }

  const projFantasyPts = Number((projPpg * 17).toFixed(1));

  const obj = {
    Player_ID: id,
    Player_Name: p.name,
    Pos: p.pos,
    Team: p.team,
    Team_2025: p.team25,
    Age: p.age,
    Last_Depth_Chart: p.depth,
    Yahoo_ADP: p.yahoo,
    Sleeper_ADP: p.sleeper,
    ECR_Rank: p.ecr,
    Position_Tier: p.tier,
    Has_Moved: p.moved,
    Sleeper_Tag: p.tag,
    Projected_Rank: p.rank,
    Notable_Description: p.desc,
  };

  if (isQB) {
    obj.Actual_Pass_Yds_25 = Math.round(ppg25 * 180);
    obj.Actual_Pass_TD_25 = Math.round(ppg25 * 1.3);
    obj.Actual_Rush_Yds_25 = p.rank <= 30 ? 450 : 220;
    obj.Actual_Rush_TD_25 = p.rank <= 30 ? 6 : 2;
  } else if (isRB) {
    obj.Actual_Rush_Yds_25 = Math.round(ppg25 * 55);
    obj.Actual_Rush_TD_25 = Math.round(ppg25 * 0.5);
    obj.Actual_Rec_25 = Math.round(ppg25 * 2.8);
    obj.Actual_Rec_Yds_25 = Math.round(ppg25 * 22);
    obj.Actual_Rec_TD_25 = Math.round(ppg25 * 0.18);
    obj.Actual_Targets_25 = Math.round(ppg25 * 3.5);
  } else if (isWR || isTE) {
    obj.Actual_Rec_25 = Math.round(ppg25 * 4.8);
    obj.Actual_Rec_Yds_25 = Math.round(ppg25 * 62);
    obj.Actual_Rec_TD_25 = Math.round(ppg25 * 0.45);
    obj.Actual_Targets_25 = Math.round(ppg25 * 7.2);
  }

  obj.RZ_Touches_25 = rz;
  if (tgtShare > 0) obj.Target_Share_25 = tgtShare;
  obj.Snap_Share_25 = snapShare;
  obj.EPA_Per_Play_25 = epa;
  obj.Fantasy_PPG_25 = ppg25;
  obj.Proj_Fantasy_Pts_26 = projFantasyPts;
  obj.Proj_PPG_26 = projPpg;
  obj.Ceiling_PPG_26 = ceilPpg;
  obj.Floor_PPG_26 = floorPpg;
  obj.Boom_Rate = boom;
  obj.Bust_Rate = bust;
  obj.Touch_Equity = Math.round(ppg25 * 1.8);

  return obj;
}

const rawPlayersList = allPlayers.map((p, idx) => generatePlayerRaw(p, idx));

const kickerAndDefRawList = allPlayers.filter(p => p.pos === 'K' || p.pos === 'DEF').map((p, idx) => generatePlayerRaw(p, skillPlayers.length + idx));

const tsContent = `import { Player, PlayerRaw } from './types';
import { calculateDerivedMetrics } from './services/sheetsService';

export const appendedKickersAndDefs: PlayerRaw[] = ${JSON.stringify(kickerAndDefRawList, null, 2)};

export const rawPlayers: PlayerRaw[] = ${JSON.stringify(rawPlayersList, null, 2)};

export const players: Player[] = rawPlayers.map(p => calculateDerivedMetrics(p, rawPlayers));
`;

fs.writeFileSync(path.join(__dirname, '../src/data.ts'), tsContent, 'utf8');
console.log('Successfully wrote src/data.ts with all 232 players (200 Skill + 16 K + 16 DEF)!');
