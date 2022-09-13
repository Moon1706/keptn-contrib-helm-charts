import { Octokit } from '@octokit/rest';
import { rmSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import * as execa from 'execa';
import { repos } from '../package.json';

function createFolderRepo(folder: string) {
    if (!existsSync(folder)) {
        mkdirSync(folder, { recursive: true });
    }
}

function updateRegistry(repos: Array<string>) {
    const octokit = new Octokit();
    for (const repo of repos) {
        const folderPath = repo;
        const folderFilePath = `${repo}_files`;
        createFolderRepo(`helm/${folderPath}`);
        const listRelease = octokit.rest.repos.listReleases({
            owner: 'keptn-contrib',
            repo: repo,
        });
        listRelease.then((releases: any) => {
            const releasesWithAsserts = releases.data.filter(
                (element: any) => element.assets.length
            );
            console.log(`Repo: ${repo}\nVersions:`);
            for (const releaseWithAsserts of releasesWithAsserts) {
                const downloadUrl =
                    releaseWithAsserts.assets[0].browser_download_url;
                const version = downloadUrl.split('/').slice(-2, -1);
                console.log(version);
                createFolderRepo(`../${folderFilePath}/${version}`);
                execa.sync('wget', [
                    downloadUrl,
                    '-P',
                    `${folderFilePath}/${version}`,
                ]);
            }
            const registryUrl =
                releasesWithAsserts[0].assets[0].browser_download_url
                    .split('/')
                    .slice(0, -2)
                    .join('/');
            execa.sync('helm', [
                'repo',
                'index',
                folderFilePath,
                '--url',
                registryUrl,
            ]);
            copyFileSync(
                `./${folderFilePath}/index.yaml`,
                `./helm/${folderPath}/index.yaml`
            );
            console.log(`Index path: helm/${folderPath}/index.yaml\n`);
            rmSync(folderFilePath, { recursive: true, force: true });
        });
    }
}

updateRegistry(repos);
