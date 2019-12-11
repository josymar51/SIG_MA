import { FileDiffQueryParams } from "src/views/pullrequest/pullRequestNode";
import { DetailedSiteInfo, emptySiteInfo } from "../atlclients/authInfo";
import { PipelineApiImpl } from "../pipelines/pipelines";
import { Remote, Repository } from "../typings/git";
import { BitbucketIssuesApiImpl } from "./bitbucket-cloud/bbIssues";

export type BitbucketSite = {
    details: DetailedSiteInfo;
    ownerSlug: string;
    repoSlug: string;
};

export type SiteRemote = {
    site?: BitbucketSite;
    remote: Remote;
};

export type WorkspaceRepo = {
    rootUri: string;
    mainSiteRemote: SiteRemote;
    siteRemotes: SiteRemote[];
};

export const emptyBitbucketSite = {
    details: emptySiteInfo,
    ownerSlug: '',
    repoSlug: ''
};

export type User = {
    accountId: string;
    displayName: string;
    emailAddress?: string;
    url: string;
    avatarUrl: string;
    mention: string;
};

export const UnknownUser = {
    accountId: '',
    displayName: 'Unknown User',
    url: '',
    avatarUrl: '',
    mention: ''
};

export type Reviewer = User & {
    status: ApprovalStatus;
    role: "PARTICIPANT" | "REVIEWER";
};

export type Repo = {
    id: string;
    scm?: Repository;
    name: string;
    displayName: string;
    fullName: string;
    url: string;
    avatarUrl: string;
    mainbranch?: string;
    issueTrackerEnabled: boolean;
};

export type Task = {
    commentId: string;
    creator: User;
    created: string;
    updated: string;
    isComplete: boolean;
    id: string;
    editable: boolean;
    deletable: boolean;
    content: string;
};

export type Comment = {
    id: string;
    parentId?: string;
    deletable: boolean;
    editable: boolean;
    user: User;
    htmlContent: string;
    rawContent: string;
    ts: string;
    updatedTs: string;
    deleted: boolean;
    inline?: {
        from?: number;
        path: string;
        to?: number;
    };
    children: Comment[];
    tasks: Task[];
};

export const emptyUser = {
    accountId: "",
    displayName: "",
    url: "",
    avatarUrl: "",
    mention: ""
};

export const emptyTask = {
    commentId: "",
    creator: emptyUser,
    created: "",
    updated: "",
    isComplete: false,
    id: "",
    editable: false,
    deletable: false,
    content: {
        raw: "",
        markup: "",
        html: "",
        type: ""
    }
};

export const emptyComment = {
    id: "",
    deletable: false,
    editable: false,
    user: emptyUser,
    htmlContent: "",
    rawContent: "",
    ts: "",
    updatedTs: "",
    deleted: false,
    children: [],
    tasks: []
};

export type Commit = {
    author: User;
    ts: string;
    hash: string;
    message: string;
    url: string;
    htmlSummary: string;
    rawSummary: string;
};

export type BuildStatus = {
    name: string;
    state: "SUCCESSFUL" | "FAILED" | "INPROGRESS" | "STOPPED";
    url: string;
    ts: string;
};

export type MergeStrategy = {
    label: string;
    value: string;
    isDefault: boolean;
};

export type FileChange = {
    status: FileStatus;
    oldPath?: string;
    newPath?: string;
    linesAdded: number;
    linesRemoved: number;
    hunkMeta: {
        oldPathAdditions: number[];
        oldPathDeletions: number[];
        newPathAdditions: number[];
        newPathDeletions: number[];
        // maps destination file line number to source file line number to support Bitbucket server comments
        // NOT using Map here as Map does not serialize to JSON
        newPathContextMap: Object;
    }
};

export enum FileStatus {
    ADDED = 'A',
    DELETED = 'D',
    COPIED = 'C',
    MODIFIED = 'M',
    RENAMED = 'R',
    CONFLICT = 'CONFLICT',
    UNKNOWN = 'X'
};

export interface FileDiff {
    file: string;
    status: FileStatus;
    linesAdded: number;
    linesRemoved: number;
    similarity?: number;
    lhsQueryParams?: FileDiffQueryParams;
    rhsQueryParams?: FileDiffQueryParams;
    fileChange?: FileChange;
};

export type CreatePullRequestData = {
    reviewerAccountIds: string[];
    title: string;
    summary: string;
    sourceBranchName: string;
    destinationBranchName: string;
    closeSourceBranch: boolean;
};

export type ApprovalStatus = "APPROVED" | "UNAPPROVED" | "NEEDS_WORK";

export type PullRequestData = {
    siteDetails: DetailedSiteInfo;
    id: string;
    version: number;
    url: string;
    author: User;
    reviewers: Reviewer[];
    participants: Reviewer[];
    source: {
        repo: Repo;
        branchName: string;
        commitHash: string;
    },
    destination: {
        repo: Repo;
        branchName: string;
        commitHash: string;
    },
    title: string;
    htmlSummary: string;
    rawSummary: string;
    ts: string;
    updatedTs: string;
    state: "MERGED" | "SUPERSEDED" | "OPEN" | "DECLINED";
    closeSourceBranch: boolean;
    taskCount: number;
    buildStatuses?: BuildStatus[];
};

export interface PullRequest {
    site: BitbucketSite;
    data: PullRequestData;
    workspaceRepo?: WorkspaceRepo;
    // TODO figure out what to do when source remote is different from destination remote
    // sourceRemote: sourceRemote,
}

export interface PaginatedPullRequests {
    site: BitbucketSite;
    data: PullRequest[];
    next?: string;
    workspaceRepo?: WorkspaceRepo;
}

export interface PaginatedComments {
    data: Comment[];
    next?: string;
}

export interface PaginatedBitbucketIssues {
    workspaceRepo: WorkspaceRepo;
    site: BitbucketSite;
    data: BitbucketIssue[];
    next?: string;
}

export interface PaginatedBranchNames {
    data: string[];
    next?: string;
}

export type BitbucketIssue = {
    site: BitbucketSite;
    data: BitbucketIssueData;
};

export function isBitbucketIssue(a: any): a is BitbucketIssue {
    return a && (<BitbucketIssue>a).site !== undefined
        && (<BitbucketIssue>a).data !== undefined;
}

export type BitbucketIssueData = any;
export type BitbucketBranchingModel = any;

export interface PullRequestApi {
    getCurrentUser(site: DetailedSiteInfo): Promise<User>;
    getCurrentUserPullRequests(site: BitbucketSite): Promise<PaginatedPullRequests>;
    getList(workspaceRepo: WorkspaceRepo, queryParams?: { pagelen?: number, sort?: string, q?: string }): Promise<PaginatedPullRequests>;
    getListCreatedByMe(workspaceRepo: WorkspaceRepo): Promise<PaginatedPullRequests>;
    getListToReview(workspaceRepo: WorkspaceRepo): Promise<PaginatedPullRequests>;
    nextPage(prs: PaginatedPullRequests): Promise<PaginatedPullRequests>;
    getLatest(workspaceRepo: WorkspaceRepo): Promise<PaginatedPullRequests>;
    getRecentAllStatus(workspaceRepo: WorkspaceRepo): Promise<PaginatedPullRequests>;
    get(pr: PullRequest): Promise<PullRequest>;
    getChangedFiles(pr: PullRequest): Promise<FileChange[]>;
    getCommits(pr: PullRequest): Promise<Commit[]>;
    getComments(pr: PullRequest): Promise<PaginatedComments>;
    editComment(site: BitbucketSite, prId: string, content: string, commentId: string): Promise<Comment>;
    deleteComment(site: BitbucketSite, prId: string, commentId: string): Promise<void>;
    getBuildStatuses(pr: PullRequest): Promise<BuildStatus[]>;
    getMergeStrategies(pr: PullRequest): Promise<MergeStrategy[]>;
    getTasks(pr: PullRequest): Promise<Task[]>;
    postTask(site: BitbucketSite, prId: string, comment: Comment, content: string): Promise<Task>;
    editTask(site: BitbucketSite, prId: string, task: Task): Promise<Task>;
    deleteTask(site: BitbucketSite, prId: string, task: Task): Promise<void>;
    getReviewers(site: BitbucketSite, query?: string): Promise<User[]>;
    create(site: BitbucketSite, workspaceRepo: WorkspaceRepo, createPrData: CreatePullRequestData): Promise<PullRequest>;
    update(pr: PullRequest, title: string): Promise<void>;
    updateApproval(pr: PullRequest, status: ApprovalStatus): Promise<void>;
    merge(pr: PullRequest, closeSourceBranch?: boolean, mergeStrategy?: string, commitMessage?: string): Promise<void>;
    postComment(site: BitbucketSite, prId: string, text: string, parentCommentId?: string, inline?: { from?: number, to?: number, path: string }, lineMeta?: "ADDED" | "REMOVED"): Promise<Comment>;
    getFileContent(site: BitbucketSite, commitHash: string, path: string): Promise<string>;
}

export interface RepositoriesApi {
    getMirrorHosts(): Promise<string[]>;
    get(site: BitbucketSite): Promise<Repo>;
    getDevelopmentBranch(site: BitbucketSite): Promise<string>;
    getBranchingModel(site: BitbucketSite): Promise<BitbucketBranchingModel>;
    getCommitsForRefs(site: BitbucketSite, includeRef: string, excludeRef: string): Promise<Commit[]>;
    getPullRequestIdsForCommit(site: BitbucketSite, commitHash: string): Promise<string[]>;
}

export interface BitbucketApi {
    repositories: RepositoriesApi;
    pullrequests: PullRequestApi;
    issues?: BitbucketIssuesApiImpl;
    pipelines?: PipelineApiImpl;
}

export interface BitbucketApi {
    repositories: RepositoriesApi;
    pullrequests: PullRequestApi;
}