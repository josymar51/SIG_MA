'use strict';

import { TrackEvent, UIEvent, AnalyticsClientInit, ScreenEvent, TrackEventData, UIEventData, ScreenEventData } from "./types";

import Analytics from 'analytics-node';
import { requireValue, validateTrackEvent, validateUIEvent, validateScreenEvent } from './preconditions';

const ANALYTICS_WRITE_KEY = 'BLANK';
const TRACK_EVENT_TYPE = 'track';
const UI_EVENT_TYPE = 'ui';
const SCREEN_EVENT_TYPE = 'screen';
const EVENT_ORIGIN = 'server';
const DEFAULT_QUEUE_FLUSH_SIZE = 250;
const DEFAULT_QUEUE_FLUSH_INTERVAL = 10000;


function getUrlFromEnvironment(env?: string) {
    if (env === 'prod') {
        return 'https://as.atlassian.com/api';
    } else {
        return 'https://analytics-service.us-east-1.staging.public.atl-paas.net/api';
    }
}

function useDefault(value: any, defaultValue: any) {
    if (value === undefined) {
        return defaultValue;
    }
    return value;
}

class AnalyticsClient {
    config: { env: any; product: any; subproduct: any; datacenter: any; origin: any; version: any; };
    analyticsClient: any;
    static _buildProperties(
        { userIdType, tenantIdType, tenantId, trackEvent, subproduct, product, env, datacenter, version }
            : { userIdType: string, tenantIdType: string, tenantId: string, trackEvent: TrackEventData, subproduct: string, product: string, env: string, datacenter: string, version: string }) {
        return Object.assign({}, trackEvent, {
            product,
            env,
            datacenter,
            version,
            eventType: TRACK_EVENT_TYPE,
            subproduct,
            userIdType,
            tenantIdType,
            tenantId
        });
    }

    static _buildUIProperties(
        {userIdType, tenantIdType, tenantId, uiEvent, subproduct, product, env, datacenter, version}
            : { userIdType: string, tenantIdType: string, tenantId: string, uiEvent: UIEventData, subproduct: string, product: string, env: string, datacenter: string, version: string }) {
        return Object.assign({}, uiEvent, {
            product,
            env,
            datacenter,
            version,
            eventType: UI_EVENT_TYPE,
            subproduct,
            userIdType,
            tenantIdType,
            tenantId
        });
    }

    static _buildScreenProperties(
        {userIdType, tenantIdType, tenantId, screenEvent, subproduct, product, env, datacenter, version}
            : { userIdType: string, tenantIdType: string, tenantId: string, screenEvent: ScreenEventData, subproduct: string, product: string, env: string, datacenter: string, version: string }) {
        return Object.assign({}, screenEvent, {
            product,
            env,
            datacenter,
            version,
            eventType: SCREEN_EVENT_TYPE,
            subproduct,
            userIdType,
            tenantIdType,
            tenantId
        });
    }



    constructor({env, product, subproduct, datacenter, version, origin, flushAt, flushInterval, baseUrl}: AnalyticsClientInit) {
        requireValue(env, 'env');
        requireValue(product, 'product');

        this.config = {
            env,
            product,
            subproduct,
            datacenter,
            origin: useDefault(origin, EVENT_ORIGIN),
            version
        };

        this.analyticsClient = new Analytics(ANALYTICS_WRITE_KEY, {
            flushAt: flushAt || DEFAULT_QUEUE_FLUSH_SIZE,
            flushInterval: flushInterval || DEFAULT_QUEUE_FLUSH_INTERVAL,
            host: baseUrl || getUrlFromEnvironment(env)
        });
    }

    sendTrackEvent({userIdType, userId, anonymousId, tenantIdType, tenantId, trackEvent, subproduct, product}: TrackEvent) {
        return validateTrackEvent({userIdType, userId, anonymousId, tenantIdType, tenantId, trackEvent})
            .then(() =>
                new Promise((resolve, reject) => {
                    this.analyticsClient.track({
                        userId,
                        anonymousId,
                        event: trackEvent.actionSubject + ' ' + trackEvent.action,
                        properties: AnalyticsClient._buildProperties({
                            userIdType,
                            tenantIdType,
                            tenantId,
                            trackEvent,
                            subproduct: useDefault(subproduct, this.config.subproduct),
                            product: useDefault(product, this.config.product),
                            env: this.config.env,
                            datacenter: this.config.datacenter,
                            version: this.config.version
                        })
                    }, (error: any, data: any) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(data);
                        }
                    });
                })
            );
    }

    sendUIEvent({userIdType, userId, anonymousId, tenantIdType, tenantId, uiEvent, subproduct, product}: UIEvent) {
        return validateUIEvent({userIdType, userId, anonymousId, tenantIdType, tenantId, uiEvent})
            .then(() =>
                new Promise((resolve, reject) => {
                    this.analyticsClient.track({
                        userId,
                        anonymousId,
                        event: uiEvent.actionSubject + ' ' + uiEvent.action,
                        properties: AnalyticsClient._buildUIProperties({
                            userIdType,
                            tenantIdType,
                            tenantId,
                            uiEvent,
                            subproduct: useDefault(subproduct, this.config.subproduct),
                            product: useDefault(product, this.config.product),
                            env: this.config.env,
                            datacenter: this.config.datacenter,
                            version: this.config.version
                        })
                    }, (error: any, data: any) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(data);
                        }
                    });
                })
            );
    }

    sendScreenEvent({userIdType, userId, anonymousId, tenantIdType, tenantId, name, screenEvent, subproduct, product}: ScreenEvent) {
        return validateScreenEvent({userIdType, userId, anonymousId, tenantIdType, tenantId, name, screenEvent})
            .then(() =>
                new Promise((resolve, reject) => {
                    this.analyticsClient.page({
                        userId,
                        anonymousId,
                        name,
                        properties: AnalyticsClient._buildScreenProperties({
                            userIdType,
                            tenantIdType,
                            tenantId,
                            screenEvent,
                            subproduct: useDefault(subproduct, this.config.subproduct),
                            product: useDefault(product, this.config.product),
                            env: this.config.env,
                            datacenter: this.config.datacenter,
                            version: this.config.version
                        })
                    }, (error: any, data: any) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(data);
                        }
                    });
                })
            );
    }

    flush() {
        return new Promise((resolve, reject) => {
            this.analyticsClient.flush((err: any, data: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
}

export {
    AnalyticsClient
};