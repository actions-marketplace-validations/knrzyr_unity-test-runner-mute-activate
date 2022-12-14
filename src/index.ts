import * as core from '@actions/core';
import { Action, Docker, BatchDocker, ImageTag, Input, Output, ResultsCheck, CreateServiceConfig } from './model';

async function run() {
  try {
    Action.checkCompatibility();

    const { workspace, actionFolder } = Action;
    const {
      editorVersion,
      customImage,
      projectPath,
      customParameters,
      testMode,
      coverageOptions,
      artifactsPath,
      useHostNetwork,
      sshAgent,
      gitPrivateToken,
      githubToken,
      checkName,
      chownFilesTo,
      renderResultDetail,
      executeMethod,
    } = Input.getFromUser();

    const useLicenseServer = await CreateServiceConfig.writeServiceConfig(workspace);

    const baseImage = new ImageTag({ editorVersion, customImage });
    const runnerTemporaryPath = process.env.RUNNER_TEMP;

    try {
      if (executeMethod) {
        await BatchDocker.run(baseImage, {
          actionFolder,
          editorVersion,
          workspace,
          projectPath,
          customParameters,
          executeMethod,
          artifactsPath,
          useHostNetwork,
          sshAgent,
          gitPrivateToken,
          githubToken,
          runnerTemporaryPath,
          chownFilesTo,
          useLicenseServer,
        });
      }
      else {
        await Docker.run(baseImage, {
          actionFolder,
          editorVersion,
          workspace,
          projectPath,
          customParameters,
          testMode,
          coverageOptions,
          artifactsPath,
          useHostNetwork,
          sshAgent,
          gitPrivateToken,
          githubToken,
          runnerTemporaryPath,
          chownFilesTo,
          useLicenseServer,
        });
      }
    } finally {
      await Output.setArtifactsPath(artifactsPath);
      await Output.setCoveragePath('CodeCoverage');
    }

    if (githubToken && !executeMethod) {
      const failedTestCount = await ResultsCheck.createCheck(artifactsPath, githubToken, checkName, renderResultDetail);
      if (failedTestCount >= 1) {
        core.setFailed(`Test(s) Failed! Check '${checkName}' for details.`);
      }
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
