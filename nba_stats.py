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
print(f"Using season: {season_str}")

# Configuration for thresholds and games
NUM_GAMES = 5
POINTS_THRESHOLD = 15
REBOUNDS_THRESHOLD = 4
ASSISTS_THRESHOLD = 4

# Retrieve all active players
all_players = players.get_active_players()

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
        return None

# Process each active player
for player in all_players:
    pid = player['id']
    name = player['full_name']
    
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
    time.sleep(0.6)

# Output the results
print("Players with 15+ points in each of last 5 games:")
print(points_list)
print("\nPlayers with 4+ rebounds in each of last 5 games:")
print(rebounds_list)
print("\nPlayers with 4+ assists in each of last 5 games:")
print(assists_list)
