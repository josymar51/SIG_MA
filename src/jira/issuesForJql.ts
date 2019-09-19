import { Container } from "../container";
import { DetailedSiteInfo } from "../atlclients/authInfo";
import { MinimalIssue } from "./jira-client/model/entities";
import { readSearchResults } from "./jira-client/model/responses";


export async function issuesForJQL(jql: string, site: DetailedSiteInfo): Promise<MinimalIssue[]> {
  const client = await Container.clientManager.jiraClient(site);
  const fields = await Container.jiraSettingsManager.getMinimalIssueFieldIdsForSite(site);
  const epicFieldInfo = await Container.jiraSettingsManager.getEpicFieldsForSite(site);

  const res = await client.searchForIssuesUsingJqlGet(jql, fields);
  const searchResults = await readSearchResults(res, site, epicFieldInfo);

  return searchResults.issues;
}
