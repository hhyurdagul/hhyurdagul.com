#!/bin/bash

fd . plugins/ site/ templates/ soupault.conf | entr -rc sh -c "rm -rf build && soupault"
