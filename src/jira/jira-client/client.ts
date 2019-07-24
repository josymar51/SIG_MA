import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { isArray } from 'util';
import { IssueLinkType, User } from '../jiraCommon';
import { IssueCreateMetadata, readIssueCreateMetadata } from './issueCreateMetadata';
import { Version, readVersion } from './version';
import { Component, readComponent } from './component';
import { CreatedIssue, readCreatedIssue } from './createdIssue';
import { IssuePickerResult } from './issuePickerResult';
import { Field, readField } from './field';
import { JiraProjectManager } from '../projectManager';
import { Project } from '../jiraProject';

const issueExpand = "names,transitions,renderedFields";
const API_VERSION = 2;

export class JiraClient {
    readonly baseUrl: string;
    readonly agent: any | undefined;
    private _token: string | undefined;

    constructor(baseUrl: string, agent?: any) {
        this.baseUrl = baseUrl;
        this.agent = agent;
        //JiraClient({ baseUrl: site.baseApiUrl, options: extraOptions });
    }

    public authenticateUsingToken(token: string) {
        this._token = token;
    }

    public authenticateUsingBasic(username: string, password: string) {

    }

    // Issue
    public async createIssue(params: any): Promise<CreatedIssue> {
        const result = await this.postToJira('issue', params);

        return readCreatedIssue(result);
    }

    public async getIssue(issueIdOrKey: string, fields: string[]): Promise<any> {
        const res = await this.getFromJira(`issue/${issueIdOrKey}`, { expand: issueExpand, fields: fields });

        return res;
    }

    public async assignIssue(issueIdOrKey: string, accountId: string | undefined): Promise<any> {
        const res = await this.putToJira(`issue/${issueIdOrKey}/assignee`, { accountId: accountId });

        return res;
    }

    public async editIssue(issueIdOrKey: string, fields: any): Promise<any> {
        const res = await this.putToJira(`issue/${issueIdOrKey}`, { fields: fields });

        return res;
    }

    public async addComment(issueIdOrKey: string, comment: string): Promise<any> {
        const res = await this.postToJira(`issue/${issueIdOrKey}/comment`, { body: comment });

        return res;
    }

    public async transitionIssue(issueIdOrKey: string, transitionId: string): Promise<any> {
        //{ issueIdOrKey: issue.key, body: { transition: { id: transition.id } } }

        const res = await this.postToJira(`issue/${issueIdOrKey}/transitions`, { transition: { id: transitionId } });

        return res;
    }

    public async getEditIssueMetadata(issueIdOrKey: string): Promise<IssueUpdateMetadata> {
        const res = await this.getFromJira(`issue/${issueIdOrKey}/editmeta`);

        return new IssueUpdateMetadata(res);
    }

    public async getCreateIssueMetadata(projectKey: string): Promise<IssueCreateMetadata> {
        const res = await this.getFromJira(`issue/createmeta`, {
            projectKeys: [projectKey],
            expand: 'projects.issuetypes.fields'
        });

        return readIssueCreateMetadata(res);
    }

    public async getIssuePickerSuggestions(query: string): Promise<IssuePickerResult> {
        const res = await this.getFromJira('issue/picker', { query: query });

        return res;
    }

    // Project
    public async getProjectsPaginated(query?: string, orderBy?: string): Promise<Project[]> {
        let queryValues: any | undefined = undefined;
        if (query || orderBy) {
            queryValues = {};
            if (query) {
                queryValues.query = query;
            }
            if (orderBy) {
                queryValues.orderBy = orderBy;
            }
        }
        const res = await this.getFromJira('project/search', queryValues);

        if (isArray(res.values)) {
            return JiraProjectManager.readProjects(res.values);
        }
        return [];
    }

    // User
    public async findUsersAssignableToIssues(issueKey: string, query: string): Promise<User[]> {
        const res = this.getFromJira('user/assignable/search', { issueKey: issueKey, query: query });
        return res;
    }

    // JQL
    public async getFieldAutoCompleteSuggestions(fieldName: string, fieldValue: string): Promise<AutoCompleteSuggestion[]> {
        const res = await this.getFromJira('jql/autocompletedata/suggestions', { fieldName: fieldName, fieldValue: fieldValue });

        if (isArray(res)) {
            return res.map((s: any) => readAutoCompleteSuggestion(s));
        }

        return [];
    }

    // Search
    public async searchForIssuesUsingJqlGet(jql: string, fields: string[]): Promise<any> {
        const res = await this.getFromJira('search', { jql: jql, fields: fields, expand: issueExpand });

        return res;
    }

    // These create things haven't been tested and maybe params should be typed.
    // Version
    public async createVersion(params: any): Promise<Version> {
        //{ body: { name: e.createData.name, project: this.state.key.split('-')[0] } }

        const result = await this.postToJira('version', params);

        return readVersion(result);
    }

    // Component
    public async createComponent(params: any): Promise<Component> {
        const result = await this.postToJira('component', params);

        return readComponent(result);
    }

    // IssueLink
    public async createIssueLink(params: any): Promise<any> {
        const result = await this.postToJira('issueLink', params);

        return result;
    }

    public async getIssueLinkTypes(): Promise<IssueLinkType[]> {
        const res = await this.getFromJira('issueLinkType');
        return res;
    }

    // Field
    public async getFields(params: any): Promise<Field[]> {
        const res = await this.getFromJira('field');
        if (isArray(res)) {
            return res.map(f => readField(f));
        }

        return [];
    }

    // Myself
    public async getCurrentUser(): Promise<User> {
        const res = this.getFromJira('myself');

        return res;
    }

    private async getFromJira(url: string, queryParams?: any): Promise<any> {
        url = `${this.baseUrl}/api/${API_VERSION}/${url}`;
        if (queryParams) {
            const sp = new URLSearchParams();
            for (const [k, v] of Object.entries(queryParams)) {
                sp.append(k, `${v}`);
            }
            url = `${url}?${sp.toString()}`;
        }

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this._token}`
            },
            agent: this.agent
        });
        const responseObject = await res.json();

        return responseObject;
    }

    private async postToJira(url: string, params: any): Promise<any> {
        url = `${this.baseUrl}/api/${API_VERSION}/${url}`;

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this._token}`
            },
            body: JSON.stringify(params),
            agent: this.agent
        });
        var j: any = {};
        if (res.size > 0) {
            j = await res.json();
        }
        return j;
    }

    private async putToJira(url: string, params: any): Promise<any> {
        url = `${this.baseUrl}/api/${API_VERSION}/${url}`;

        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this._token}`
            },
            body: JSON.stringify(params),
            agent: this.agent
        });
        var j: any = {};
        if (res.size > 0) {
            j = await res.json();
        }
        return j;
    }
}

// Classes
export interface AutoCompleteSuggestion {
    readonly value: string;
    readonly displayName: string;
}

function readAutoCompleteSuggestion(params: any): AutoCompleteSuggestion {
    return {
        value: params.value,
        displayName: params.displayName
    };
}

// jiraIssueWebview, ca line 160
// res.fields['components'].allowedValues
export class IssueUpdateMetadata {
    public readonly fields: any;

    constructor(value: any) {
        this.fields = value.fields;
    }
}
