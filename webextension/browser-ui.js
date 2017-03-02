
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

