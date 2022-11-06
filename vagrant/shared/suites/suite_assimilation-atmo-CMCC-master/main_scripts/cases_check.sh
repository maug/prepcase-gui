#!/bin/sh

#BSUB -n 1
#BSUB -R "span[ptile=36]"
#BSUB -q p_short
#BSUB -W 0:30
#BSUB -P R000
##BSUB -u giovanni.conti83@gmail.com
#BSUB -J check_evol
#BSUB -o check_evol.out
#BSUB -e check_evol.err
#BSUB -sla SC_dev_dart
##BSUB -I



#============================================================
#
#
#
#============================================================

echo -e "\n START CHECK JOBS\n"

# Set some env variables
SCRIPTDIR=`pwd`
echo " SCRIPTDIR= $SCRIPTDIR"

#CLONESROOT=`grep "clonesroot=" $SCRIPTDIR/cases_create.sh | \
#            sed -e "s/\\\${USER}/$USER/g;  \
#                    s/\\\${CESMEXP}/$CESMEXP/g; \
#                    s/[\",=]/ /g"`
#CLONESROOT=`echo $CLONESROOT | cut -d' ' -f3`
#echo " CLONESROOT=  $CLONESROOT"
#
#case_name=`grep "case_name=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /g; s/\"//g"`
#case_name=`echo $case_name | cut -d' ' -f2 `
#echo " case_name= $case_name"
#
#nens=`grep "nens=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /"`
#nens=`echo $nens | cut -d' ' -f2 `
#echo " nens= $nens"

source $SCRIPTDIR/cases_create_parameters.sh
echo " CLONESROOT=  $CLONESROOT"
echo " case_name= $case_name"
echo " nens= $nens"


echo ""

#============================================================
#
#
#
#============================================================


unfinished_job=0
inst=1
while (( $inst <= $nens ))
 do
   inst_string=`printf _%04d $inst`
   cd $CLONESROOT/$case_name$inst_string
   echo " Enter in: `pwd`"

   grep "MODEL EXECUTION HAS FINISHED" cesm.stdout*
   # store exit status of grep
   # if found grep will return 0 exit stauts
   # if not found, grep will return a nonzero exit stauts
   status=$?
   if [ $status -eq 0 ]
     then
      echo " job finished! "
   else
      echo " job unfinished"
      ((unfinished_job++))
   fi

  ((inst++))
done



if [ $unfinished_job -eq 0 ]
  then
    echo " All jobs finished correctly!"
else
    echo " Some jobs did not finished correctly!"
    exit 130
fi




echo -e "\n END CHECK JOBS\n"
