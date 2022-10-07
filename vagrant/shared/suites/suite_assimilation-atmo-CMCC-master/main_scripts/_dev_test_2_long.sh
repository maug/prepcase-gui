#!/bin/bash

SELF=$(basename $BASH_SOURCE)

echo "$SELF PARAM1: $PARAM1"
echo "$SELF PARAM2: $PARAM2"
echo "sleeping for 30 sec..."
sleep 30
echo "$SELF END"
