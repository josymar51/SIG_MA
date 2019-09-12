import { Message } from "./messaging";
import { IConfig, emptyConfig } from "../config/model";
import { DetailedSiteInfo } from "../atlclients/authInfo";
import { JiraSiteProjectMapping } from "../jira/projectManager";

export interface FeedbackUser {
    userName: string;
    emailAddress: string;
}

export interface ConfigData extends Message {
    config: IConfig;
    jiraAccessToken: string;
    jiraSites: DetailedSiteInfo[];
    bitbucketSites: DetailedSiteInfo[];
    feedbackUser: FeedbackUser;
    siteProjectMapping: JiraSiteProjectMapping;
}

export const emptyConfigData: ConfigData = {
    type: 'init',
    config: emptyConfig,
    jiraSites: [],
    jiraAccessToken: '',
    bitbucketSites: [],
    feedbackUser: {
        userName: '',
        emailAddress: ''
    },
    siteProjectMapping: {}
};

export interface ConfigUpdate extends Message {
    config: IConfig;
}

export interface SitesAvailableUpdate extends Message {
    jiraSites: DetailedSiteInfo[];
    bitbucketSites: DetailedSiteInfo[];
}
