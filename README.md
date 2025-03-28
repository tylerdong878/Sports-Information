# NBA Player Consistency Analyzer

## Overview

This web application analyzes NBA player performance using the `nba_api` library. Users can dynamically set thresholds to identify consistent performers across three key statistical categories:

1. **Scoring Consistency**: Players who score X+ points in each of their last Y games
2. **Rebounding Consistency**: Players who grab X+ rebounds in each of their last Y games
3. **Playmaking Consistency**: Players who dish out X+ assists in each of their last Y games

## Features

- Interactive web interface
- Dynamically set game count and performance thresholds
- Real-time analysis of NBA player statistics
- No API key required
- Responsive design

## Prerequisites

- Python 3.7+
- `nba_api` library
- Flask
- Internet connection

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Sports-Information.git
   cd Sports-Information
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

```bash
python app.py
```

Open a web browser and navigate to `http://localhost:5000`

## Usage

1. Set the number of games to analyze
2. Set thresholds for points, rebounds, and assists
3. Click "Analyze Players" to see consistent performers

## Contributing

Contributions are welcome! Please submit a Pull Request.

## License

[Specify your license here]