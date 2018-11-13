import { window } from 'vscode';
import { AbstractReactWebview, InitializingWebview } from './abstractWebview';
import { Action } from '../ipc/messaging';
import { IssueData } from '../ipc/issueMessaging';
import { Issue, emptyIssue, issueOrKey, isIssue } from '../jira/jiraModel';
import { fetchIssue } from "../jira/fetchIssue";
import { Logger } from '../logger';
import { isTransitionIssue } from '../ipc/issueActions';
import { transitionIssue } from '../commands/jira/transitionIssue';

export class JiraIssueWebview extends AbstractReactWebview<IssueData,Action> implements InitializingWebview<issueOrKey> {
    private _state: Issue = emptyIssue;

    constructor(extensionPath: string) {
        super(extensionPath);
    }

    public get title(): string {
        return "Jira Issue";
    }
    public get id(): string {
        return "jiraIssueView";
    }

    initialize(data: issueOrKey) {
        if(isIssue(data)) {
            this.updateIssue(data);
            return;
        }

        fetchIssue(data)
        .then((issue: Issue) => {
            this.updateIssue(issue);
        })
        .catch((reason: any) => {
            Logger.error(reason);
        });
    }

    public invalidate() {
        this.forceUpdateIssue();
    }

    protected onMessageReceived(e: Action): boolean {
        let handled = super.onMessageReceived(e);

        if(!handled) {
            switch (e.action) {
                case 'refreshIssue': {
                    handled = true;
                    // TODO: re-fetch the issue
                    this.updateIssue(this._state);
                }
                case 'transitionIssue': {
                    if (isTransitionIssue(e)) {
                        handled = true;
                        transitionIssue(e.issue,e.transition).catch((e: any) => {
                            Logger.error(new Error(`error transitioning issue: ${e}`));
                            window.showErrorMessage('Issue could not be transitioned', e);
                        });
                    }
                }
            }
        }

        return handled;
    }

    public async updateIssue(issue: Issue) {
        this._state = issue;
        if(this._panel){ this._panel.title = `Jira Issue ${issue.key}`; }

        let msg = issue as IssueData;
        msg.type = 'update';
        this.postMessage(msg);
    }

    private async forceUpdateIssue() {
        if(this._state.key !== ""){
            fetchIssue(this._state.key)
                .then((issue: Issue) => {
                    this.updateIssue(issue);
                })
                .catch((reason: any) => {
                    Logger.error(reason);
                });
        }
    }
}