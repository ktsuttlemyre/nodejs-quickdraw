#!/bin/bash
set -e
set -x
set -o pipefail

_term() { 
  echo "Caught SIGTERM signal!"
  echo "Stopping server"
  kill -TERM "$P1" 2>/dev/null
  if [ $P2 ]; then
    echo "Stopping client"
    kill -TERM "$P2" 2>/dev/null
  fi
}

trap _term SIGTERM
trap _term SIGINT
trap _term SIGKILL
trap _term SIGQUIT
trap _term SIGABRT
trap _term SIGSTOP
trap _term SIGTSTP

#setting envirnoment variable $MODE will change the mode of opperation

if [ "$MODE" = "train" ]; then
    echo "Training the model"

    # Download the quickdraw dataset files
    ts-node ./script.ts download 10 &
    P1=$!
    wait $P1
    #Generate label types
    ts-node ./script.ts create training &
    # <training | validation | testing >
    P1=$!
    wait $P1
    #Train the model
    ts-node ./script.ts train &
    P1=$!
    wait $P1
else
    echo "Using the pre-trained model"

    # runs 2 commands simultaneously:

    #See in action
    #In this repository the model is deployed server side. But in can be possible to deploy it directly in the browser.
    # launch the server
    #su - user -c 'ts-node server/server.ts' &
    ts-node server/server.ts &
    P1=$!
    # launch the client
    npx parcel client/index.html &
    P2=$!
    wait $P1 $P2
fi
