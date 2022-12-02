#!/bin/bash
#BSUB -n 4
#BSUB -R "span[ptile=4]"
#BSUB -q s_medium
#BSUB -W 4:00
#BSUB -P R000
#BSUB -x 
#BSUB -J create 
#BSUB -I


#===========================================================
# Generate an ensemble of clones of a particular template.
# This is useful if you plan to run an ensemble of CAM si-
# mulation on a small cluster.
#
# Here I'm considering a template that is an hybrid case!
#
#===========================================================
# Experiment name
case_name=${case_name:-"eos2noinf_v3"}

# Where to copy the clones (Use a clear name for the experiment. The dir name must 
# not appears in the case.template.original)
export clonesroot=${clonesroot:-"/users_home/csp/${USER}/${CESMEXP}/eos2noinfi_v3"}

# Number of clones
nens=${nens:-80}

# DART directory
export dartroot=${dartroot:-"/work/csp/${USER}/CMCC-DART"}

# DA working dir
tmpdir=${tmpdir:-"/work/csp/${USER}/CESM2/TMPEOS2NOINF_V3"}

# Archive (to remove previous files)
archdir=${archdir:-"/work/csp/${USER}/CESM2/archive"}

# Set the obs dir
#baseobsdir="/work/csp/${USER}/observations"
baseobsdir=${baseobsdir:-"/work/csp/gc02720/borg/observations/amsua"}

# Choose your exp template
script_name_original=${script_name_original:-"case.templateradL70.original"}

# Chose the input namelist for DART
dartnamelist=${dartnamelist:-"input.nml.original.rad"}

#TO DO: move the coefficient table in the new distribution
# Where is RTTOV
rttovdir=${rttovdir:-"/users_home/csp/${USER}/rttov123"}


# Save cases_create.sh parameters for other scripts
SCRIPT_DIR=$(pwd)
CASES_PARAMETERS_FILE=$SCRIPT_DIR/cases_create_params.sh
echo "# Automatically generated on " $(date)  >$CASES_PARAMETERS_FILE
echo export clonesroot=$clonesroot            >>$CASES_PARAMETERS_FILE
echo export CLONESROOT=$clonesroot            >>$CASES_PARAMETERS_FILE
echo export case_name=$case_name              >>$CASES_PARAMETERS_FILE
echo export nens=$nens                        >>$CASES_PARAMETERS_FILE


# ==============================================================================
# Prepare the environment
# ==============================================================================

# Load the environmental variable (CESMEXP)
. $HOME/.bashrc
source /etc/profile.d/modules.sh

## Module load
#module load intel19.5/19.5.281
#module load intel19.5/netcdf/C_4.7.2-F_4.5.2_CXX_4.3.1
#module load intel19.5/ncview/2.1.8

#module load intel19.5/cdo/1.9.8
#module load intel19.5/magics/3.3.1
#module load intel19.5/proj/6.2.1
#module load intel19.5/udunits/2.2.26
#module load intel19.5/szip/2.1.1
#module load intel19.5/eccodes/2.12.5

#module load intel19.5/nco/4.8.1
#module load ncl/6.6.2

echo " "
module list
echo " "

# ==============================================================================
# standard commands:
#
# Make sure that this script is using standard system commands
# instead of aliases defined by the user.
# If the standard commands are not in the location listed below,
# change the 'set' commands to use them.
# The verbose (-v) argument has been separated from these command definitions
# because these commands may not accept it on some systems.  On those systems
# set VERBOSE = ''
# ==============================================================================

VERBOSE='-v'
MOVE='/usr/bin/mv'
COPY='/usr/bin/cp --preserve=timestamps'
LINK='/usr/bin/ln -s'
LIST='/usr/bin/ls'
REMOVE='/usr/bin/rm -f'

maindir=`pwd`


echo -e "\n START EXPERIMENT CREATION \n"

script_name="case.template"
${COPY} ${dartnamelist} input.nml
sed -i "s/NUM_INSTANCE_TEMPLATE/${nens}/g" input.nml

echo -e "\n Remove dir of a previus experiment with the same name if it exists!\n"
if [ -d ${archdir}/${case_name} ]; then
   ${REMOVE} -r ${archdir}/${case_name}
fi 
if [ -d ${tmpdir} ]; then
   ${REMOVE} -r ${tmpdir}
fi 
if [ -d ${clonesroot} ]; then
   ${REMOVE} -r ${clonesroot}
   ${REMOVE} -r /work/csp/${USER}/CESM2/${case_name}_*
fi

# if forecast active in the previous experiment
dirff=/work/csp/${USER}/cesm-exp/${case_name}-forecast
if [ -d ${dirff} ]; then
   ${REMOVE} -r ${dirff}
   ${REMOVE} -r /work/csp/${USER}/CESM2/${case_name}_f_*
fi



# set the obs dir
${COPY} cases_assimilate_template.csh cases_assimilate.csh
sed -i "s@TEMPLATE_OBS_EXP@${baseobsdir}@g" cases_assimilate.csh




containerdir=`echo ${clonesroot} | cut -d'/' -f6`
${COPY} ../case_archive/${script_name_original} ../case_archive/${script_name}
sed -i "s/TEMPLATE_DIR_EXP/${containerdir}/g" ../case_archive/${script_name}


#===========================================================
#
#===========================================================
# Create the first case

echo -e "Phase 1 (start): creation of a new case from template ...\n"

csh ../case_archive/${script_name} 



case=`awk '/setenv case /{print $NF}' ../case_archive/$script_name`
cesmroot=`awk '/setenv cesmroot/{print $NF}' ../case_archive/$script_name | \
          sed "s/\\\${USER}/$USER/g;\
               s/\\\${CESMDIR}/$CESMDIR/g"`
caseroot=`awk '/setenv caseroot/{print $NF}' ../case_archive/$script_name| \
          sed "s/\\\${USER}/$USER/g;\
               s/\\\${CESMEXP}/$CESMEXP/g;\
               s/\\\${case}/$case/g"`


echo -e "Template case created"
echo -e "Phase 1 (end)\n"


#===========================================================
#
#===========================================================
# Clone the case nens time

echo -e "Phase 2 (start): creation of the clones ...\n"

inst=1
while (($inst<= $nens))
do
   echo -e "member $inst\n"

   # Following the CESM strategy for 'inst_string'
   inst_string=`printf _%04d $inst`
   
   new_case="$clonesroot/$case_name$inst_string"
   # Create the clone 
   ${cesmroot}/cime/scripts/create_clone \
      --case     $new_case          \
      --clone    $caseroot          \





   # Modify the I.C. for each clone, then  build
   # Remember that each job contain ONLY one member
   cd $new_case
   
   sed -i "s/_0001/$inst_string/g" user_nl_cam_0001  
   ${MOVE} user_nl_cam_0001 user_nl_cam
   sed -i "s/_0001/$inst_string/g" user_nl_cice_0001  
   ${MOVE} user_nl_cice_0001 user_nl_cice
   ${MOVE} user_nl_clm_0001 user_nl_clm
   
   RUNDIR=`./xmlquery RUNDIR       --value`
   refcase=`./xmlquery RUN_REFCASE --value`
   stagedir=`./xmlquery RUN_REFDIR --value`
   refdate=`./xmlquery RUN_REFDATE --value`
   reftod=`./xmlquery RUN_REFTOD   --value`
   COMP_ROF=`./xmlquery COMP_ROF   --value`   
   init_time="${refdate}-$reftod"
   

   
   #echo "finidat='${refcase}.clm2${inst_string}.r.${init_time}.nc'">> user_nl_clm
   #echo "finidat_rtm='${refcase}.mosart${inst_string}.r.${init_time}.nc'">> user_nl_mosart
   #sed -i "s/ICE_IC_TEMPLATE/${refcase}.cice${inst_string}.r.${init_time}.nc/g" user_nl_cice
   echo "finidat='${refcase}${inst_string}.clm2.r.${init_time}.nc'">> user_nl_clm
   echo "finidat_rtm='${refcase}${inst_string}.mosart.r.${init_time}.nc'">> user_nl_mosart
   sed -i "s/ICE_IC_TEMPLATE/${refcase}${inst_string}.cice.r.${init_time}.nc/g" user_nl_cice
   sed -i "s/NCDATA_TEMPLATE/cam_initial${inst_string}.nc/g" user_nl_cam
 
#   ./preview_namelists || exit 75

   echo "Staging initial files for instance $inst of $nens"

   cd $RUNDIR
   #${LINK} -f ${stagedir}/${refcase}.clm2${inst_string}.r.${init_time}.nc  .
   #${LINK} -f ${stagedir}/${refcase}.cice${inst_string}.r.${init_time}.nc  .
   #${LINK} -f ${stagedir}/${refcase}.cam${inst_string}.i.${init_time}.nc   cam_initial${inst_string}.nc
   #${LINK} -f ${stagedir}/${refcase}.mosart${inst_string}.r.${init_time}.nc .

   ${LINK} -f ${stagedir}/${refcase}${inst_string}.clm2.r.${init_time}.nc  .
   ${LINK} -f ${stagedir}/${refcase}${inst_string}.cice.r.${init_time}.nc  .
   ${LINK} -f ${stagedir}/${refcase}${inst_string}.cam.i.${init_time}.nc   cam_initial${inst_string}.nc
   ${LINK} -f ${stagedir}/${refcase}${inst_string}.mosart.r.${init_time}.nc .
   
   # Build the case

   cd $new_case
   echo ''
   echo 'Copy executable'
   echo ''

   ./xmlchange --file env_build.xml --id BUILD_COMPLETE --val TRUE
   ./xmlchange --file env_build.xml --id BUILD_STATUS --val 0
   cp /work/csp/${USER}/CESM2/case_template/bld/cesm.exe  ${RUNDIR}/../bld/cesm.exe


   ((inst++))
done

echo -e "Phase 2 (end): \n"

echo -e "Copy DART necessary files  in the tmp working dir"
mkdir $tmpdir
${MOVE} ${maindir}/input.nml $tmpdir/.
${COPY} $tmpdir/input.nml $tmpdir/input.nml.original
${COPY} $dartroot/d4o/flattened/cam-fv/filter.dir/filter $tmpdir/.
${COPY} $dartroot/d4o/flattened/cam-fv/fill_inflation_restart.dir/fill_inflation_restart  $tmpdir/.

${COPY} $dartroot/assimilation_code/programs/gen_sampling_err_table/work/sampling_error_correction_table.nc $tmpdir/.

echo " Copy RTTOV db file"
${COPY} $dartroot/observations/forward_operators/rttov_sensor_db.csv $tmpdir/.
${COPY} ${rttovdir}/rtcoef_rttov12/rttov7pred54L/rtcoef_eos_2_amsua.dat  $tmpdir/.


echo -e "\n Modify case_assimilate.sh using the right number of nodes! TO DO!!!!\n"


echo -e "\n END EXPERIMENT CREATION \n"

