import { Octokit } from '@octokit/rest';
import { Config } from './types';
import { mkdirSync, existsSync } from 'fs';
import * as execa from 'execa';
import { load } from 'js-yaml';
import { join } from 'path';

function createFolderRepo(folder: string) {
    if (!existsSync(folder)) {
        mkdirSync(folder, { recursive: true });
    }
}

export function updateRegistry(config: string) {
    const settings = load(config) as Config;
    for (const targetRepo of settings.targetRepos) {
        for (const repo of targetRepo.repos) {
            const listRelease = new Octokit({
                auth: settings.github.token,
                baseUrl: settings.github.url,
            }).rest.repos.listReleases({
                owner: targetRepo.owner,
                repo: repo.name,
            });
            const folderPath = join(
                __dirname,
                '..',
                settings.targetFolder,
                targetRepo.owner
            );
            createFolderRepo(folderPath);
            listRelease.then((releases: any) => {
                const releasesWithAsserts = releases.data.filter(
                    (release: any) => release.assets.length
                );
                console.log(`${targetRepo.owner}/${repo.name}:`);
                for (const release of releasesWithAsserts) {
                    for (const asset of release.assets) {
                        for (const pattern of repo.filesPattern) {
                            if (asset.name.match(new RegExp(pattern))) {
                                console.log(asset.browser_download_url);
                                execa.sync('wget', [
                                    `--header=Authorization: Bearer ${settings.github.token}`,
                                    '-N',
                                    asset.browser_download_url,
                                    '-P',
                                    folderPath,
                                ]);
                            }
                        }
                    }
                }
                execa.sync('helm', ['repo', 'index', folderPath]);
            });
        }
    }
}
