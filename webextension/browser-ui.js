/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const ENABLE_EXPERIMENTAL_WINDOW = true;

/**
 * Function that implements the command on the toolbar button/shortcut key/menu item
 */
let panelCmd = function(aRunTest, aCanClose) {
    aRunTest = typeof(aRunTest) === "undefined" ? false : aRunTest;
    aCanClose = typeof(aCanClose) === "undefined" ? true : aCanClose;

    browser.runtime.sendMessage({
        command: "legacy-panel-command",
        runTest: aRunTest,
        canClose: aCanClose
    }).then(reply => {
    });

    if (ENABLE_EXPERIMENTAL_WINDOW) {
        opquastPanel.open();
    }

};

// listener on the toolbar button (see browser_action in manifest.json)
browser.browserAction.onClicked.addListener(panelCmd.bind(null, false));

// Creates a menu item in the context menu of a web page
browser.contextMenus.create({
    id: "opquast-panel",
    title: browser.i18n.getMessage("oqs.analyze_with_opquast"),
    contexts: ["all"],
    type: 'normal'
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId != "opquast-panel") {
        return;
    }
    panelCmd(true);
});

// listener for the shortcut key (see commands in manifest.json)
browser.commands.onCommand.addListener(function(command) {
    if (command == "opquast-open") {
        panelCmd(false);
    }
});


browser.windows.onRemoved.addListener(function(windowId) {
    if (!ENABLE_EXPERIMENTAL_WINDOW) {
        return;
    }
    if (opquastPanel.windowInfo && opquastPanel.windowInfo.id == windowId) {
        opquastPanel.onClose();
    }
});

/**
 * Manage the window popup of the extension
 */
var opquastPanel = {
    /**
     * the window showing the panel of the extension
     * @type windows.Window
     */
    windowInfo : null,

    /**
     * Port to communicate with the panel
     * @type runtime.Port
     */
    windowPort : null,

    toggle: function(aCanClose) {
        if (this.windowInfo) {
            if (aCanClose) {
                // let's close the window
                this.close();
            }
        }
        else {
            this.open();
        }
    },

    close : function() {
        if (!this.windowInfo) {
            return;
        }
        let removing = browser.windows.remove(this.windowInfo.id);
        removing.then(() => {
            // stuff to clear things is done from the browser.windows.onRemoved listener
        }, error => {
            console.log(error);
        });
    },

    open : function() {
        if (this.windowInfo) {
            this.windowPort.postMessage({
                command: "panel-focus",
            });
            return;
        }
        let focusedWindowId = 0;
        browser.windows.getLastFocused( {windowTypes: ["normal"]})
            .then(focusedWindow => {
                focusedWindowId = focusedWindow.id;
                return browser.windows.create({
                    url: browser.extension.getURL('panel/main.html'),
                    type: "panel",
                    width: 600,
                    height: 500

                });
            }).then(windowInfo => {
                this.onOpen(windowInfo, focusedWindowId);
            }, error => {
                console.log(error);
            });

    },

    onOpen : function(windowInfo, focusedWindowId) {
        this.windowInfo = windowInfo;
        this._onPanelMessage = (msg) => {
            console.log("message from panel", msg);
        };

        this._onConnect = (port) => {
            this.windowPort = port;
            this.windowPort.onMessage.addListener(this._onPanelMessage);
            this.windowPort.postMessage({
                command: "panel-ready",
                windowId: windowInfo.id,
                browserWindowId: focusedWindowId
            });
        };
        browser.runtime.onConnect.addListener(this._onConnect);
    },
    onClose : function() {
        if (this.windowPort) {
            this.windowPort.onMessage.removeListener(this._onPanelMessage);
            this.windowPort = null;
        }
        this.windowInfo = null;
        browser.runtime.onConnect.removeListener(this._onConnect);
    }
};

