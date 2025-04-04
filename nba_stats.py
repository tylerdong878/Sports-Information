import datetime
import time
from nba_api.stats.endpoints import playergamelog
from nba_api.stats.static import players

# Dynamically calculate the current NBA season
today = datetime.date.today()
year = today.year
if today.month >= 10:
    season_start = year
    season_end = year + 1
else:
    season_start = year - 1
    season_end = year
season_str = f"{season_start}-{str(season_end)[2:]}"

print("NBA Player Consistency Analyzer")
print(f"Using NBA season: {season_str}")

# Configuration for thresholds and games
NUM_GAMES = 5
POINTS_THRESHOLD = 15
REBOUNDS_THRESHOLD = 4
ASSISTS_THRESHOLD = 4

print(f"Analyzing players with {POINTS_THRESHOLD}+ points, {REBOUNDS_THRESHOLD}+ rebounds, or {ASSISTS_THRESHOLD}+ assists in each of their last {NUM_GAMES} games")
print("Fetching list of active players...")

# Retrieve all active players
all_players = players.get_active_players()
print(f"Found {len(all_players)} active players")

# Lists to hold names of qualified players
points_list = []
rebounds_list = []
assists_list = []

# Helper function to fetch the recent game logs for a player
def get_recent_stats(player_id, num_games):
    try:
        # Retrieve player's game log for the current season (Regular Season)
        log = playergamelog.PlayerGameLog(player_id=player_id, season=season_str, season_type_all_star='Regular Season')
        df = log.get_data_frames()[0]
        # Return the most recent 'num_games' games
        return df.head(num_games)
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return None

# Process each player
print("\nAnalyzing player performance...")
total_players = len(all_players)
processed = 0
successful = 0

for i, player in enumerate(all_players):
    pid = player['id']
    name = player['full_name']
    
    # Enhanced progress display
    progress = (i + 1) / total_players * 100
    bar_length = 20
    filled_length = int(bar_length * (i + 1) // total_players)
    bar = '█' * filled_length + '░' * (bar_length - filled_length)
    
    print(f"Processing: [{bar}] {progress:.1f}% | Player {i+1}/{total_players}: {name}", end="\r", flush=True)
    
    stats = get_recent_stats(pid, NUM_GAMES)
    if stats is None or len(stats) < NUM_GAMES:
        continue
    
    # Check if the player meets all criteria in each of the last NUM_GAMES
    points_check = all(row['PTS'] >= POINTS_THRESHOLD for _, row in stats.iterrows())
    rebounds_check = all(row['REB'] >= REBOUNDS_THRESHOLD for _, row in stats.iterrows())
    assists_check = all(row['AST'] >= ASSISTS_THRESHOLD for _, row in stats.iterrows())
    
    if points_check:
        points_list.append(name)
    if rebounds_check:
        rebounds_list.append(name)
    if assists_check:
        assists_list.append(name)

    # Respect rate limits of the NBA API

# Clear the progress line
print(" " * 100, end="\r")

# Output results in the requested format
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
