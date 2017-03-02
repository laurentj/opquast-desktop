
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


browser.browserAction.onClicked.addListener(panelCmd.bind(null, false));


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

