import { commands, env } from 'vscode';
import { authenticateButtonEvent, doneButtonEvent, logoutButtonEvent, moreSettingsButtonEvent } from '../analytics';
import { DetailedSiteInfo, isBasicAuthInfo, Product, ProductBitbucket, ProductJira } from '../atlclients/authInfo';
import { Commands } from '../commands';
import { authenticateCloud, authenticateServer, clearAuth } from '../commands/authenticate';
import { Container } from '../container';
import { isLoginAuthAction, isLogoutAuthAction } from '../ipc/configActions';
import { Action } from '../ipc/messaging';
import { Logger } from '../logger';
import { SitesAvailableUpdateEvent } from '../siteManager';
import { AbstractReactWebview } from './abstractWebview';

export class OnboardingWebview extends AbstractReactWebview {

    constructor(extensionPath: string) {
        super(extensionPath);

        Container.context.subscriptions.push(
            Container.siteManager.onDidSitesAvailableChange(this.onSitesAvailableChange, this),
        );
    }

    public get title(): string {
        return "Getting Started";
    }

    public get id(): string {
        return "atlascodeOnboardingScreen";
    }

    public get siteOrUndefined(): DetailedSiteInfo | undefined {
        return undefined;
    }

    public get productOrUndefined(): Product | undefined {
        return undefined;
    }

    public async invalidate() {
        const jiraSitesAvailable = Container.siteManager.getSitesAvailable(ProductJira);
        const bitbucketSitesAvailable = Container.siteManager.getSitesAvailable(ProductBitbucket);
        const [cloudJira, serverJira] = this.separateCloudFromServer(jiraSitesAvailable);
        const [cloudBitbucket, serverBitbucket] = this.separateCloudFromServer(bitbucketSitesAvailable);
        const isRemote = env.remoteName !== undefined;
        this.postMessage({
            type: 'update',
            isRemote: isRemote,
            jiraCloudSites: cloudJira,
            jiraServerSites: serverJira,
            bitbucketCloudSites: cloudBitbucket,
            bitbucketServerSites: serverBitbucket
        });
    }

    private onSitesAvailableChange(e: SitesAvailableUpdateEvent) {
        const jiraSitesAvailable = Container.siteManager.getSitesAvailable(ProductJira);
        const bitbucketSitesAvailable = Container.siteManager.getSitesAvailable(ProductBitbucket);
        const [cloudJira, serverJira] = this.separateCloudFromServer(jiraSitesAvailable);
        const [cloudBitbucket, serverBitbucket] = this.separateCloudFromServer(bitbucketSitesAvailable);
        this.postMessage({
            type: 'sitesAvailableUpdate',
            jiraCloudSites: cloudJira,
            jiraServerSites: serverJira,
            bitbucketCloudSites: cloudBitbucket,
            bitbucketServerSites: serverBitbucket
        });
    }

    private separateCloudFromServer(siteList: DetailedSiteInfo[]): [DetailedSiteInfo[], DetailedSiteInfo[]] {
        let cloudSites: DetailedSiteInfo[] = [];
        let serverSites: DetailedSiteInfo[] = [];
        for (const site of siteList) {
            if (site.isCloud) {
                cloudSites.push(site);
            } else {
                serverSites.push(site);
            }
        }
        return [cloudSites, serverSites];
    }

    protected async onMessageReceived(msg: Action): Promise<boolean> {
        let handled = await super.onMessageReceived(msg);
        if (!handled) {
            switch (msg.action) {
                case 'openSettings': {
                    moreSettingsButtonEvent(this.id).then(e => { Container.analyticsClient.sendUIEvent(e); });
                    commands.executeCommand(Commands.ShowConfigPage);
                    break;
                }
                case 'closePage': {
                    doneButtonEvent(this.id).then(e => { Container.analyticsClient.sendUIEvent(e); });
                    this.hide();
                    break;
                }
                case 'login': {
                    handled = true;
                    if (isLoginAuthAction(msg)) {
                        if (isBasicAuthInfo(msg.authInfo)) {
                            try {
                                await authenticateServer(msg.siteInfo, msg.authInfo);
                            } catch (e) {
                                let err = new Error(`Authentication error: ${e}`);
                                Logger.error(err);
                                this.postMessage({ type: 'error', reason: this.formatErrorReason(e, 'Authentication error') });
                            }
                        } else {
                            authenticateCloud(msg.siteInfo);
                        }
                        authenticateButtonEvent(this.id).then(e => { Container.analyticsClient.sendUIEvent(e); });
                    }
                    break;
                }
                case 'logout': {
                    handled = true;
                    if (isLogoutAuthAction(msg)) {
                        clearAuth(msg.detailedSiteInfo);
                        logoutButtonEvent(this.id).then(e => { Container.analyticsClient.sendUIEvent(e); });
                    }
                    break;
                }
            }
        }
        return handled;
    }
}
