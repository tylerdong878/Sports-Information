# NBA Player Consistency Analyzer

## Overview

This Python script analyzes NBA player performance using the `nba_api` library to identify consistent performers across three key statistical categories:

1. **Scoring Consistency**: Players who score 15+ points in each of their last 5 games
2. **Rebounding Consistency**: Players who grab 4+ rebounds in each of their last 5 games
3. **Playmaking Consistency**: Players who dish out 4+ assists in each of their last 5 games

## Features

- Dynamically determines the current NBA season
- Analyzes performance across all active NBA players
- Provides lists of players meeting specific consistency thresholds
- Includes built-in rate limiting to respect API usage

## Prerequisites

- Python 3.7+
- `nba_api` library
- Internet connection

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Sports-Information.git
   cd Sports-Information
   ```

2. Install required dependencies:
   ```bash
   pip install nba_api
   ```

## Usage

Run the script directly:
```bash
python nba_stats.py
```

The program will:
- Fetch data about active NBA players
- Analyze their performance in the current season
- Display lists of players meeting consistency criteria

## Customization

You can easily modify the script to adjust:
- Number of games to analyze
- Performance thresholds for points, rebounds, and assists
- Season to analyze

## Performance Notes

- The script processes all active NBA players
- Rate limiting is implemented to prevent API overload
- Processing time depends on the number of active players