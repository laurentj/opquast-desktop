"use strict";

const {Ci,Cr} = require("chrome");

const {Class, mix} = require("sdk/core/heritage");
const self = require("sdk/self");
const system = require("sdk/system");
const unload = require("sdk/system/unload");
const {setTimeout} = require("sdk/timers");

const tabBrowser = require("sdk/deprecated/tab-browser");

const NetLog = require("net-log/net-log");

const {WindowCache} = require("./window-cache");


let _RequestCache = Class({
    extends: WindowCache,

    initBrowser: function(browser) {
        this.removeBrowser(browser);
        this.setEntry(browser.contentWindow, harLog(browser));
    },

    removeBrowser: function(browser) {
        this.dropEntry(browser.contentWindow);
        NetLog.unregisterBrowser(browser);
    }
});
let RequestCache = _RequestCache();
exports.RequestCache = RequestCache;

const TabRequestsLogger = function() {
    tabBrowser.TabTracker({
        onTrack: function(tab) {
            let browser = tab.linkedBrowser;

            browser.addProgressListener(TabProgressListener, Ci.nsIWebProgress.NOTIFY_STATE_ALL);
            RequestCache.initBrowser(browser);
        },
        onUntrack: function(tab) {
            let browser = tab.linkedBrowser;

            browser.removeProgressListener(TabProgressListener);
            RequestCache.removeBrowser(browser);
        }
    });
};
exports.TabRequestsLogger = TabRequestsLogger;

NetLog.startTracer();

let TabProgressListener = {
    QueryInterface: function(aIID) {
        if (aIID.equals(Ci.nsIWebProgressListener) ||
        aIID.equals(Ci.nsISupportsWeakReference) ||
        aIID.equals(Ci.nsISupports))
            return this;
        throw Cr.NS_NOINTERFACE;
    },

    _isStart: function(flags) {
        return (
            (flags & Ci.nsIWebProgressListener.STATE_START) &&
            (flags & Ci.nsIWebProgressListener.STATE_IS_REQUEST) &&
            (flags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT) &&
            (flags & Ci.nsIWebProgressListener.STATE_IS_WINDOW)
        );
    },

    _isTransferring: function(flags) {
        return (
            (flags & Ci.nsIWebProgressListener.STATE_TRANSFERRING) &&
            (flags & Ci.nsIWebProgressListener.STATE_IS_DOCUMENT)
        );
    },

    _isMainWindow: function(progress) {
        return progress.DOMWindow === progress.DOMWindow.top;
    },

    onStateChange: function(progress, request, flags, status) {
        let browser = NetLog.getBrowserForRequest(request);
        if (!browser) {
            return;
        }


        if (this._isStart(flags) && this._isMainWindow(progress)) {
            // Start net-log on start
            RequestCache.initBrowser(browser);
        }

        if (this._isTransferring(flags) && this._isMainWindow(progress)) {
            // Stop net-log once page is loaded
            browser.contentWindow.addEventListener("load", function stopNetLog() {
                browser.contentWindow.removeEventListener("load", stopNetLog, true);

                setTimeout(function() {
                    // Don't need to keep net-log getting entries forever
                    NetLog.unregisterBrowser(browser);
                }, 1000);
            }, true);
        }
    },
};


const harLog = function(browser) {
    let resources = {};

    var result = {
        "version": "1.2",
        "creator": {
            "name": self.name,
            "version": self.version
        },
        "browser": {
            "name": system.name,
            "version": system.version
        },
        "pages": [],
        "entries": []
    };

    let createEntry = function(r) {
        if (!r.response.start || !r.response.end) {
            return;
        }

        let mimeType = "";
        r.response.end.headers.forEach(function(val) {
            if (val.name.toLowerCase() == "content-type") {
                mimeType = val.value;
            }
        });

        return {
            "_url": r.response.end.url,
            "pageref": browser.contentWindow.location.href,
            "startedDateTime": r.request.time.toISOString(),
            "time": r.response.end.time - r.request.time,
            "request": {
                "method": r.request.method,
                "url": r.request.url,
                "httpVersion": "HTTP/1.1",
                "cookies": [],
                "headers": r.request.headers,
                "queryString" : [],
                "postData" : {},
                "headersSize" : -1,
                "bodySize" : -1
            },
            "response": {
                "status": r.response.end.status,
                "statusText": r.response.end.statusText,
                "httpVersion": "HTTP/1.1",
                "cookies": [],
                "headers": r.response.end.headers,
                "content": {
                    "size": r.response.end.bodySize,
                    "compression": 0,
                    "mimeType": mimeType,
                    "text": r.response.end.body
                },
                "redirectURL": r.response.end.redirectURL || "",
                "headersSize" : -1,
                "bodySize" : r.response.end.bodySize,
                "_contentType": r.response.end.contentType,
                "_contentCharset": r.response.end.contentCharset,
                "_referrer": r.response.end.referrer,
                "_imageInfo": r.response.end.imageInfo || null
            },
            "cache": {},
            "timings": {
                "send": 0,
                "wait": r.response.start.time - r.request.time,
                "receive": r.response.end.time - r.response.start.time
            }
        };
    };

    NetLog.registerBrowser(browser, {
        captureTypes: [
            /^text\/css/,
            /^(application|text)\/(x-)?javascript/,
        ],
        onRequest: function(request) {
            resources[request.id] = {
                request: request,
                response: {"start": null, "end": null}
            };
        },
        onResponse: function(response) {
            if (typeof(resources[response.id]) === "undefined") {
                return;
            }

            resources[response.id].response[response.stage] = response;

            if (response.stage == "end") {
                result.entries.push(createEntry(resources[response.id]));
                delete(resources[response.id]);
            }
        }
    })

    return result;
};