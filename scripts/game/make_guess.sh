#!/bin/bash

# Check if game ID is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <game_id>"
  exit 1
fi

GAME_ID="$1"
URL="http://localhost:5056/api/game/$GAME_ID/guess"

# Check if names.txt exists
if [ ! -f "names.txt" ]; then
  echo "Error: names.txt not found."
  exit 1
fi

# Pick two random names and join them with a space
RANDOM_GUESS=$(shuf -n 2 names.txt | paste -sd ' ')

# Build JSON body
# Pick a random name for the user
RANDOM_USER=$(shuf -n 1 names.txt)

# Build JSON body
JSON_BODY=$(jq -n --arg user "$RANDOM_USER" --arg guess "$RANDOM_GUESS" \
  '{user: $user, guess: $guess}')

echo "Making guess: $RANDOM_GUESS"

# Make the POST request
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "$JSON_BODY" > /dev/null
