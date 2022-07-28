#!/bin/bash

#===================================================
#
#
#
#===================================================
NCYCLES=100

# After the first cylce CONT_RUN must be TRUE. (Use FALSE only if it is the start.)
CONT_RUN="TRUE"

# Activate assimilation or do just a forecast
ACTIVATE_ASSI="TRUE"

# Max number of time you try to launch assimilation after failure
MAXTRY=2


echo -e "\n START CYCLES \n"
if [ $CONT_RUN = "FALSE" ]
  then
    if [ $NCYCLES -eq 1 ]
      then
        echo -e "\n Consistent values for CONTINUE_RUN and CYCLES number \n"
    else
        echo -e "\n Inconsistent values for CONTINUE_RUN and CYCLES number \n"
        exit 1
    fi
fi


# Set some env variables
SCRIPTDIR=`pwd`
echo " SCRIPTDIR= $SCRIPTDIR"

CLONESROOT=`grep "clonesroot=" $SCRIPTDIR/cases_create.sh | \
            sed -e "s/\\\${USER}/$USER/g;  \
                    s/\\\${CESMEXP}/$CESMEXP/g; \
                    s/[\",=]/ /g"`
CLONESROOT=`echo $CLONESROOT | cut -d' ' -f3`
echo " CLONESROOT=  $CLONESROOT"

case_name=`grep "case_name=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /g; s/\"//g"`
case_name=`echo $case_name | cut -d' ' -f2 `
echo " case_name= $case_name"

nens=`grep "nens=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /"`
nens=`echo $nens | cut -d' ' -f2 `
echo " nens= $nens"

radmode=`grep "RAD=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /g; s/\"//g"`
radmode=`echo $radmode | cut -d' ' -f2 `
echo " radmode= $radmode"

echo ""


#===================================================
#
#
#
#===================================================
# Take the id of the case.submit processes
take_id()
{

  output=$($*)
  echo $output | awk '{print $NF}'
}


#===================================================
#
#
#
#===================================================

ncyc=1
while (( $ncyc <= NCYCLES ))
 do

   echo -e " cycle number $ncyc"
   
   if [ $ACTIVATE_ASSI = FALSE ] 
    then
      echo " No assimilation required, proceed with forecast!"
   else
      echo " Assimilation required!"
      # Check that check_assi.flag contain 1
      grep "1" check_assi.flag
      # store exit status of grep
      # if found grep will return 0 exit stauts
      # if not found, grep will return a nonzero exit stauts
      status=$?
      if [ $status -eq 0 ]
        then
         echo " check_assi is positive! "
         sed -i 's/1/0/g' check_assi.flag
         #echo 0 > check_assi.flag
      else
         echo " last assimilation cycle had problems!"
         for(( c=1; c<=MAXTRY; c++ ))
         do
            cd $SCRIPTDIR
            echo -e "\n NEW ASSIMILATION ATTEMPT: $c of $MAXTRY\n"
            # Restore hidden files!
            #sh cases_restart_management.sh ${case_name} ${nens} "retrieve"
            bsub < cases_assimilate.csh
            grep "1" check_assi.flag
            statA=$?
            if [ $statA -eq 0 ]
              then
                #sh cases_restart_management.sh ${case_name} ${nens} "hide"
                break 
            fi  
         done
      
         grep "0" check_assi.flag
         statA=$?
         if [ $statA -eq 0 ]
          then
           echo -e "\n No assimilation attempt worked!\n"
           exit 130
         fi        
 
      fi
   fi

   

    
   # Before the case.submit we could need to restore the restart files
   #sh cases_restart_management.sh ${case_name} ${nens} "retrieve"
   
   string_id=""
   inst=1
   while (( $inst <= $nens ))
     do
       inst_string=`printf _%04d $inst`
       # Run the case
       cd $CLONESROOT/$case_name$inst_string
       echo " Enter in: `pwd`"

       # Clean
       rm cesm.std* 
 
       if [ $CONT_RUN = "FALSE" ]
          then
           ./xmlchange CONTINUE_RUN=FALSE 
       else
           ./xmlchange CONTINUE_RUN=TRUE  
       fi


       if [ $ACTIVATE_ASSI = TRUE ]
         then
           echo " Activate assimilation for member ${inst}"
           ./xmlchange DATA_ASSIMILATION_ATM=TRUE 
       else
           echo " Deactivate assimilation for member ${inst}" 
           ./xmlchange DATA_ASSIMILATION_ATM=FALSE
       fi

       jobid=$(take_id ./case.submit)
       echo " Started with $jobid"
  
       if [ $inst -eq 1 ]
         then
          string_id=$string_id" done($jobid)"
       else
          string_id=$string_id" && done($jobid)"
       fi

       ((inst++))
   done


   #echo " $string_id"
   cd $SCRIPTDIR
   echo " string_id = $string_id"
   if [ $ACTIVATE_ASSI = FALSE ]
    then
      bsub -w "$string_id" < cases_no_assimilate.sh 
   else
      bsub -w "$string_id" < cases_assimilate.csh 
   fi
   
   # Manage the restart files
   #sh cases_restart_management.sh ${case_name} ${nens} "hide"

  ((ncyc++))
done

echo -e "\n END CYCLES \n"
