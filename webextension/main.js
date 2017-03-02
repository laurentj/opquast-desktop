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



