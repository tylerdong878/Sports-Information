#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status
set -x  # Print commands and their arguments as they are executed

# Deployment script for NBA Player Consistency Analyzer

# Ensure we're in the correct directory
cd /opt/build/repo

# Ensure Python and venv are available
python3 --version
python3 -m venv venv

# Activate virtual environment
. venv/bin/activate

# Ensure pip is installed in the virtual environment
python3 -m ensurepip --upgrade

# Upgrade pip
python3 -m pip install --upgrade pip

# Install dependencies
python3 -m pip install -r requirements.txt

# Remove problematic files with special characters
find venv -type f \( -name "*#*" -o -name "*?*" \) -delete

# Print Python and package versions for debugging
python3 --version
python3 -m pip list

# Additional cleanup
rm -rf venv/lib/python3.11/site-packages/pandas/tests/io/data/legacy_pickle/*

# Deactivate virtual environment
deactivate

echo "Deployment preparation complete!"
