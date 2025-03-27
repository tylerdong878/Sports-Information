from nba_api.stats.endpoints import playergamelog
from nba_api.stats.static import players
import time

# Configuration
NUM_GAMES = 5
POINTS_THRESHOLD = 15
REBOUNDS_THRESHOLD = 4
ASSISTS_THRESHOLD = 4

print("NBA Player Consistency Analyzer")
print(f"Analyzing players with {POINTS_THRESHOLD}+ points, {REBOUNDS_THRESHOLD}+ rebounds, or {ASSISTS_THRESHOLD}+ assists in each of their last {NUM_GAMES} games")
print("Fetching list of active players...")

# Get all active players
all_players = players.get_active_players()
print(f"Found {len(all_players)} active players")

# Lists to hold names of qualified players
points_list = []
rebounds_list = []
assists_list = []

# Helper function to fetch recent game logs
def get_recent_stats(player_id, num_games):
    try:
        log = playergamelog.PlayerGameLog(player_id=player_id, season='2023-24', season_type_all_star='Regular Season')
        df = log.get_data_frames()[0]
        return df.head(num_games)
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return None

# Process each player
print("\nAnalyzing player performance...")
total_players = len(all_players)

for i, player in enumerate(all_players):
    pid = player['id']
    name = player['full_name']
    
    # Progress update
    progress = (i + 1) / total_players * 100
    print(f"Processing {i+1}/{total_players} ({progress:.1f}%): {name}", end="\r")
    
    stats = get_recent_stats(pid, NUM_GAMES)
    if stats is None or len(stats) < NUM_GAMES:
        continue
    
    points_check = all(row['PTS'] >= POINTS_THRESHOLD for _, row in stats.iterrows())
    rebounds_check = all(row['REB'] >= REBOUNDS_THRESHOLD for _, row in stats.iterrows())
    assists_check = all(row['AST'] >= ASSISTS_THRESHOLD for _, row in stats.iterrows())
    
    if points_check:
        points_list.append(name)
    if rebounds_check:
        rebounds_list.append(name)
    if assists_check:
        assists_list.append(name)

    # Respect NBA API rate limits
    time.sleep(0.6)

# Clear the progress line
print(" " * 100, end="\r")

# Output results
print("\n" + "="*50)
print("NBA PLAYER CONSISTENCY ANALYSIS")
print("="*50)

print(f"\nPLAYERS WITH {POINTS_THRESHOLD}+ POINTS IN EACH OF THEIR LAST {NUM_GAMES} GAMES:")
if points_list:
    for i, name in enumerate(points_list):
        print(f"{i+1}. {name}")
else:
    print("No players found meeting this criteria")

print(f"\nPLAYERS WITH {REBOUNDS_THRESHOLD}+ REBOUNDS IN EACH OF THEIR LAST {NUM_GAMES} GAMES:")
if rebounds_list:
    for i, name in enumerate(rebounds_list):
        print(f"{i+1}. {name}")
else:
    print("No players found meeting this criteria")

print(f"\nPLAYERS WITH {ASSISTS_THRESHOLD}+ ASSISTS IN EACH OF THEIR LAST {NUM_GAMES} GAMES:")
if assists_list:
    for i, name in enumerate(assists_list):
        print(f"{i+1}. {name}")
else:
    print("No players found meeting this criteria")
