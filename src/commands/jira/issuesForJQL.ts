import { Container } from "../../container";
import { Issue, issueExpand, issueFields, issueFromJsonObject } from "../..//jira/jiraModel";
import { Logger } from "../../logger";


export async function issuesForJQL(jql: string): Promise<Issue[]> {
  let client = await Container.clientManager.jirarequest();

  if (client) {
    Logger.debug("issuesForJQL: got client");
    return client.search
      .searchForIssuesUsingJqlGet({
        expand: issueExpand,
        jql: jql,
        fields: issueFields
      })
      .then((res: JIRA.Response<JIRA.Schema.SearchResultsBean>) => {
        const issues = res.data.issues;
        if (issues) {
          return issues.map((issue: any) => {
            return issueFromJsonObject(issue, Atl.getWorkingSite());
          });
        }
        return [];
      });
  } else {
    Logger.debug("issuesForJQL: client undefined");
  }

  return Promise.reject();
}
