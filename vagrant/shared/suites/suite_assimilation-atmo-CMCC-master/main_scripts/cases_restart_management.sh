#!/bin/bash

#========================================================
#
#========================================================


CASESCONTAINER=${CASESCONTAINER:-/work/csp/${USER}/CESM2}
EXPNAME=${EXPNAME:-$1}
NENS=${NENS:-$2}
FLAG=${FLAG:-$3}


echo -e "\n START RESTART PROCEDURE \n"


echo " Container dir = $CASESCONTAINER"
echo " Experiment name = $EXPNAME"
echo " Number of instances = $NENS"
echo " FLAG = $FLAG"

# Enter in the CASESCONTAINER dir
cd $CASESCONTAINER
# Enter in each run member dir
inst=1
while (( $inst <= $NENS ))
do
  inst_string=`printf _%04d $inst`
  cd ./${EXPNAME}${inst_string}

    case $FLAG in
      "hide")
         if (($inst==1))
           then
            echo -e "\n Starting HIDE restart procedure ...\n"
         fi
         echo " member $inst of $NENS"
         mkdir -p .HIDE_restart

         # Read the check_restart.txt and remove the old restart
         if [ -f ".check_restart.txt" ]
           then
             cf=`cat .check_restart.txt | wc -l`
             # If ff is not empty remove old restart
             if (( $cf == 0 ))
               then
                echo " No restart files to delete."
             else
                ff=`cat .check_restart.txt | head -n1`
                echo " Removing files with data: ${ff}"
                rm ./run/*$ff*{nc,bin}
             fi
         fi
         # Move the new restart files in the .HIDE_restart dir
         mv ./run/${EXPNAME}*.{r,i,rs1}.* .HIDE_restart
         mv ./run/rpointer* .HIDE_restart
      ;;
      "retrieve")
         if (($inst==1))
           then
            echo -e "\n Starting RETRIEVE restart procedure\n"
         fi
         echo " member $inst of $NENS"
         # Move the restart files from .HIDE_restart dir to the main run dir
         if [ -d .HIDE_restart ]
           then
             echo " Found HIDE dir ..."
             c=`ls -a .HIDE_restart | wc -l`
             if (( ${c} == 2 ))
               then
                 echo " Empty directory"
                 echo " No old restart files found."
             else
               # Write the date on the check_restart.txt and move the files
               ff=`ls -rt1 .HIDE_restart/*.i.* | tail -n1 | cut -d'.' -f5`
               echo " Date to retrieve: ${ff}"
               echo $ff > .check_restart.txt
               mv .HIDE_restart/* run/
             fi
         else
            echo " No HIDE_restart dir found."
         fi
      ;;
      *)
         echo -e "\n Not supported parameter!\n"
         exit 130
      ;;
    esac

  pwd
  cd ../
  ((inst++))
done


echo -e "\n END RESTART PROCEDURE \n"
