import BitbucketServer from '@atlassian/bitbucket-server';
import { PullRequest, PaginatedCommits, User, PaginatedComments, BuildStatus, UnknownUser, PaginatedFileChanges, Comment, PaginatedPullRequests, PullRequestApi, CreatePullRequestData, Reviewer } from '../bitbucket/model';
import { Remote, Repository } from '../typings/git';
import { getBitbucketRemotes, parseGitUrl, urlForRemote, clientForHostname, siteDetailsForRepository, siteDetailsForRemote } from '../bitbucket/bbUtils';
import { Container } from '../container';
import { DetailedSiteInfo } from '../atlclients/authInfo';

const dummyRemote = { name: '', isReadOnly: true };

export class ServerPullRequestApi implements PullRequestApi {

    async getList(repository: Repository, queryParams?: { pagelen?: number, sort?: string, q?: string }): Promise<PaginatedPullRequests> {

        const remote = getBitbucketRemotes(repository)[0];

        let parsed = parseGitUrl(remote.fetchUrl! || remote.pushUrl!);
        const bb = await clientForHostname(parsed.resource) as BitbucketServer;

        const { data } = await bb.repos.getPullRequests({
            projectKey: parsed.owner,
            repositorySlug: parsed.name,
        });
        const prs: PullRequest[] = data.values!.map((pr: BitbucketServer.Schema.Any) => this.toPullRequestModel(repository, remote, pr));
        const next = data.next;
        // Handling pull requests from multiple remotes is not implemented. We stop when we see the first remote with PRs.
        if (prs.length > 0) {
            return { repository: repository, remote: remote, data: prs, next: next };
        }

        return { repository: repository, remote: dummyRemote, data: [], next: undefined };
    }

    async  getListCreatedByMe(repository: Repository): Promise<PaginatedPullRequests> {
        return this.getList(repository);
    }

    async  getListToReview(repository: Repository): Promise<PaginatedPullRequests> {
        return this.getList(repository);
    }

    async  nextPage({ repository, remote, next }: PaginatedPullRequests): Promise<PaginatedPullRequests> {
        return { repository: repository, remote: remote, data: [], next: undefined };
    }

    async  getLatest(repository: Repository): Promise<PaginatedPullRequests> {
        return this.getList(
            repository,
            { pagelen: 1, sort: '-created_on', q: `state="OPEN" and reviewers.account_id="${(await Container.authManager.getAuthInfo(await siteDetailsForRepository(repository)!))!.user.id}"` });
    }

    async  getRecentAllStatus(repository: Repository): Promise<PaginatedPullRequests> {
        return this.getList(
            repository,
            { pagelen: 1, sort: '-created_on', q: 'state="OPEN" OR state="MERGED" OR state="SUPERSEDED" OR state="DECLINED"' });
    }

    async  get(pr: PullRequest): Promise<PullRequest> {
        let parsed = parseGitUrl(urlForRemote(pr.remote));
        const bb = await clientForHostname(parsed.resource) as BitbucketServer;

        const { data } = await bb.pullRequests.get({
            projectKey: parsed.owner,
            repositorySlug: parsed.name,
            pullRequestId: pr.data.id
        });

        return this.toPullRequestModel(pr.repository, pr.remote, data);
    }

    async  getChangedFiles(pr: PullRequest): Promise<PaginatedFileChanges> {
        let parsed = parseGitUrl(urlForRemote(pr.remote));
        const bb = await clientForHostname(parsed.resource) as BitbucketServer;

        let { data } = await bb.pullRequests.streamChanges({
            projectKey: parsed.owner,
            repositorySlug: parsed.name,
            pullRequestId: String(pr.data.id)
        });

        const diffStats: BitbucketServer.Schema.Any[] = data.values || [];
        diffStats.map(diffStat => {
            switch (diffStat.type) {
                case 'ADD':
                case 'COPY':
                    diffStat.type = 'added';
                    break;
                case 'DELETE':
                    diffStat.type = 'removed';
                    break;
                case 'MOVE':
                    diffStat.type = 'renamed';
                    break;
                case 'MODIFY':
                default:
                    diffStat.type = 'modified';
                    break;
            }
        });
        return {
            data: diffStats.map(diffStat => ({
                status: diffStat.type,
                oldPath: diffStat.type === 'added' ? undefined : diffStat.path.toString,
                newPath: diffStat.type === 'removed' ? undefined : diffStat.path.toString
            })),
            next: data.next
        };
    }

    async  getCurrentUser(site: DetailedSiteInfo): Promise<User> {
        const bb = await clientForHostname(site.hostname) as BitbucketServer;

        const { data } = await bb.api.getUser({
            userSlug: (await Container.authManager.getAuthInfo(site))!.user.id
        });

        return this.toUser(siteDetailsForRemote({ name: 'dummy', isReadOnly: true, fetchUrl: 'https://bb.pi-jira-server.tk/scm/tp/vscode-bitbucket-server.git' })!, data);
    }

    async  getCommits(pr: PullRequest): Promise<PaginatedCommits> {
        let parsed = parseGitUrl(urlForRemote(pr.remote));
        const bb = await clientForHostname(parsed.resource) as BitbucketServer;

        const { data } = await bb.pullRequests.getCommits({
            projectKey: parsed.owner,
            repositorySlug: parsed.name,
            pullRequestId: pr.data.id
        });
        return {
            data: data.values.map((commit: any) => ({
                author: this.toUser(siteDetailsForRemote(pr.remote)!, commit.author),
                ts: commit.authorTimestamp,
                hash: commit.id,
                message: commit.message,
                url: undefined,
                htmlSummary: undefined,
                rawSummary: undefined
            }))
        };
    }

    async  getComments(pr: PullRequest): Promise<PaginatedComments> {
        let parsed = parseGitUrl(urlForRemote(pr.remote));
        const bb = await clientForHostname(parsed.resource) as BitbucketServer;

        const { data } = await bb.pullRequests.getActivities({
            projectKey: parsed.owner,
            repositorySlug: parsed.name,
            pullRequestId: pr.data.id
        });
        const activities = (data.values as Array<any>).filter(activity => activity.action === 'COMMENTED');
        return {
            data: activities.map(activity => ({
                id: activity.comment.id!,
                parentId: undefined,
                htmlContent: activity.comment.html,
                rawContent: activity.comment.text,
                ts: activity.comment.createdDate,
                updatedTs: activity.comment.updatedDate,
                deleted: !!activity.comment.deleted,
                inline: activity.commentAnchor
                    ? {
                        path: activity.commentAnchor.path,
                        from: activity.commentAnchor.fileType === 'TO' ? undefined : activity.commentAnchor.line,
                        to: activity.commentAnchor.fileType === 'TO' ? activity.commentAnchor.line : undefined
                    }
                    : undefined,
                user: activity.comment.author
                    ? this.toUser(siteDetailsForRemote(pr.remote)!, activity.comment.author)
                    : UnknownUser
            }))
        };
    }

    async  getBuildStatuses(pr: PullRequest): Promise<BuildStatus[]> {
        return [];
    }

    async  getDefaultReviewers(remote: Remote): Promise<Reviewer[]> {
        return [];
    }

    async  create(repository: Repository, remote: Remote, createPrData: CreatePullRequestData): Promise<PullRequest> {
        return Promise.reject();
    }

    async  approve(pr: PullRequest) {
        let parsed = parseGitUrl(urlForRemote(pr.remote));
        const bb = await clientForHostname(parsed.resource) as BitbucketServer;

        await bb.pullRequests.approve({
            projectKey: parsed.owner,
            repositorySlug: parsed.name,
            pullRequestId: pr.data.id
        });
    }

    async  merge(pr: PullRequest, closeSourceBranch?: boolean, mergeStrategy?: 'merge_commit' | 'squash' | 'fast_forward') {
        let parsed = parseGitUrl(urlForRemote(pr.remote));
        const bb = await clientForHostname(parsed.resource) as BitbucketServer;

        await bb.pullRequests.merge({
            projectKey: parsed.owner,
            repositorySlug: parsed.name,
            pullRequestId: pr.data.id,
            version: -1
        });
    }

    async  postComment(
        remote: Remote,
        prId: number, text: string,
        parentCommentId?: number,
        inline?: { from?: number, to?: number, path: string }
    ): Promise<Comment> {
        let parsed = parseGitUrl(urlForRemote(remote));
        const bb = await clientForHostname(parsed.resource) as BitbucketServer;

        const { data } = await bb.pullRequests.createComment({
            projectKey: parsed.owner,
            repositorySlug: parsed.name,
            pullRequestId: String(prId),
            body: {
                parent: parentCommentId ? { id: parentCommentId } : undefined,
                text: text,
                anchor: inline
                    ? {
                        line: inline!.to || inline!.from,
                        lineType: "CONTEXT",
                        fileType: inline!.to ? "TO" : "FROM",
                        path: inline!.path
                    }
                    : undefined
            }
        });

        return {
            id: data.id,
            parentId: data.parentId,
            user: this.toUser(siteDetailsForRemote(remote)!, data.author),
            htmlContent: data.html,
            rawContent: data.text,
            ts: data.createdDate,
            updatedTs: data.updatedDate,
            deleted: false,
            inline: data.commentAnchor
                ? {
                    path: data.commentAnchor.path,
                    from: data.commentAnchor.fileType === 'TO' ? undefined : data.commentAnchor.line,
                    to: data.commentAnchor.fileType === 'TO' ? data.commentAnchor.line : undefined
                }
                : undefined
        };
    }

    getBitbucketRemotes(repository: Repository): Remote[] {
        return [];
    }

    toUser(site: DetailedSiteInfo, input: BitbucketServer.Schema.User): User {
        return {
            accountId: String(input.id!),
            displayName: input.displayName!,
            url: input.links && input.links.self ? input.links.self[0].href : undefined,
            avatarUrl: this.patchAvatarUrl(site.baseLinkUrl, input.avatarUrl)
        };
    }

    toPullRequestModel(repository: Repository, remote: Remote, data: BitbucketServer.Schema.Any): PullRequest {
        const site = siteDetailsForRemote(remote)!;
        return {
            remote: remote,
            repository: repository,
            data: {
                id: data.id,
                url: data.links.self[0].href,
                author: this.toUser(site, data.author.user),
                reviewers: [],
                participants: data.reviewers.map((reviewer: any) => (
                    {
                        ...this.toUser(site, reviewer.user),
                        role: reviewer.role,
                        approved: reviewer.approved
                    }
                )),
                source: {
                    repo: {
                        name: data.fromRef.repository.slug,
                        displayName: data.fromRef.repository.name,
                        fullName: `${data.fromRef.repository.project.key}/${data.fromRef.repository.slug}`,
                        url: data.fromRef.repository.links.self[0].href,
                        avatarUrl: this.patchAvatarUrl(site.baseLinkUrl, data.fromRef.repository.avatarUrl),
                        mainbranch: undefined,
                        issueTrackerEnabled: false
                    },
                    branchName: data.fromRef.displayId,
                    commitHash: data.fromRef.latestCommit
                },
                destination: {
                    repo: {
                        name: data.toRef.repository.slug,
                        displayName: data.toRef.repository.name,
                        fullName: `${data.toRef.repository.project.key}/${data.fromRef.repository.slug}`,
                        url: data.toRef.repository.links.self[0].href,
                        avatarUrl: this.patchAvatarUrl(site.baseLinkUrl, data.toRef.repository.avatarUrl),
                        mainbranch: undefined,
                        issueTrackerEnabled: false
                    },
                    branchName: data.toRef.displayId,
                    commitHash: data.toRef.latestCommit
                },
                title: data.title,
                htmlSummary: data.descriptionAsHtml,
                rawSummary: data.description,
                ts: data.createdDate,
                updatedTs: data.updatedDate,
                state: data.state,
                closeSourceBranch: false,
                taskCount: 0,
                buildStatuses: []
            }
        };
    }

    patchAvatarUrl(baseUrl: string, avatarUrl: string): string {
        if (avatarUrl && !/^http/.test(avatarUrl)) {
            return `${baseUrl}${avatarUrl}`;
        }
        return avatarUrl;
    }
}
