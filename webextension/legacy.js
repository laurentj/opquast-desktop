/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// let's connect to the legacy addon
var legacyAddonPort = browser.runtime.connect({name: "legacy-opquast"});

legacyAddonPort.onMessage.addListener(function(msg) {
    if (!("cmd" in msg)) {
        return;
    }

    switch(msg.cmd) {
        case "open-about":
            openAbout();
            break;
    }
});
