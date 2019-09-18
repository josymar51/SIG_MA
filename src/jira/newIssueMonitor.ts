import { window, commands } from "vscode";
import { Container } from "../container";
import { Commands } from "../commands";
import { Logger } from "../logger";
import { issuesForJQL } from "../jira/issuesForJql";
import { format } from "date-fns";
import { ProductJira } from "../atlclients/authInfo";
import { showIssue } from "../commands/jira/showIssue";
import { MinimalIssue } from "./jira-client/model/entities";
import pSettle from "p-settle";

export class NewIssueMonitor {
  private _timestamp = new Date();

  constructor() {
  }

  private addCreatedTimeToQuery(jqlQuery: string, ts: string): string {
    let newQuery: string = jqlQuery;
    const createBits = `AND created > "${ts}"`;

    const orderByIndex: number = jqlQuery.toUpperCase().indexOf('ORDER BY');

    if (orderByIndex > -1) {
      newQuery = newQuery.slice(0, orderByIndex) + `${createBits} ` + newQuery.slice(orderByIndex);
    } else {
      newQuery = newQuery + ` ${createBits}`;
    }

    return newQuery;
  }

  async checkForNewIssues() {
    if (
      !Container.onlineDetector.isOnline() ||
      !Container.config.jira.explorer.monitorEnabled ||
      !Container.siteManager.productHasAtLeastOneSite(ProductJira)
    ) {
      return;
    }

    const ts = format(this._timestamp, "YYYY-MM-DD HH:mm");
    try {
      const enabledJQLs = Container.config.jira.jqlList.filter(entry => entry.enabled && entry.monitor);
      const jqlPromises: Promise<{ jqlName: string, issues: MinimalIssue[] }>[] = [];
      enabledJQLs.forEach(entry => {
        jqlPromises.push(
          (async () => {
            const site = Container.siteManager.getSiteForId(ProductJira, entry.siteId);
            if (site) {
              const issues = await issuesForJQL(this.addCreatedTimeToQuery(entry.query, ts), site);
              return { jqlName: entry.name, issues: issues };
            }
            return Promise.reject(`no site for id ${entry.siteId}`);
          })()
        );
      });

      let jqlResults = await pSettle(jqlPromises);
      jqlResults.forEach(result => {
        if (result.isFulfilled) {
          const newIssues = result.value.issues.filter(issue => issue.created! > this._timestamp);
          if (newIssues.length > 0) {
            this.showNotification(result.value.jqlName, newIssues);
            newIssues.forEach(issue => {
              if (issue.created! > this._timestamp) {
                this._timestamp = issue.created!;
              }
            });
          }
        }
      });

    } catch (e) {
      Logger.error(new Error(`Error checking for new issues ${e}`));
    }
  }

  private showNotification(jqlName: string, newIssues: MinimalIssue[]) {
    const issueNames = newIssues.map(issue => `[${issue.key}] "${issue.summary}"`);
    commands.executeCommand(Commands.RefreshJiraExplorer);
    var message = "";
    if (newIssues.length === 1) {
      message = `${issueNames[0]} added to ${jqlName}`;
    }
    else if (newIssues.length <= 3) {
      message = `${issueNames.slice(0, -1).join(', ')} and ${issueNames.slice(-1)} added to ${jqlName}`;
    }
    else {
      message = `${issueNames.slice(0, 2).join(', ')} and ${newIssues.length - 2} other new issues added to ${jqlName}.`;
    }
    window.showInformationMessage(message, "View Atlassian Explorer")
      .then((selection) => {
        if (selection) {
          if (newIssues.length === 1) {
            showIssue(newIssues[0]);
          } else {
            commands.executeCommand("workbench.view.extension.atlascode-drawer");
          }
        }
      });
  }
}
