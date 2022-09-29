export type Config = {
    targetRepos: TargetRepos;
    targetFolder: string;
    github: Github;
};

type TargetRepo = {
    owner: string;
    repos: Repos;
};

type Repo = {
    name: string;
    filesPattern: string;
};

type Github = {
    url: string;
    token: string;
};

type TargetRepos = Array<TargetRepo>;

type Repos = Array<Repo>;
