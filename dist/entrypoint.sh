#!/usr/bin/env bash

#
# Create directory for license activation
#

ACTIVATE_LICENSE_PATH="$GITHUB_WORKSPACE/_activate-license"
mkdir -p "$ACTIVATE_LICENSE_PATH"

#
# Run steps
#

source /steps/activate.sh
source /steps/set_gitcredential.sh
if [[ -n "$EXECUTE_METHOD" ]]; then
  source /steps/run_batch.sh
else
  source /steps/run_tests.sh
fi
source /steps/return_license.sh

#
# Remove license activation directory
#

rm -r "$ACTIVATE_LICENSE_PATH"

#
# Instructions for debugging
#

if [[ $UNITY_RUNNER_EXIT_CODE -gt 0 ]]; then
echo ""
echo "###########################"
echo "#         Failure         #"
echo "###########################"
echo ""
echo "Please note that the exit code is not very descriptive."
echo "Most likely it will not help you solve the issue."
echo ""
echo "To find the reason for failure: please search for errors in the log above."
echo ""
fi;

#
# Exit with code from the build step.
#

if [[ $USE_EXIT_CODE == true || $UNITY_RUNNER_EXIT_CODE -ne 2 ]]; then
exit $UNITY_RUNNER_EXIT_CODE
fi;
