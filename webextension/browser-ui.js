/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


// Common
let panelCmd = function(aRunTest, aCanClose) {
    aRunTest = typeof(aRunTest) === "undefined" ? false : aRunTest;
    aCanClose = typeof(aCanClose) === "undefined" ? true : aCanClose;

    browser.runtime.sendMessage({
        command: "legacy-panel-command",
        runTest: aRunTest,
        canClose: aCanClose
    }).then(reply => {
    });
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