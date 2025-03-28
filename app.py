import datetime
import time
import json
from flask import Flask, render_template, request, jsonify, Response, stream_with_context
from nba_api.stats.endpoints import playergamelog
from nba_api.stats.static import players
import pandas as pd

app = Flask(__name__)

def get_current_season():
    today = datetime.date.today()
    year = today.year
    if today.month >= 10:
        season_start = year
        season_end = year + 1
    else:
        season_start = year - 1
        season_end = year
    return f"{season_start}-{str(season_end)[2:]}"

def get_recent_stats(player_id, num_games, season):
    try:
        log = playergamelog.PlayerGameLog(
            player_id=player_id, 
            season=season, 
            season_type_all_star='Regular Season'
        )
        df = log.get_data_frames()[0]
        return df.head(num_games)
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['GET', 'POST'])
def analyze():
    if request.method == 'GET':
        data = request.args
    else:
        data = request.json
        
    num_games = int(data.get('num_games', 5))
    points_threshold = int(data.get('points_threshold', 15))
    rebounds_threshold = int(data.get('rebounds_threshold', 4))
    assists_threshold = int(data.get('assists_threshold', 4))
    
    return Response(stream_with_context(generate_analysis(
        num_games, 
        points_threshold, 
        rebounds_threshold, 
        assists_threshold
    )), mimetype='text/event-stream')

def generate_analysis(num_games, points_threshold, rebounds_threshold, assists_threshold):
    season = get_current_season()
    all_players = players.get_active_players()
    total_players = len(all_players)
    
    # Initialize
    yield f"data: {json.dumps({'type': 'init', 'message': f'NBA Player Consistency Analyzer'})}\n\n"
    yield f"data: {json.dumps({'type': 'season', 'message': f'Using NBA season: {season}'})}\n\n"
    yield f"data: {json.dumps({'type': 'config', 'message': f'Analyzing players with {points_threshold}+ points, {rebounds_threshold}+ rebounds, or {assists_threshold}+ assists in each of their last {num_games} games'})}\n\n"
    yield f"data: {json.dumps({'type': 'players', 'message': f'Found {total_players} active players'})}\n\n"
    yield f"data: {json.dumps({'type': 'start', 'message': 'Analyzing player performance...'})}\n\n"
    
    # Results storage
    points_list = []
    rebounds_list = []
    assists_list = []
    
    # Process each player
    for i, player in enumerate(all_players):
        pid = player['id']
        name = player['full_name']
        
        # Calculate progress
        progress = (i + 1) / total_players * 100
        bar_length = 20
        filled_length = int(bar_length * (i + 1) // total_players)
        bar = '█' * filled_length + '░' * (bar_length - filled_length)
        
        # Send progress update
        progress_msg = {
            'type': 'progress',
            'player': name,
            'current': i + 1,
            'total': total_players,
            'percentage': progress,
            'bar': bar
        }
        yield f"data: {json.dumps(progress_msg)}\n\n"
        
        # Get and analyze stats
        stats = get_recent_stats(pid, num_games, season)
        if stats is None or len(stats) < num_games:
            continue
        
        points_check = all(row['PTS'] >= points_threshold for _, row in stats.iterrows())
        rebounds_check = all(row['REB'] >= rebounds_threshold for _, row in stats.iterrows())
        assists_check = all(row['AST'] >= assists_threshold for _, row in stats.iterrows())
        
        if points_check:
            points_list.append(name)
        if rebounds_check:
            rebounds_list.append(name)
        if assists_check:
            assists_list.append(name)
        
        # Respect rate limits - increased to 0.6 seconds to match nba_stats.py
        time.sleep(0.6)
    
    # Send results
    results = {
        'type': 'results',
        'points': points_list,
        'rebounds': rebounds_list,
        'assists': assists_list,
        'thresholds': {
            'games': num_games,
            'points': points_threshold,
            'rebounds': rebounds_threshold,
            'assists': assists_threshold
        }
    }
    yield f"data: {json.dumps(results)}\n\n"

if __name__ == '__main__':
    app.run(debug=True)
