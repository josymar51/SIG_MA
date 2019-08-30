import { Message, HostErrorMessage } from "./messaging";
import { WorkingProject } from "../config/model";
import { RepoData } from "./prMessaging";
import { PullRequestData } from "../bitbucket/model";
import { MinimalIssue, Project, User } from "../jira/jira-client/model/entities";
import { EpicFieldInfo } from "../jira/jiraCommon";
import { CreateMetaTransformerProblems, IssueTypeUIs } from "../jira/jira-client/model/createIssueUI";
import { EditIssueUI, emptyEditIssueUI } from "../jira/jira-client/model/editIssueUI";
import { FieldValues, SelectFieldOptions } from "../jira/jira-client/model/fieldUI";
import { emptyUser } from "../jira/jira-client/model/emptyEntities";


// IssueData is the message that gets sent to the JiraIssuePage react view containing the issue details.
// we simply use the same name with two extend statements to merge the multiple interfaces
export interface EditIssueData extends Message { }
export interface EditIssueData extends EditIssueUI {
    currentUser: User;
    workInProgress: boolean;
    recentPullRequests: PullRequestData[];
}

export const emptyEditIssueData: EditIssueData = {
    type: "",
    ...emptyEditIssueUI,
    currentUser: emptyUser,
    workInProgress: false,
    recentPullRequests: [],
};

export interface IssueEditError extends HostErrorMessage {
    fieldValues: FieldValues;
}

export function isIssueEditError(m: Message): m is IssueEditError {
    return (<IssueEditError>m).fieldValues !== undefined;
}
export interface FieldValueUpdate extends Message {
    type: 'fieldValueUpdate';
    fieldValues: FieldValues;
}

export interface PullRequestUpdate extends Message {
    type: 'pullRequestUpdate';
    recentPullRequests: PullRequestData[];
}

export interface CurrentUserUpdate extends Message {
    type: 'currentUserUpdate';
    currentUser: User;
}

export interface IssueProblemsData extends Message {
    problems: CreateMetaTransformerProblems;
    project: WorkingProject;
}

export interface CreateIssueData extends Message {
    selectedProject: WorkingProject;
    selectedIssueTypeId: string | undefined;
    availableProjects: WorkingProject[];
    issueTypeScreens: IssueTypeUIs;
    epicFieldInfo: EpicFieldInfo;
    transformerProblems: CreateMetaTransformerProblems;
}

export interface PreliminaryIssueData extends Message {
    summary?: string;
    description?: string;
}

export interface ProjectList extends Message {
    availableProjects: Project[];
}

export interface LabelList extends Message {
    labels: any[];
}

export interface UserList extends Message {
    users: any[];
}

export interface IssueSuggestionsList extends Message {
    issues: any[];
}

export interface JqlOptionsList extends Message {
    options: any[];
    fieldId: string;
}

export interface SelectOptionsList extends Message {
    options: any[];
    fieldId: string;
}

export interface CreatedSelectOption extends Message {
    fieldValues: FieldValues;
    selectFieldOptions: SelectFieldOptions;
    fieldKey: string;
}

export interface IssueCreated extends Message {
    issueData: any;
}

export interface StartWorkOnIssueData extends Message {
    issue: MinimalIssue;
    repoData: RepoData[];
}

export interface StartWorkOnIssueResult extends Message {
    type: 'startWorkOnIssueResult';
    successMessage?: string;
    error?: string;
}

export function isCreatedSelectOption(m: Message): m is CreatedSelectOption {
    return m && (<CreatedSelectOption>m).fieldValues !== undefined
        && (<CreatedSelectOption>m).selectFieldOptions !== undefined
        && (<CreatedSelectOption>m).fieldKey !== undefined;
}

export function isIssueCreated(m: Message): m is IssueCreated {
    return (<IssueCreated>m).issueData !== undefined;
}

export function isStartWorkOnIssueData(m: Message): m is StartWorkOnIssueData {
    return (<StartWorkOnIssueData>m).issue !== undefined;
}

export function isStartWorkOnIssueResult(m: Message): m is StartWorkOnIssueResult {
    return (<StartWorkOnIssueResult>m).type === 'startWorkOnIssueResult';
}
