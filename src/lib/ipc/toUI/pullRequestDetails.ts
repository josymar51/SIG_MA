import { ReducerAction } from '@atlassianlabs/guipi-core-controller';
import { emptyPullRequest, emptyUser, PullRequest, User } from '../../../bitbucket/model';

export enum PullRequestDetailsMessageType {
    Init = 'init',
    Update = 'configUpdate',
    FetchUsersResponse = 'fetchUsersResponse',
    UpdateSummaryResponse = 'updateSummaryResponse',
    UpdateTitleResponse = 'updateTitleResponse',
    UpdateSummary = 'updateSummary',
    UpdateTitle = 'updateTitle',
}

export type PullRequestDetailsMessage =
    | ReducerAction<PullRequestDetailsMessageType.Init, PullRequestDetailsInitMessage>
    | ReducerAction<PullRequestDetailsMessageType.Update, PullRequestDetailsInitMessage>
    | ReducerAction<PullRequestDetailsMessageType.UpdateSummary, PullRequestDetailsSummaryMessage>
    | ReducerAction<PullRequestDetailsMessageType.UpdateTitle, PullRequestDetailsTitleMessage>;

export type PullRequestDetailsResponse =
    | ReducerAction<PullRequestDetailsMessageType.FetchUsersResponse, FetchUsersResponseMessage>
    | ReducerAction<PullRequestDetailsMessageType.UpdateSummaryResponse, VoidResponse>
    | ReducerAction<PullRequestDetailsMessageType.UpdateTitleResponse, VoidResponse>;

export interface PullRequestDetailsInitMessage {
    pr: PullRequest;
    currentUser: User;
}

export interface VoidResponse {}

export interface FetchUsersResponseMessage {
    users: User[];
}

export interface PullRequestDetailsSummaryMessage {
    htmlSummary: string;
    rawSummary: string;
}

export interface PullRequestDetailsTitleMessage {
    title: string;
}

export const emptyPullRequestDetailsInitMessage: PullRequestDetailsInitMessage = {
    pr: emptyPullRequest,
    currentUser: emptyUser,
};
