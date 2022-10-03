#!/bin/csh
#BSUB -n 360
#BSUB -R "span[ptile=36]"
#BSUB -q p_short
#BSUB -W 1:00
#BSUB -P R000
#BSUB -x
##BSUB -u giovanni.conti83@gmail.com
#BSUB -J cases_assimilate
##BSUB -o assimilate.out
##BSUB -e assimilate.err
#BSUB -I


echo "start"

source /usr/share/Modules/init/csh
module purge
module load intel20.1/20.1.217 intel20.1/szip/2.1.1 cmake/3.17.3 curl/7.70.0 impi20.1/19.7.217 impi20.1/hdf5/1.12.0 impi20.1/netcdf/C_4.7.4-F_4.5.3_CXX_4.3.1 impi20.1/parallel-netcdf/1.12.1 impi20.1/esmf/8.0.1-intelmpi-64-g
setenv  XIOS_PATH /work/csp/cmip01/csm/xios
# check if 0
setenv I_MPI_EXTRA_FILESYSTEM 1
# check for comment
setenv I_MPI_EXTRA_FILESYSTEM_FORCE gpfs
setenv MPI_COMM_MAX 16383
setenv I_MPI_DEBUG 60
#setenv GPFSMPIO_TUNEBLOCKING=0
# check for comment
setenv I_MPI_PLATFORM skx
# check for comment
setenv I_MPI_SHM skx_avx512
setenv I_MPI_HYDRA_BOOTSTRAP lsf
#setenv I_MPI_LSF_USE_COLLECTIVE_LAUNCH 0
setenv I_MPI_HYDRA_COLLECTIVE_LAUNCH 1
setenv I_MPI_HYDRA_BRANCH_COUNT 10 # it must be equal to the number of nodes!!!!!!!!!
# PAY ATTENTION TO LAUNCHCMD BELOW !!!!

# We need more modules to use correctly this script
# for ncks load nco
#module load intel19.5/nco/4.8.1
module load intel20.1/nco/4.9.3
module load intel20.1/magics/3.3.1
module load intel20.1/eccodes/2.17.0
module load ncl/6.6.2

echo "after module load"
module list

# When run the assimilation use all the processors in all nodes
set nproc_used=`echo "$I_MPI_HYDRA_BRANCH_COUNT * 36" | bc`
echo -e "\n Num. processor used: $nproc_used \n"
setenv LAUNCHCMD "mpirun -np $nproc_used -bind-to none"



# DART software - Copyright UCAR. This open source software is provided
# by UCAR, "as is", without charge, subject to all terms of use at
# http://www.image.ucar.edu/DAReS/DART/DART_download
#
# DART $Id$

# ------------------------------------------------------------------------------
# Purpose: assimilate with a CAM ensemble and perform advanced archiving
#          and compression in support of multiple assimilation cycles in a
#          single CESM job.
#
# The (resulting) assimilate.csh script is called by CESM with two arguments:
# 1) the CASEROOT, and
# 2) the assimilation cycle number in this CESM job
# ------------------------------------------------------------------------------
# This template is lightly modified by the setup scripts to be appropriate
# for specific hardware and other configurations. The modified result is
# then given execute permission and is appropriate to use for an assimilation.
# All of this is automatically performed by the DART-supplied setup scripts.
#
# Tag DART's state output with names using CESM's convention:
#    ${case}.${scomp}[_$inst].${filetype}[.$dart_file].${date}.nc
#    These should all be named with $scomp = "cam" to distinguish
#    them from the same output from other components in multi-component assims.
#
# This script also has logic in it to manage disk space in a way that allows
# for more assimilation cycles to be performed before archiving without losing
# critical restart capability. The same logic is also useful for assimilations
# that may require multiple timesteps to be available.
#
# As a specific example, consider the case when 3 assimilation cycles have been
# performed: 6Z, 12Z, 18Z.
# If we want to keep a restart set and a backup
# restart set, we only need the 18Z and 12Z, so the 6Z set can be removed.
# Let's also say that its the last cycle of job - which automatically kicks off
# the short-term archiver. If we did 'nothing', the 12Z and 18Z get archived
# and the 18Z gets restaged

# machine-specific dereferencing

#if ($?SLURM_JOB_ID) then

#    echo "SLURM"
#   # SLURM environment variables:
#   # env | grep SLURM | sort
#
#   setenv ORIGINALDIR $SLURM_SUBMIT_DIR
#   setenv     JOBNAME $SLURM_JOB_NAME
#   setenv       JOBID $SLURM_JOBID
#   setenv     MYQUEUE $SLURM_JOB_PARTITION
#   setenv   NODENAMES $SLURM_NODELIST
#   setenv LAUNCHCMD "mpirun -np $SLURM_NTASKS -bind-to core"
##  untested method for determining NUMTASKS_PERNODE with SLURM
##  set ANY_OLD_NODE = `head -n 1 $SLURM_NODELIST`
##  setenv NUMTASKS_PERNODE `grep $ANY_OLD_NODE $SLURM_NODELIST | wc -l`
#
#else if ($?PBS_NODEFILE) then

#    echo "PBS"
#
#   # PBS environment variables:
#   # env | grep PBS | sort
#
#   setenv ORIGINALDIR $PBS_O_WORKDIR
#   setenv     JOBNAME $PBS_JOBNAME
#   setenv       JOBID $PBS_JOBID
#   setenv     MYQUEUE $PBS_O_QUEUE
#   setenv     NUMCPUS $NCPUS
#   setenv    NUMTASKS `cat  $PBS_NODEFILE | wc -l`
#   setenv    NUMNODES `uniq $PBS_NODEFILE | wc -l`
#   set ANY_OLD_NODE = `head -n 1 $PBS_NODEFILE`
#   setenv    NUMTASKS_PERNODE `grep $ANY_OLD_NODE $PBS_NODEFILE | wc -l`
#   setenv  MPIEXEC_MPT_DEBUG 0
#   setenv MP_DEBUG_NOTIMEOUT yes
#   setenv          LAUNCHCMD mpiexec_mpt
#
#   echo "jobname        : $JOBNAME"
#   echo "numcpus        : $NUMCPUS"
#   echo "numtasks       : $NUMTASKS"
#   echo "numnodes       : $NUMNODES"
#   echo "tasks_per_node : $NUMTASKS_PERNODE"
#   echo " "
#
#else if ($?LSB_HOSTS) then

#    echo "LSB"

#   # LSF environment variables:
#   # env | grep LS | grep -v LS_COLORS | sort

#   setenv ORIGINALDIR $LS_SUBCWD
#   setenv     JOBNAME $LSB_OUTPUTFILE:ar
#   setenv       JOBID $LSB_JOBID
#   setenv     MYQUEUE $LSB_QUEUE
#   setenv   NODENAMES ${LSB_HOSTS}
#   setenv MP_DEBUG_NOTIMEOUT yes
#   set NUMTASKS_PERNODE='36'
##   setenv LAUNCHCMD mpirun.lsf
##   setenv LAUNCHCMD mpirun
##   setenv LAUNCHCMD "mpirun"
##   setenv LAUNCHCMD "mpirun -np 1 -bind-to core"
#   setenv LAUNCHCMD "mpirun -np 324 -bind-to none"
#   module list
##  untested method for determining NUMTASKS_PERNODE with LSF
##  setenv NUMTASKS_PERNODE \
##     `echo $LSB_SUB_RES_REQ | sed -ne '/ptile/s#.*\[ptile=\([0-9][0-9]*\)]#\1#p'`

#endif

#   set MP_DEBUG_NOTIMEOUT='yes'
  # set LAUNCHCMD='mpirun.lsf'

   #setenv LAUNCHCMD "mpirun -np 1 -bind-to core"
   #setenv LAUNCHCMD "mpirun -np 1"





# ==============================================================================
# Block 0: Set command environment
# ==============================================================================
# This block is an attempt to localize all the machine-specific
# changes to this script such that the same script can be used
# on multiple platforms. This will help us maintain the script.

echo "`date` -- BEGIN CAM_ASSIMILATE"

set nonomatch      # suppress "rm" warnings if wildcard does not match anything


# CESM uses C indexing on loops; cycle = [0,....,$DATA_ASSIMILATION_CYCLES - 1]
# "Fix" that here, so the rest of the script isn't confusing.

#@ cycle = $2 + 1


# Set some env variables
set SCRIPTDIR=`pwd`
echo "SCRIPTDIR= $SCRIPTDIR"

set CLONESROOT=`grep "clonesroot=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /; s/USER/$USER/; s/CESMEXP/$CESMEXP/"`
set CLONESROOT=$CLONESROOT[3]
set CLONESROOT=`echo $CLONESROOT | sed -e 's/"//g; s/\$//g'`
#set CLONESROOT=`echo $CLONESROOT | sed -e 's/\$//g'`
echo " CLONESROOT=  $CLONESROOT"

set case_name=`grep "case_name=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /g"`
set case_name=`echo $case_name | sed -e 's/"//g'`
set case_name=$case_name[2]
echo " case_name= $case_name"

set radmode=`grep "RAD=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /g"`
set radmode=`echo $radmode | sed -e 's/"//g'`
set radmode=$radmode[2]
echo " radmode= $radmode"

set CASEROOT0001="$CLONESROOT/${case_name}_0001"
echo " CASEROOT0001= $CASEROOT0001"

cd ${CASEROOT0001}

echo " xmlquery start"
setenv scomp                     `./xmlquery COMP_ATM      --value`
setenv CASE                      `./xmlquery CASE          --value`
setenv ensemble_size             `./xmlquery NINST_ATM     --value`
setenv CAM_DYCORE                `./xmlquery CAM_DYCORE    --value`
setenv EXEROOT                   `./xmlquery EXEROOT       --value`
setenv RUNDIR                    `./xmlquery RUNDIR        --value`
setenv archive                   `./xmlquery DOUT_S_ROOT   --value`
setenv TOTALPES                  `./xmlquery TOTALPES      --value`

setenv CONT_RUN                  `./xmlquery CONTINUE_RUN  --value`
# when you make a long forecast run without assimilation and then you want to assimilate obs but you do not have
# inflation files then  force one cycle CONT_RUN FALSE
#setenv CONT_RUN                  FALSE

setenv CHECK_TIMING              `./xmlquery CHECK_TIMING  --value`
setenv DATA_ASSIMILATION_CYCLES  `./xmlquery DATA_ASSIMILATION_CYCLES --value`
echo " xmlquery end"



set nens=`grep "nens=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /"`
set nens=$nens[2]
set TOTALPES=`echo $TOTALPES*$nens | bc`
echo " TOTALPES= $TOTALPES"


set TMPROOT=`grep "tmpdir=" $SCRIPTDIR/cases_create.sh | sed -e "s/=/ /; s/USER/$USER/"`
set TMPROOT=$TMPROOT[2]
set TMPROOT=`echo $TMPROOT | sed -e 's/\$//g; s/"//g'`
echo " TMPROOT= $TMPROOT"

set CASESRUNROOT=`echo $RUNDIR | sed -e "s/\/${case_name}_0001\/run//g" `
echo " CASESRUNROOT= $CASESRUNROOT"
#set scomp="cam"
#set CASE="dart_hybrid_2017_v3"
#set ensemble_size="3"
#set CAM_DYCORE="fv"
#set EXEROOT="/work/csp/gc02720/CESM2/dart_hybrid_2017_v3/bld"
#set RUNDIR="/work/csp/gc02720/CESM2/dart_hybrid_2017_v3/run"
#set archive="/work/csp/gc02720/CESM2/archive"
#set TOTALPES="324"
#set CONT_RUN="FALSE"
#set CHECK_TIMING="FALSE"
#set DATA_ASSIMILATION_CYCLES="1"

#setenv ORIGINALDIR $LS_SUBCWD
##setenv     JOBNAME $LSB_OUTPUTFILE:ar
#setenv       JOBID $LSB_JOBID
#setenv     MYQUEUE $LSB_QUEUE
##   setenv   NODENAMES ${LSB_HOSTS}
setenv MP_DEBUG_NOTIMEOUT yes
set NUMTASKS_PERNODE='36'
#setenv LAUNCHCMD "mpirun -np $TOTALPES -bind-to none"
#setenv LAUNCHCMD "mpirun -np 360 -bind-to none"





# Check if the CESM evolution finished correctly
cd ${SCRIPTDIR}
sh cases_check.sh #now also in merge



cd ${RUNDIR}
echo "rundir"
pwd

# A switch to save all the inflation files
set save_all_inf="TRUE"

# This may be needed before the short-term archiver has been run.
if (! -d ${archive}/esp/hist) mkdir -p ${archive}/esp/hist

# If they exist, mean and sd will always be saved.
# A switch to signal how often to save the stages' ensemble members.
#     valid values are:  NONE, RESTART_TIMES, ALL
set save_stages_freq="RESTART_TIMES"

# This next line ultimately specifies the location of the observation files.
#set BASEOBSDIR = "/work/csp/gc02720/observations/201701_6H_CESM"
set BASEOBSDIR = "/work/csp/$USER/observations"

# suppress "rm" warnings if wildcard does not match anything
set nonomatch

# Make sure that this script is using standard system commands
# instead of aliases defined by the user.
# If the standard commands are not in the location listed below,
# change the 'set' commands to use them.
# The VERBOSE options are useful for debugging, but are optional because
# some systems don't like the -v option to any of the following.

set   MOVE = '/usr/bin/mv -v'
set   COPY = '/usr/bin/cp -v --preserve=timestamps'
set   LINK = '/usr/bin/ln -s'
set   LIST = '/usr/bin/ls '
set REMOVE = '/usr/bin/rm -r'

# ==============================================================================
# Block 1: Determine time of current model state from file name of member 1
# These are of the form "${CASE}.cam_${ensemble_member}.i.2000-01-06-00000.nc"
# ==============================================================================

# Piping stuff through 'bc' strips off any preceeding zeros.

set FILE = `head -n 1 rpointer.atm`
set FILE = $FILE:r
set ATM_DATE_EXT = $FILE:e
set ATM_DATE     = `echo $FILE:e | sed -e "s#-# #g"`
set ATM_YEAR     = `echo $ATM_DATE[1] | bc`
set ATM_MONTH    = `echo $ATM_DATE[2] | bc`
set ATM_DAY      = `echo $ATM_DATE[3] | bc`
set ATM_SECONDS  = `echo $ATM_DATE[4] | bc`
set ATM_HOUR     = `echo $ATM_DATE[4] / 3600 | bc`

echo "valid time of model is $ATM_YEAR $ATM_MONTH $ATM_DAY $ATM_SECONDS (seconds)"
echo "valid time of model is $ATM_YEAR $ATM_MONTH $ATM_DAY $ATM_HOUR (hours)"


# Move the previous inflation restart in the TMPDIR (both mean and sd)
cd ${TMPROOT}
set  INFVAL = `grep inf_flavor input.nml`
set  INFVAL = `echo $INFVAL | sed -e "s#[=,'\.]# #g"`
set  INFVAL = $INFVAL[2]
echo "INFVAL = $INFVAL"
if ( $INFVAL == 0 ) then
  echo  " No inflation used. Inflations files not restaged from previous run if any exist."
else
  echo  " Inflation used. Restage  previous inflation files if any exist."
  if ( -d .HIDE_${case_name} ) then
    echo " Found HIDE dir ..."
    set c=`ls -a .HIDE_${case_name} | wc | awk '{print $1}'`
    if ( "${c}" == 2 ) then
       echo " Empty directory"
       echo " No old inflation files found."
    else
       ${MOVE} .HIDE_${case_name}/* .
       # Get the date of this inflation restart file so you can remove it at the end
       set inf_prev_date_files = `ls -rt1 *dart.rh.cam_*inf_mean*`
       set inf_prev_date_files = `echo $inf_prev_date_files[1] | cut -d'.' -f5`
       echo " Old inflation date in hide = $inf_prev_date_files "
    endif
  else
    echo " No HIDE dir found."
    set c = 2
  endif
endif



# Move the hidden restart set back into $rundir so that it is processed properly.

#cd ../../
#set inst=1
#while ( $inst <= $nens )
#  set inst_string=`printf _%04d $inst`
#  cd ./$case_name$inst_string
#  ${LIST} -d ./Hide$inst_string*
#  if ($status == 0) then
#    echo 'Moving hidden restarts into the run directory so they can be used or purged.'
#    ${MOVE} ./Hide$inst_string*/* ./run
#    rmdir   ./Hide$inst_string*
#  endif
#  cd ../
#  @ inst++
#end



# We need to know the names of the current cesm.log files - one log file is created
# by each CESM model advance.

#set log_list = `${LIST} -t cesm.log.*`

#echo "most recent log is $log_list[1]"
#echo "oldest      log is $log_list[$#log_list]"
#echo "entire log list is $log_list"
#echo " "

# ==============================================================================
# Block 2: Populate a run-time directory with the input needed to run DART.
# ==============================================================================

echo "`date` -- BEGIN COPY BLOCK"

# Put a pared down copy (no comments) of input.nml in this assimilate_cam directory.
# The contents may change from one cycle to the next, so always start from
# the known configuration in the CASEROOT directory.

cd ${TMPROOT}
if (  -e   input.nml.original ) then
   sed -e "/#/d;/^\!/d;/^[ ]*\!/d" \
       -e '1,1i\WARNING: Changes to this file will be ignored. \n Edit input.nml.original instead.\n\n\n' \
       input.nml.original >! input.nml  || exit 10
else
   echo "ERROR ... DART required file ${TMPROOT}/input.nml not found ... ERROR"
   echo "ERROR ... DART required file ${TMPROOT}/input.nml not found ... ERROR"
   exit 11
endif

echo "`date` -- END COPY BLOCK"

# If possible, use the round-robin approach to deal out the tasks.
# This facilitates using multiple nodes for the simultaneous I/O operations.

#if ($?NUMTASKS_PERNODE) then
#   if ($#NUMTASKS_PERNODE > 0) then
#      ${MOVE} input.nml input.nml.$$ || exit 20
#      sed -e "s#layout.*#layout = 2#" \
#          -e "s#tasks_per_node.*#tasks_per_node = $NUMTASKS_PERNODE#" \
#          input.nml.$$ >! input.nml || exit 21
#      ${REMOVE} -f input.nml.$$
#   endif
#endif

# ==============================================================================
# Block 3: Identify requested output stages, warn about redundant output.
# ==============================================================================

cd ${TMPROOT}
set MYSTRING = `grep stages_to_write input.nml`
set MYSTRING = (`echo $MYSTRING | sed -e "s#[=,'\.]# #g"`)
set STAGE_input     = FALSE
set STAGE_forecast  = FALSE
set STAGE_preassim  = FALSE
set STAGE_postassim = FALSE
set STAGE_analysis  = FALSE
set STAGE_output    = FALSE

# Assemble lists of stages to write out, which are not the 'output' stage.

set stages_except_output = "{"
@ stage = 2
while ($stage <= $#MYSTRING)
   if ($MYSTRING[$stage] == 'input') then
      set STAGE_input = TRUE
      if ($stage > 2) set stages_except_output = "${stages_except_output},"
      set stages_except_output = "${stages_except_output}input"
   endif
   if ($MYSTRING[$stage] == 'forecast') then
      set STAGE_forecast = TRUE
      if ($stage > 2) set stages_except_output = "${stages_except_output},"
      set stages_except_output = "${stages_except_output}forecast"
   endif
   if ($MYSTRING[$stage] == 'preassim') then
      set STAGE_preassim = TRUE
      if ($stage > 2) set stages_except_output = "${stages_except_output},"
      set stages_except_output = "${stages_except_output}preassim"
   endif
   if ($MYSTRING[$stage] == 'postassim') then
      set STAGE_postassim = TRUE
      if ($stage > 2) set stages_except_output = "${stages_except_output},"
      set stages_except_output = "${stages_except_output}postassim"
   endif
   if ($MYSTRING[$stage] == 'analysis') then
      set STAGE_analysis = TRUE
      if ($stage > 2) set stages_except_output = "${stages_except_output},"
      set stages_except_output = "${stages_except_output}analysis"
   endif
   if ($stage == $#MYSTRING) then
      set stages_all = "${stages_except_output}"
      if ($MYSTRING[$stage] == 'output') then
         set STAGE_output = TRUE
         set stages_all = "${stages_all},output"
      endif
   endif
   @ stage++
end

# Add the closing }
set stages_all = "${stages_all}}"
set stages_except_output = "${stages_except_output}}"

# Checking
echo "stages_except_output = $stages_except_output"
echo "stages_all = $stages_all"
if ($STAGE_output != TRUE) then
   echo "ERROR: assimilate.csh requires that input.nml:filter_nml:stages_to_write includes stage 'output'"
   exit 40
endif


# ==============================================================================
# Block 5: Get observation sequence file ... or die right away.
# The observation file names have a time that matches the stopping time of CAM.
#
# Make sure the file name structure matches the obs you will be using.
# PERFECT model obs output appends .perfect to the filenames
# ==============================================================================

cd ${TMPROOT}
set YYYYMM = `printf %04d%02d ${ATM_YEAR} ${ATM_MONTH}`

if (! -d ${BASEOBSDIR}/${YYYYMM}_6H_CESM) then
#if (! -d ${BASEOBSDIR}/final_CHALL_CONV_${YYYYMM}_6H_CESM) then
   echo "CESM+DART requires 6 hourly obs_seq files in directories of the form YYYYMM_6H_CESM"
   echo "The directory ${BASEOBSDIR}/CHX_CONV_${YYYYMM}_6H_CESM is not found.  Exiting"
   exit 70
endif

set OBSFNAME = `printf obs_seq.%04d-%02d-%02d-%05d ${ATM_YEAR} ${ATM_MONTH} ${ATM_DAY} ${ATM_SECONDS}`
#set OBSFNAME = `printf obs_seq.amsua.%04d.%02d.%02d.%05d ${ATM_YEAR} ${ATM_MONTH} ${ATM_DAY} ${ATM_SECONDS}`

set OBS_FILE = ${BASEOBSDIR}/${YYYYMM}_6H_CESM/${OBSFNAME}
#set OBS_FILE = ${BASEOBSDIR}/final_CHALL_CONV_${YYYYMM}_6H_CESM/${OBSFNAME}
echo "OBS_FILE = $OBS_FILE"

${REMOVE} obs_seq.out
if (  -e ${OBS_FILE} ) then
   ${LINK} ${OBS_FILE} obs_seq.out || exit 80
else
   echo "ERROR ... no observation file ${OBS_FILE}"
   echo "ERROR ... no observation file ${OBS_FILE}"
   exit 81
endif

# ==============================================================================
# Block 6: DART INFLATION
# This block is only relevant if 'inflation' is turned on AND
# inflation values change through time:
# filter_nml
#    inf_flavor(:)  = 2  (or 3 (or 4 for posterior))
#    inf_initial_from_restart    = .TRUE.
#    inf_sd_initial_from_restart = .TRUE.
#
# This block stages the files that contain the inflation values.
# The inflation files are essentially duplicates of the DART model state,
# which have names in the CESM style, something like
#    ${case}.dart.rh.${scomp}_output_priorinf_{mean,sd}.YYYY-MM-DD-SSSSS.nc
# The strategy is to use the latest such files in ${RUNDIR}.
# If those don't exist at the start of an assimilation,
# this block creates them with 'fill_inflation_restart'.
# If they don't exist AFTER the first cycle, the script will exit
# because they should have been available from a previous cycle.
# The script does NOT check the model date of the files for consistency
# with the current forecast time, so check that the inflation mean
# files are evolving as expected.
#
# CESM's st_archive should archive the inflation restart files
# like any other "restart history" (.rh.) files; copying the latest files
# to the archive directory, and moving all of the older ones.
# ==============================================================================

# If we need to run fill_inflation_restart, CAM:static_init_model()
# always needs a caminput.nc and a cam_phis.nc for geometry information, etc.


cd ${TMPROOT}



if ( $radmode == TRUE ) then
  set inst=1
  while ( $inst <= $nens )
     set inst_string=`printf _%04d $inst`
     set ftoass="$CASESRUNROOT/${case_name}$inst_string/run/${case_name}$inst_string.cam.i.${ATM_DATE_EXT}.nc"
     set ftoassh="$CASESRUNROOT/${case_name}$inst_string/run/${case_name}$inst_string.cam.h0.${ATM_DATE_EXT}.nc"
     echo "Add TS, TREFHT, LANDFRAC, QVMR to $ftoass"
     ncks -A -C -v TS $ftoassh $ftoass
     ncks -A -C -v TREFHT $ftoassh $ftoass
     ncap2 -A -s "QVMR=Q/(1-Q)" -v $ftoass $ftoass
     rm tmp.nc
     ncap2 -s 'where(LANDFRAC>OCNFRAC) LANDFRAC=0; elsewhere LANDFRAC=1' -v $ftoassh tmp.nc
     ncks -A -C -v ICEFRAC $ftoassh tmp.nc
     ncap2 -A -s 'where(ICEFRAC>0.5) LANDFRAC=2' -v  tmp.nc $ftoass
     rm tmp.nc

     @ inst++
  end
endif











set MYSTRING = `grep cam_template_filename input.nml`
set MYSTRING = `echo $MYSTRING | sed -e "s#[=,']# #g"`
set CAMINPUT = $MYSTRING[2]
${REMOVE} ${CAMINPUT}
#${LINK} ${CASE}.cam_0001.i.${ATM_DATE_EXT}.nc ${CAMINPUT} || exit 90
${LINK} $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.i.${ATM_DATE_EXT}.nc ${CAMINPUT} || exit 90


# All of the .h0. files contain the same PHIS field, so we can link to any of them.

#set hists = `${LIST} ${CASE}.cam_0001.h0.*.nc`
set hists=`${LIST} $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.h0.*`
set MYSTRING = `grep cam_phis_filename input.nml`
set MYSTRING = `echo $MYSTRING | sed -e "s#[=,']# #g"`
set CAM_PHIS = $MYSTRING[2]
${REMOVE} ${CAM_PHIS}
${LINK} $hists[1] ${CAM_PHIS} || exit 100
echo " Extract information phis from $hists[1]"


# Now, actually check the inflation settings

set  MYSTRING = `grep inf_flavor input.nml`
set  MYSTRING = `echo $MYSTRING | sed -e "s#[=,'\.]# #g"`
set  PRIOR_INF = $MYSTRING[2]
set  POSTE_INF = $MYSTRING[3]

set  MYSTRING = `grep inf_initial_from_restart input.nml`
set  MYSTRING = `echo $MYSTRING | sed -e "s#[=,'\.]# #g"`

# If no inflation is requested, the inflation restart source is ignored
echo " PRIOR_INF= $PRIOR_INF"
echo " POSTE_INF= $POSTE_INF"

if ( $PRIOR_INF == 0 ) then
   set  PRIOR_INFLATION_FROM_RESTART = ignored
   set  USING_PRIOR_INFLATION = false
else
   set  PRIOR_INFLATION_FROM_RESTART = `echo $MYSTRING[2] | tr '[:upper:]' '[:lower:]'`
   set  USING_PRIOR_INFLATION = true
endif

if ( $POSTE_INF == 0 ) then
   set  POSTE_INFLATION_FROM_RESTART = ignored
   set  USING_POSTE_INFLATION = false
else
   set  POSTE_INFLATION_FROM_RESTART = `echo $MYSTRING[3] | tr '[:upper:]' '[:lower:]'`
   set  USING_POSTE_INFLATION = true
endif

if ($USING_PRIOR_INFLATION == false ) then
   set stages_requested = 0
   if ( $STAGE_input    == TRUE ) @ stages_requested++
   if ( $STAGE_forecast == TRUE ) @ stages_requested++
   if ( $STAGE_preassim == TRUE ) @ stages_requested++
   if ( $stages_requested > 1 ) then
      echo " "
      echo "WARNING ! ! Redundant output is requested at multiple stages before assimilation."
      echo "            Stages 'input' and 'forecast' are always redundant."
      echo "            Prior inflation is OFF, so stage 'preassim' is also redundant. "
      echo "            We recommend requesting just 'preassim'."
      echo " "
   endif
endif

if ($USING_POSTE_INFLATION == false ) then
   set stages_requested = 0
   if ( $STAGE_postassim == TRUE ) @ stages_requested++
   if ( $STAGE_analysis  == TRUE ) @ stages_requested++
   if ( $STAGE_output    == TRUE ) @ stages_requested++
   if ( $stages_requested > 1 ) then
      echo " "
      echo "WARNING ! ! Redundant output is requested at multiple stages after assimilation."
      echo "            Stages 'output' and 'analysis' are always redundant."
      echo "            Posterior inflation is OFF, so stage 'postassim' is also redundant. "
      echo "            We recommend requesting just 'output'."
      echo " "
   endif
endif

# IFF we want PRIOR inflation:

if ($USING_PRIOR_INFLATION == true) then
   if ($PRIOR_INFLATION_FROM_RESTART == false) then

      echo "inf_flavor(1) = $PRIOR_INF, using namelist values."

   else
      # Look for the output from the previous assimilation (or fill_inflation_restart)
      # If inflation files exists, use them as input for this assimilation
      (${LIST} -rt1 *.dart.rh.${scomp}_output_priorinf_mean* | tail -n 1 >! latestfile) > & /dev/null
      (${LIST} -rt1 *.dart.rh.${scomp}_output_priorinf_sd*   | tail -n 1 >> latestfile) > & /dev/null
      set nfiles = `cat latestfile | wc -l`

      echo "nfiles = $nfiles "

      if ( $nfiles > 0 ) then

         set latest_mean = `head -n 1 latestfile`
         set latest_sd   = `tail -n 1 latestfile`

         echo "latest_mean = $latest_mean"
         echo "latest_sd = $latest_sd"
         # Need to COPY instead of link because of short-term archiver and disk management.
         ${COPY} $latest_mean input_priorinf_mean.nc
         ${COPY} $latest_sd   input_priorinf_sd.nc

         if ( $radmode == TRUE ) then
           #ncap2 -O -s 'where(LANDFRAC<500) LANDFRAC=1'   input_priorinf_mean.nc input_priorinf_mean.nc
           #ncap2 -O -s 'where(LANDFRAC<500) LANDFRAC=0.'  input_priorinf_sd.nc input_priorinf_sd.nc
           #ncap2 -O -s 'where(TS<500) TS=1' input_priorinf_mean.nc input_priorinf_mean.nc
           #ncap2 -O -s 'where(TS<500) TS=0' input_priorinf_sd.nc input_priorinf_sd.nc
           #ncap2 -O -s 'where(TREFHT<500) TREFHT=1.' input_priorinf_mean.nc input_priorinf_mean.nc
           #ncap2 -O -s 'where(TREFHT<500) TREFHT=0' input_priorinf_sd.nc input_priorinf_sd.nc
           #ncap2 -O -s 'where(QVMR<500) QVMR=1' input_priorinf_mean.nc input_priorinf_mean.nc
           #ncap2 -O -s 'where(QVMR<500) QVMR=0' input_priorinf_sd.nc input_priorinf_sd.nc


                echo "add TS TREFHT LANDFRAC QVMR to the inflation files"
                ncks -C -v TS $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.i.${ATM_DATE_EXT}.nc tmp_TS.nc
                ncap2 -O -s "TS=TS*0+1" tmp_TS.nc tmp_m_TS.nc
                ncap2 -O -s "TS=TS*0" tmp_TS.nc tmp_s_TS.nc
                ncks -A -v TS tmp_m_TS.nc input_priorinf_mean.nc
                ncks -A -v TS tmp_s_TS.nc input_priorinf_sd.nc
                ncks -C -v TREFHT $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.i.${ATM_DATE_EXT}.nc tmp_TREFHT.nc
                ncap2 -O -s "TREFHT=TREFHT*0+1" tmp_TREFHT.nc tmp_m_TREFHT.nc
                ncap2 -O -s "TREFHT=TREFHT*0" tmp_TREFHT.nc tmp_s_TREFHT.nc
                ncks -A -v TREFHT tmp_m_TREFHT.nc input_priorinf_mean.nc
                ncks -A -v TREFHT tmp_s_TREFHT.nc input_priorinf_sd.nc
                ncks -C -v LANDFRAC $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.i.${ATM_DATE_EXT}.nc tmp_LANDFRAC.nc
                ncap2 -O -s "LANDFRAC=LANDFRAC*0+1" tmp_LANDFRAC.nc tmp_m_LANDFRAC.nc
                ncap2 -O -s "LANDFRAC=LANDFRAC*0" tmp_LANDFRAC.nc tmp_s_LANDFRAC.nc
                ncks -A -v LANDFRAC tmp_m_LANDFRAC.nc input_priorinf_mean.nc
                ncks -A -v LANDFRAC tmp_s_LANDFRAC.nc input_priorinf_sd.nc
                ncks -C -v QVMR $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.i.${ATM_DATE_EXT}.nc tmp_QVMR.nc
                ncap2 -O -s "QVMR=QVMR*0+1" tmp_QVMR.nc tmp_m_QVMR.nc
                ncap2 -O -s "QVMR=QVMR*0" tmp_QVMR.nc tmp_s_QVMR.nc
                ncks -A -v QVMR tmp_m_QVMR.nc input_priorinf_mean.nc
                ncks -A -v QVMR tmp_s_QVMR.nc input_priorinf_sd.nc
                rm tmp_*.nc

         endif

      else if ($CONT_RUN == FALSE) then

         # It's the first assimilation; try to find some inflation restart files
         # or make them using fill_inflation_restart.
         # Fill_inflation_restart needs caminput.nc and cam_phis.nc for static_model_init,
         # so this staging is done in assimilate.csh (after a forecast) instead of stage_cesm_files.

         if (-x fill_inflation_restart) then

            ./fill_inflation_restart

            if ( $radmode == TRUE ) then
              # ncap2 -O -s 'where(LANDFRAC<500) LANDFRAC=1'   input_priorinf_mean.nc input_priorinf_mean.nc
              # ncap2 -O -s 'where(LANDFRAC<500) LANDFRAC=0.'  input_priorinf_sd.nc input_priorinf_sd.nc
              # ncap2 -O -s 'where(TS<500) TS=1' input_priorinf_mean.nc input_priorinf_mean.nc
              # ncap2 -O -s 'where(TS<500) TS=0' input_priorinf_sd.nc input_priorinf_sd.nc
              # ncap2 -O -s 'where(TREFHT<500) TREFHT=1.' input_priorinf_mean.nc input_priorinf_mean.nc
              # ncap2 -O -s 'where(TREFHT<500) TREFHT=0' input_priorinf_sd.nc input_priorinf_sd.nc
              # ncap2 -O -s 'where(QVMR<500) QVMR=1' input_priorinf_mean.nc input_priorinf_mean.nc
              # ncap2 -O -s 'where(QVMR<500) QVMR=0' input_priorinf_sd.nc input_priorinf_sd.nc

                echo "add TS TREFHT LANDFRAC QVMR to the inflation files"
                ncks -C -v TS $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.i.${ATM_DATE_EXT}.nc tmp_TS.nc
                ncap2 -O -s "TS=TS*0+1" tmp_TS.nc tmp_m_TS.nc
                ncap2 -O -s "TS=TS*0" tmp_TS.nc tmp_s_TS.nc
                ncks -A -v TS tmp_m_TS.nc input_priorinf_mean.nc
                ncks -A -v TS tmp_s_TS.nc input_priorinf_sd.nc
                ncks -C -v TREFHT $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.i.${ATM_DATE_EXT}.nc tmp_TREFHT.nc
                ncap2 -O -s "TREFHT=TREFHT*0+1" tmp_TREFHT.nc tmp_m_TREFHT.nc
                ncap2 -O -s "TREFHT=TREFHT*0" tmp_TREFHT.nc tmp_s_TREFHT.nc
                ncks -A -v TREFHT tmp_m_TREFHT.nc input_priorinf_mean.nc
                ncks -A -v TREFHT tmp_s_TREFHT.nc input_priorinf_sd.nc
                ncks -C -v LANDFRAC $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.i.${ATM_DATE_EXT}.nc tmp_LANDFRAC.nc
                ncap2 -O -s "LANDFRAC=LANDFRAC*0+1" tmp_LANDFRAC.nc tmp_m_LANDFRAC.nc
                ncap2 -O -s "LANDFRAC=LANDFRAC*0" tmp_LANDFRAC.nc tmp_s_LANDFRAC.nc
                ncks -A -v LANDFRAC tmp_m_LANDFRAC.nc input_priorinf_mean.nc
                ncks -A -v LANDFRAC tmp_s_LANDFRAC.nc input_priorinf_sd.nc
                ncks -C -v QVMR $CASESRUNROOT/${case_name}_0001/run/${case_name}_0001.cam.i.${ATM_DATE_EXT}.nc tmp_QVMR.nc
                ncap2 -O -s "QVMR=QVMR*0+1" tmp_QVMR.nc tmp_m_QVMR.nc
                ncap2 -O -s "QVMR=QVMR*0" tmp_QVMR.nc tmp_s_QVMR.nc
                ncks -A -v QVMR tmp_m_QVMR.nc input_priorinf_mean.nc
                ncks -A -v QVMR tmp_s_QVMR.nc input_priorinf_sd.nc
                rm tmp_*.nc
            endif

         else
            echo "ERROR: Requested PRIOR inflation restart for the first cycle."
            echo "       There are no existing inflation files available "
            echo "       and ${EXEROOT}/fill_inflation_restart is missing."
            echo "EXITING"
            exit 112
         endif

      else
         echo "ERROR: Requested PRIOR inflation restart, "
         echo '       but files *.dart.rh.${scomp}_output_priorinf_* do not exist in the ${RUNDIR}.'
         echo '       If you are changing from cam_no_assimilate.csh to assimilate.csh,'
         echo '       you might be able to continue by changing CONTINUE_RUN = FALSE for this cycle,'
         echo '       and restaging the initial ensemble.'
         ${LIST} -l *inf*
         echo "EXITING"
         exit 115
      endif
   endif
else
   echo "Prior Inflation not requested for this assimilation."
endif

# POSTERIOR: We look for the 'newest' and use it - IFF we need it.

if ($USING_POSTE_INFLATION == true) then
   if ($POSTE_INFLATION_FROM_RESTART == false) then

      # we are not using an existing inflation file.
      echo "inf_flavor(2) = $POSTE_INF, using namelist values."

   else
      # Look for the output from the previous assimilation (or fill_inflation_restart).
      # (The only stage after posterior inflation.)
      (${LIST} -rt1 *.dart.rh.${scomp}_output_postinf_mean* | tail -n 1 >! latestfile) > & /dev/null
      (${LIST} -rt1 *.dart.rh.${scomp}_output_postinf_sd*   | tail -n 1 >> latestfile) > & /dev/null
      set nfiles = `cat latestfile | wc -l`

      echo "nfiles =  $nfiles"

      # If one exists, use it as input for this assimilation
      if ( $nfiles > 0 ) then

         set latest_mean = `head -n 1 latestfile`
         set latest_sd   = `tail -n 1 latestfile`

         echo "latest_mean = $latest_mean"
         echo "latest_sd = $latest_sd"

         ${LINK} $latest_mean input_postinf_mean.nc || exit 120
         ${LINK} $latest_sd   input_postinf_sd.nc   || exit 121

      else if ($CONT_RUN == FALSE) then
         # It's the first assimilation; try to find some inflation restart files
         # or make them using fill_inflation_restart.
         # Fill_inflation_restart needs caminput.nc and cam_phis.nc for static_model_init,
         # so this staging is done in assimilate.csh (after a forecast) instead of stage_cesm_files.

         if (-x fill_inflation_restart) then
            ./fill_inflation_restart
            ${MOVE} prior_inflation_mean.nc input_postinf_mean.nc || exit 125
            ${MOVE} prior_inflation_sd.nc   input_postinf_sd.nc   || exit 126

         else
            echo "ERROR: Requested POSTERIOR inflation restart for the first cycle."
            echo "       There are no existing inflation files available "
            echo "       and ${EXEROOT}/fill_inflation_restart is missing."
            echo "EXITING"
            exit 127
         endif

      else
         echo "ERROR: Requested POSTERIOR inflation restart, "
         echo '       but files *.dart.rh.${scomp}_output_postinf_* do not exist in the ${RUNDIR}.'
         ${LIST} -l *inf*
         echo "EXITING"
         exit 128
      endif
   endif
else
   echo "Posterior Inflation not requested for this assimilation."
endif

# ==============================================================================
# Block 7: Actually run the assimilation.
#
# DART namelist settings required:
# &filter_nml
#    adv_ens_command         = "no_CESM_advance_script",
#    obs_sequence_in_name    = 'obs_seq.out'
#    obs_sequence_out_name   = 'obs_seq.final'
#    single_file_in          = .false.,
#    single_file_out         = .false.,
#    stages_to_write         = stages you want + ,'output'
#    input_state_file_list   = 'cam_init_files'
#    output_state_file_list  = 'cam_init_files',
#
# WARNING: the default mode of this script assumes that
#          input_state_file_list = output_state_file_list, so that
#          the CAM initial files used as input to filter will be overwritten.
#          The input model states can be preserved by requesting that stage
#          'forecast' be output.
#
# ==============================================================================

# In the default mode of CAM assimilations, filter gets the model state(s)
# from CAM initial files.  This section puts the names of those files into a text file.
# The name of the text file is provided to filter in filter_nml:input_state_file_list.

# NOTE:
# If the files in input_state_file_list are CESM initial files (all vars and
# all meta data), then they will end up with a different structure than
# the non-'output', stage output written by filter ('preassim', 'postassim', etc.).
# This can be prevented (at the cost of more disk space) by copying
# the CESM format initial files into the names filter will use for preassim, etc.:
#    > cp $case.cam_0001.i.$date.nc  preassim_member_0001.nc.
#    > ... for all members
# Filter will replace the state variables in preassim_member* with updated versions,
# but leave the other variables and all metadata unchanged.

# If filter will create an ensemble from a single state,
#    filter_nml: perturb_from_single_instance = .true.
# it's fine (and convenient) to put the whole list of files in input_state_file_list.
# Filter will just use the first as the base to perturb.


cd ${TMPROOT}
set line = `grep input_state_file_list input.nml | sed -e "s#[=,'\.]# #g"`
set input_file_list_name = $line[2]

# If the file names in $output_state_file_list = names in $input_state_file_list,
# then the restart file contents will be overwritten with the states updated by DART.

set line = `grep output_state_file_list input.nml | sed -e "s#[=,'\.]# #g"`
set output_file_list_name = $line[2]

if ($input_file_list_name != $output_file_list_name) then
   echo "ERROR: assimilate.csh requires that input_file_list = output_file_list"
   echo "       You can probably find the data you want in stage 'forecast'."
   echo "       If you truly require separate copies of CAM's initial files"
   echo "       before and after the assimilation, see revision 12603, and note that"
   echo "       it requires changing the linking to cam_initial_####.nc, below."
   exit 130
endif

set inst=1
${REMOVE} $input_file_list_name
while ( $inst <= $nens )
   set inst_string=`printf _%04d $inst`
   set ftoass="$CASESRUNROOT/${case_name}$inst_string/run/${case_name}$inst_string.cam.i.${ATM_DATE_EXT}.nc"
   echo "Insert $ftoass in $input_file_list_name"
   echo "$CASESRUNROOT/${case_name}$inst_string/run/${case_name}$inst_string.cam.i.${ATM_DATE_EXT}.nc" >> $input_file_list_name


  @ inst++
end


#${LIST} -1 ${CASE}.cam_[0-9][0-9][0-9][0-9].i.${ATM_DATE_EXT}.nc >! $input_file_list_name

#setenv FI_PROVIDER "verbs;ofi_rxm"

echo "`date` -- BEGIN FILTER"
${LAUNCHCMD} ./filter || exit 140
echo "`date` -- END FILTER"

# ==============================================================================
# Block 8: Rename the output using the CESM file-naming convention.
# ==============================================================================

# If output_state_file_list is filled with custom (CESM) filenames,
# then 'output' ensemble members will not appear with filter's default,
# hard-wired names.  But file types output_{mean,sd} will appear and be
# renamed here.
#
# We don't know the exact set of files which will be written,
# so loop over all possibilities: use LIST in the foreach.
# LIST will expand the variables and wildcards, only existing files will be
# in the foreach loop. (If the input.nml has num_output_state_members = 0,
# there will be no output_member_xxxx.nc even though the 'output' stage
# may be requested - for the mean and sd)
#
# Handle files with instance numbers first.
#    split off the .nc
#    separate the pieces of the remainder
#    grab all but the trailing 'member' and #### parts.
#    and join them back together

echo "`date` -- BEGIN FILE RENAMING"

# The short-term archiver archives files depending on pieces of their names.
# '_####.i.' files are CESM initial files.
# '.dart.i.' files are ensemble statistics (mean, sd) of just the state variables
#            in the initial files.
# '.e.'      designates a file as something from the 'external system processing ESP', e.g. DART.

foreach FILE (`${LIST} ${stages_all}_member_*.nc`)

   set parts = `echo $FILE | sed -e "s#\.# #g"`
   set list = `echo $parts[1]  | sed -e "s#_# #g"`
   @ last = $#list - 2
   set dart_file = `echo $list[1-$last] | sed -e "s# #_#g"`

   # DART 'output_member_****.nc' files are actually linked to cam input files

   set type = "e"
   echo $FILE | grep "put"
   if ($status == 0) set type = "i"


   echo "Moving $FILE in ${case_name}.${scomp}_$list[$#list].${type}.${dart_file}.${ATM_DATE_EXT}.nc "
   ${MOVE} $FILE  ${case_name}.${scomp}_$list[$#list].${type}.${dart_file}.${ATM_DATE_EXT}.nc || exit 150
end

# Files without instance numbers need to have the scomp part of their names = "dart".
# This is because in st_archive, all files with  scomp = "cam"
# (= compname in env_archive.xml) will be st_archived using a pattern
# which has the instance number added onto it.  {mean,sd} files don't have
# instance numbers, so they need to be archived by the "dart" section of env_archive.xml.
# But they still need to be different for each component, so include $scomp in the
# ".dart_file" part of the file name.  Somewhat awkward and inconsistent, but effective.

# Means and standard deviation files (except for inflation).
foreach FILE (`${LIST} ${stages_all}_{mean,sd}*.nc`)
   echo "$FILE renaming"

   set parts = `echo $FILE | sed -e "s#\.# #g"`
   set type = "e"
   echo $FILE | grep "put"
   if ($status == 0) set type = "i"

   ${MOVE} $FILE ${case_name}.dart.${type}.${scomp}_$parts[1].${ATM_DATE_EXT}.nc || exit 160
end

# Rename the observation file and run-time output

${MOVE} obs_seq.final ${case_name}.dart.e.${scomp}_obs_seq_final.${ATM_DATE_EXT} || exit 170
${MOVE} dart_log.out                 ${scomp}_dart_log.${ATM_DATE_EXT}.out || exit 171

# Rename the inflation files and designate them as 'rh' files - which get
# reinstated in the run directory by the short-term archiver and are then
# available for the next assimilation cycle.
#
# Accommodate any possible inflation files.
# The .${scomp}_ part is needed by DART to distinguish
# between inflation files from separate components in coupled assims.

foreach FILE (`${LIST} ${stages_all}_{prior,post}inf_*`)

   set parts = `echo $FILE | sed -e "s#\.# #g"`
   ${MOVE} $FILE  ${case_name}.dart.rh.${scomp}_$parts[1].${ATM_DATE_EXT}.nc || exit 180

end

# Handle localization_diagnostics_files
set MYSTRING = `grep 'localization_diagnostics_file' input.nml`
set MYSTRING = `echo $MYSTRING | sed -e "s#[=,']# #g"`
set MYSTRING = `echo $MYSTRING | sed -e 's#"# #g'`
set loc_diag = $MYSTRING[2]
if (-f $loc_diag) then
   ${MOVE} $loc_diag  ${scomp}_${loc_diag}.dart.e.${ATM_DATE_EXT} || exit 190
endif

# Handle regression diagnostics
set MYSTRING = `grep 'reg_diagnostics_file' input.nml`
set MYSTRING = `echo $MYSTRING | sed -e "s#[=,']# #g"`
set MYSTRING = `echo $MYSTRING | sed -e 's#"# #g'`
set reg_diag = $MYSTRING[2]
if (-f $reg_diag) then
   ${MOVE} $reg_diag  ${scomp}_${reg_diag}.dart.e.${ATM_DATE_EXT} || exit 200
endif

# Then this script will need to feed the files in output_restart_list_file
# to the next model advance.
# This gets the .i. or .r. piece from the CESM format file name.
set line = `grep 0001 $output_file_list_name | sed -e "s#[\.]# #g"`
echo ""
echo "line= $line"
set l = 1
while ($l < $#line)
   if ($line[$l] =~ ${scomp}) then
      @ l++
      set file_type = $line[$l]
      echo "file_type= $file_type"
      break
   endif
   @ l++
end

set member = 1
while ( ${member} <= ${nens} )

   set inst_string = `printf _%04d $member`
   cd $CASESRUNROOT/${case_name}$inst_string/run
   echo " In `pwd` for i.c. renaming"
   set ATM_INITIAL_FILENAME = "${case_name}${inst_string}.cam.i.${ATM_DATE_EXT}.nc"
   ${REMOVE} ${scomp}_initial${inst_string}.nc
   echo " Link $ATM_INITIAL_FILENAME in ${scomp}_initial${inst_string}.nc "
   ${LINK} $ATM_INITIAL_FILENAME ${scomp}_initial${inst_string}.nc || exit 210

   @ member++

end

echo "`date` -- END   FILE RENAMING"

#if ($cycle == $DATA_ASSIMILATION_CYCLES) then
#   echo "`date` -- BEGIN (NON-RESTART) ARCHIVING LOGIC"
#
#   if ($#log_list >= 3) then
#
#      # During the last cycle, hide the previous restart set
#      # so that it's not archived, but is available.
#      # (Coupled assimilations may need to keep multiple atmospheric
#      #  cycles for each ocean cycle.)
#
#      set FILE = $re_list[2]
#      set FILE = $FILE:r
#      if ($FILE:e == 'nc') set FILE = $FILE:r
#      set hide_date = $FILE:e
#      set HIDE_DATE_PARTS = `echo $hide_date | sed -e "s#-# #g"`
#      set day_o_month = $HIDE_DATE_PARTS[3]
#      set sec_o_day   = $HIDE_DATE_PARTS[4]
#      set day_time    = ${day_o_month}-${sec_o_day}
#
#      set hidedir = ../Hide_${day_time}
#      mkdir $hidedir
#
#      if ($save_all_inf =~ TRUE) then
#         # Put the previous and current inflation restarts in the archive directory.
#         # (to protect last from st_archive putting them in exp/hist)
#         ${MOVE}   ${case_name}*${stages_except_output}*inf*  ${archive}/esp/rest
#
#         # Don't need previous inf restarts now, but want them to be archived later.
#         # COPY instead of LINK because they'll be moved or used later.
#         ${COPY}   ${case_name}*output*inf* ${archive}/esp/rest
#      else
#         # output*inf must be copied back because it needs to be in ${RUNDIR}
#         # when st_archive runs to save the results of the following assim
#         ${MOVE}   ${case_name}*inf*${day_time}*  $hidedir
#
#         # Don't need previous inf restarts now, but want them to be archived later.
#         ${COPY}   $hidedir/${case_name}*output*inf*${day_time}* .
#      endif
#
#      # Hide the CAM 'restart' files from the previous cycle (day_time) from the archiver.
#      ${MOVE}           ${case_name}*.{r,rs,rs1,rh0,h0,i}.*${day_time}*    $hidedir
#
#      # Move log files: *YYMMDD-HHMMSS.  [2] means the previous restart set is being moved.
#      set rm_log = `echo $log_list[2] | sed -e "s/\./ /g;"`
#      # -- (decrement by one) skips the gz at the end of the names.
#      set rm_slot = $#rm_log
#      if ($rm_log[$#rm_log] =~ gz) @ rm_slot--
#      ${MOVE}  *$rm_log[$rm_slot]*  $hidedir
#   endif
#
#   # Restore CESM's timing logic for the first cycle of the next job.
#   cd ${CASEROOT}
#   ./xmlchange CHECK_TIMING=${CHECK_TIMING}
#   cd ${RUNDIR}

   # Create a netCDF file which contains the names of DART inflation restart files.
   # This is needed in order to use the CESM st_archive mechanisms for keeping,
   # in $RUNDIR, history files which are needed for restarts.
   # These special files must be labeled with '.rh.'.
   # St_archive looks in a .r. restart file for the names of these 'restart history' files.
   # DART's inflation files fit the definition of restart history files, so we put .rh.
   # in their names.  Those file names must be found in a dart.r. file, which is created here.
   # Inflation restart file names for all components will be in this one restart file,
   # since the inflation restart files have the component names in them.

#   set inf_list = `ls *output_{prior,post}inf_*.${ATM_DATE_EXT}.nc`
#   set file_list = 'restart_hist = "./'$inf_list[1]\"
#   set i = 2
#   while ($i <= $#inf_list)
#      set file_list = (${file_list}\, \"./$inf_list[$i]\")
#      @ i++
#   end
#   cat << ___EndOfText >! inf_restart_list.cdl
#       netcdf template {  // CDL file which ncgen will use to make a DART restart file
#                          // containing just the names of the needed inflation restart files.
#       dimensions:
#            num_files = $#inf_list;
#       variables:
#            string  restart_hist(num_files);
#            restart_hist:long_name = "DART restart history file names";
#       data:
#            $file_list;
#       }
#___EndOfText
#
#   ncgen -k netCDF-4 -o ${case_name}.dart.r.${scomp}.${ATM_DATE_EXT}.nc inf_restart_list.cdl
#   if ($status == 0) ${REMOVE} inf_restart_list.cdl
#
##   echo "`date` -- END   ARCHIVING LOGIC"
##endif


echo ""
echo "`date` -- START   ANALYSIS ARCHIVING"

cd ${TMPROOT}
set adir = "${archive}/${case_name}/${case_name}-${ATM_DATE_EXT}"
mkdir -p $adir
${MOVE} *.{e,i}*${ATM_DATE_EXT}*  $adir
${MOVE} cam_dart_log.${ATM_DATE_EXT}*  $adir




# inflation archive, remove the oldest files
if ( $INFVAL == 0 ) then
  echo  "\n No inflation used. Inflations files not hidden.\n"
else
  echo  "\n Inflation used. Hide inflation files and delete the old ones.\n"
  mkdir -p .HIDE_${case_name}
  ${COPY} *.rh.cam_*inf*${ATM_DATE_EXT}*  $adir
  ${MOVE} *.rh.cam_*inf*${ATM_DATE_EXT}*  .HIDE_${case_name}
 # if ( "${c}" == 2 ) then
 #   echo " HIDE dir was empty, do not remove old inflation."
 # else
 #   echo " HIDE dir was not  empty,  remove old inflation."
 #    #${REMOVE} *.dart.rh.cam_*inf*${inf_prev_date_files}.nc
 #    ${REMOVE} *.dart.rh.cam_*inf*.nc
 # endif
   set old_inf_files = `ls -rt1 *.rh.cam_*inf*.nc | wc -l`
   if ( $old_inf_files == 0 ) then
      echo "Nothing to remove"
   else
      echo "Remove old inflation files"
      ${REMOVE} *.dart.rh.cam_*inf*.nc
   endif
endif


# Restart management
set member = 1
while ( ${member} <= ${nens} )

   set inst_string = `printf _%04d $member`
   cd $CASESRUNROOT/${case_name}$inst_string/run

   echo "\n Restart processes date $ATM_DATE[2]-$ATM_DATE[3]-$ATM_DATE[4] \n"
   ## Save the restarts at the beginning of the year
   #if ( "$ATM_DATE[2]-$ATM_DATE[3]-$ATM_DATE[4]" == "01-01-00000" ) then
   # Save the restarts at the beginning of the month
   if ( "$ATM_DATE[3]-$ATM_DATE[4]" == "01-00000" ) then
     echo "\n Copy the restart files ... \n"
     ${COPY} *.{h0,r,rs,rs1}*${ATM_DATE_EXT}* ${adir}
     ${COPY} rpointer* ${adir}
   endif

   @ member++
end


echo "`date` -- END   ANALYSIS ARCHIVING"

# ==============================================================================
# Compress the large coupler history files and DART files.
# ==============================================================================

#echo "STARTING: compressing coupler history files and DART files at `date`"

#${CASEROOT}/compress.csh $CASE $ATM_DATE_EXT $ensemble_size "hist dart" "$stages_all"
#if ($status != 0) then
#   echo "ERROR: Compression of coupler history files and DART files failed at `date`"
#   # Ensure the removal of unneeded restart sets and copy of obs_seq.final are finished.
#   wait
#   exit 250
#endif

# Write a Flag to check if assimilation is really concluded and it does not hang
#echo 1 > check_assi.flag
cd ${SCRIPTDIR}
cat check_assi.flag
sed -i 's/0/1/g' check_assi.flag
echo " wrote 1 in check_assi.flag"
cat check_assi.flag



#echo "FINISHED: compressing coupler history files and DART files at `date`"
echo "`date` -- END CAM_ASSIMILATE"

# Ensure the removal of unneeded restart sets and copy of obs_seq.final are finished.
wait






exit 0

# <next few lines under version control, do not edit>
# $URL$
# $Revision$
# $Date$
