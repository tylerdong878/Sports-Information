# Sports-Information

## NBA Player Consistency Analyzer

This project analyzes NBA player performance using the balldontlie API to identify consistent performers across three key statistics:

1. Players who score 15+ points in each of their last 5 games
2. Players who grab 4+ rebounds in each of their last 5 games
3. Players who dish out 4+ assists in each of their last 5 games

### Setup and Installation

1. Make sure you have Python 3.7+ installed
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Set up your API key:
   - Create a `.env` file in the project root (or edit the existing one):
   ```
   NBA_API_KEY=your_api_key_here
   ```

### Usage

Simply run the script:
```
python nba_stats.py
```

The program will:
1. Fetch data about NBA players
2. Analyze their last 5 games
3. Display lists of players meeting each consistency criteria

### Notes

- The API has rate limits, so the script includes delays between requests
- By default, analysis is limited to the first 50 players returned by the API to avoid long processing times
- You can adjust this limit in the code by changing the `max_players` parameter in the `analyze_players` method
- The `.env` file is included in `.gitignore` to prevent your API key from being committed to the repository