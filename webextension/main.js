// main background script of the extension

/*
// connection less messaging
browser.runtime.sendMessage("message-from-webextension").then(reply => {
    if (reply) {
        console.log("response from legacy add-on: " + reply.content);
    }
});


//Connection-oriented messaging
var port = browser.runtime.connect({name: "connection-to-legacy"});

port.onMessage.addListener(function(message) {
console.log("Message from legacy add-on: " + message.content);
});

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
};


browser.browserAction.onClicked.addListener(panelCmd.bind(null, false));





