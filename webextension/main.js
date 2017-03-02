/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


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



