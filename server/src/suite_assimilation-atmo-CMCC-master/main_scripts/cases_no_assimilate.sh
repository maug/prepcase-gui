#!/bin/bash

#BSUB -n 1
#BSUB -R "span[ptile=1]"
#BSUB -q p_short
#BSUB -W 0:30
#BSUB -P R000
#BSUB -J cases_no_assimilate
##BSUB -sla SC_dev_dart
#BSUB -I

#============================================================
#
#============================================================

echo -e "\n `date` -- NO ASSIMILATION --\n"

sh cases_check.sh

echo -e "\n Starting the next evolution cycles\n"


# Restart management




