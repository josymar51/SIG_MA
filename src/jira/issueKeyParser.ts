export const IssueKeyRegEx = new RegExp(/[a-zA-Z]+-\d+/g);

export function parseJiraIssueKeys(text?: string): string[] {
    if (!text) {
        return [];
    }
    const issueKeys = text.match(IssueKeyRegEx) || [];
    return Array.from(new Set(issueKeys));
}
