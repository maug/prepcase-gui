#!/bin/bash

SELF=$(basename $BASH_SOURCE)

echo "$SELF PARAM1: $PARAM1"
echo "$SELF PARAM2: $PARAM2"
echo "Running infinite loop..."
for ((i=1; i<1000000; i++))
do
  echo "Pass $i"
  sleep 1
done
echo "$SELF END"
