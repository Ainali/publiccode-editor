import ValidatorWorker from "worker-loader!../validator/validator_worker.js";
import { getAPIURL, BITBUCKET, GITHUB, GITLAB } from "./vcs";

export const isGitlabAPI = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    return false;
  }
  return true;
};

export const getDefaultBranch = async (urlString) => {
  const { vcs, url } = await getAPIURL(urlString);
  const response = await fetch(url);
  if (!response.ok) {
    return { branch: "master" }; // assumption
  }
  const data = await response.json();
  switch (vcs) {
    case GITHUB:
    case GITLAB:
      return { branch: data?.default_branch };
    case BITBUCKET:
      return { branch: data?.mainbranch?.name };
    default:
      return { branch: "master" }; // assumption
  }
};

export const getReleases = (versionsUrl) => {
  return fetch(versionsUrl)
    .then((res) => res.json())
    .then((data) => data.filter((d) => d.type == "dir"))
    .then((data) => data.map((d) => d.name));
};

export const getRemotePubliccode = async (yamlURL) => {
  const myInit = {
    method: "GET",
  };

  const res = await fetch(yamlURL, myInit);
  // 422 should pass as it indicates a failed validation
  if (!res.ok && res.status != 422) {
    throw new Error(`fetch(${yamlURL}) returned ${res.status}`);
  }
  return await res.text();
};

export const postDataForValidation = (data) => {
  const validator = new ValidatorWorker();
  validator.postMessage(data);

  return validator;
};
