#!/bin/bash

rm -rf build
fd . | entr -rc soupault 
