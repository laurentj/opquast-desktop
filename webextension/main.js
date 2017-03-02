/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


// main background script of the extension

/*
// connection less messaging
browser.runtime.sendMessage("message-from-webextension").then(reply => {
    if (reply) {
        console.log("response from legacy add-on: " + reply.content);
    }
});
*/

/* TODO enable this when addon will be fully a webextension
browser.runtime.onInstalled.addListener(function (details) {
    console.log("install reason", details);
    if (details.reason == 'install') {
        openAbout();
    }
});
*/

function openAbout() {
    browser.i18n.getAcceptLanguages().then(languages => {
        let locale = '';
        languages.forEach(language=>{
            if (locale != '') {
                return;
            }
            ['en','fr'].forEach(localCode => {
                if ((language.startsWith(localCode+'-') ||
                    language == localCode) && locale == ''
                ) {
                    locale = localCode;
                }
            });
        });
        if (locale == '') {
            locale = 'en';
        }

        browser.tabs.create({
            url: "/pages/about-"+locale+".html"
        });
    });
}

