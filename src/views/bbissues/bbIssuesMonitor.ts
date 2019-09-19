import * as path from 'path';
import * as vscode from "vscode";
import { Commands } from "../../commands";
import { Repository } from "../../typings/git";
import { BitbucketIssue } from '../../bitbucket/model';
import { clientForRemote, firstBitbucketRemote } from '../../bitbucket/bbUtils';

export class BitbucketIssuesMonitor implements BitbucketActivityMonitor {
  private _lastCheckedTime = new Map<String, Date>();

  constructor(private _repos: Repository[]) {
    this._repos.forEach(repo => this._lastCheckedTime.set(repo.rootUri.toString(), new Date()));
  }

  async checkForNewActivity() {
    const promises = this._repos.map(async repo => {
      const remote = firstBitbucketRemote(repo);
      const bbApi = await clientForRemote(remote);

      return bbApi.issues!.getLatest(repo).then(issuesList => {
        const lastChecked = this._lastCheckedTime.has(repo.rootUri.toString())
          ? this._lastCheckedTime.get(repo.rootUri.toString())!
          : new Date();
        this._lastCheckedTime.set(repo.rootUri.toString(), new Date());

        let newIssues = issuesList.data.filter(i => Date.parse(i.data.created_on!) > lastChecked.getTime());

        if (newIssues.length > 0) {
          let repoName = path.basename(repo.rootUri.fsPath);
          return [{ repo: repoName, issues: newIssues }];
        }
        return [];
      });
    });
    Promise.all(promises)
      .then(result => result.reduce((prev, curr) => prev.concat(curr), []))
      .then(notifiableRepos => {
        if (notifiableRepos.length === 1 && notifiableRepos[0].issues.length === 1) {
          let issue: BitbucketIssue = notifiableRepos[0].issues[0];
          vscode.window.showInformationMessage(`New Bitbucket issue "${issue.data.title}" was created for repo "${notifiableRepos[0].repo}"`, 'Show')
            .then(usersChoice => {
              if (usersChoice === 'Show') {
                vscode.commands.executeCommand(Commands.ShowBitbucketIssue, issue);
              }
            });
        } else if (notifiableRepos.length > 0) {
          vscode.window.showInformationMessage(`New Bitbucket issues were created for the following repositories: ${notifiableRepos.map(nr => nr.repo).join(', ')}`, 'Show')
            .then(usersChoice => {
              if (usersChoice === 'Show') {
                vscode.commands.executeCommand('workbench.view.extension.atlascode-drawer');
                vscode.commands.executeCommand(Commands.BitbucketIssuesRefresh);
              }
            });
        }
      });
  }
}
