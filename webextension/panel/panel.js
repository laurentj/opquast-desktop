/**
 * The id of our window
 * @type {number}
 */
var opquastWindowId = 0;

/**
 * the id of the focused window of the browser
 * @type {number}
 */
var currentBrowserWindowId = 0;

/**
 * the id of the selected if into the focused window
 * @type {number}
 */
var selectedTabId = 0;

/**
 * Communication channel to the background scripts
 */
var backgroundPort = browser.runtime.connect({name: "opquast-panel"});

/**
 * listen message from the background scripts
 */
backgroundPort.onMessage.addListener(function(msg) {
    if (!("command" in msg)) {
        return;
    }

    switch(msg.command) {
        case "panel-ready":
            console.log("Panel init is done.");
            opquastWindowId = msg.windowId;
            onWindowFocusChanged(msg.browserWindowId);
            break;
        case "panel-focus":
            console.log("focus to panel");
            window.focus();
            break;
    }
});



function onWindowFocusChanged(newFocusedWinId) {
    if (newFocusedWinId == browser.windows.WINDOW_ID_NONE) {
        // all browsers window loosed the focus
        return;
    }
    if (newFocusedWinId == opquastWindowId) {
        // ignore ourselves
        return;
    }

    if (newFocusedWinId == currentBrowserWindowId) {
        return;
    }
    console.log("onWindowFocusChanged", newFocusedWinId);
    // get windows type: we want only browser windows
    browser.windows.get(newFocusedWinId)
        .then(win =>{

            console.log(win);
            if (win.type != 'normal') {
                return Promise.reject("unsupported window type");
            }
            // let's retrieve the current active tab of the windows
            return browser.tabs.query({
                active: true,
                windowId: newFocusedWinId
            });
        })
        .then(tabs => {
            if (tabs.length) {
                let tab = tabs[0];
                currentBrowserWindowId = newFocusedWinId;
                console.log("found tab", tab);
                if (tab.status == 'complete') {
                    showPanelForTab(tab.id, tab)
                }
            }
        })
        .catch(err => {
            console.log("onWindowFocusChanged failed", err);
        });
}

browser.windows.onFocusChanged.addListener(onWindowFocusChanged);


/**
 *
 * @param tabs.Tab
 */
function onTabCreated(tab) {
    console.log("tab created", tab);
    if (tab.windowId != currentBrowserWindowId) {
        return;
    }
}


function onTabRemoved(tabId, removeInfo) {
    //removeInfo.windowId
    //removeInfo.isWindowClosing
    console.log("onTabRemoved", tabId, removeInfo);

    removePanelOfTab(tabId);
}

/**
 * called during the loading of a page in a tab
 * @param tabId
 * @param changeInfo
 * @param tab
 */
function onTabUpdated(tabId, changeInfo, tab) {
    console.log("onTabUpdated", tabId, changeInfo, tab);
    // tab.status = "loading", "complete"
    // tab.url
    if (tabId != selectedTabId || tab.status != 'complete' ) {
        return;
    }
    showPanelForTab(tabId, tab);
}

/**
 * called when a user select a tab
 * @param activeInfo
 */
function onTabActivated(activeInfo) {
    console.log("tab activated", activeInfo);
    currentBrowserWindowId = activeInfo.windowId;
    let url = mapTabPanels.get(activeInfo.tabId);
    if (!url) {
        browser.tabs.get(activeInfo.tabId).then(
            tab => {
                showPanelForTab(activeInfo.tabId, tab);
            }
        )
    }
    else {
        showPanelForTab(activeInfo.tabId);
    }
}

browser.tabs.onCreated.addListener(onTabCreated);
browser.tabs.onActivated.addListener(onTabActivated);
browser.tabs.onUpdated.addListener(onTabUpdated);
browser.tabs.onRemoved.addListener(onTabRemoved);


// map tabId => url
var mapTabPanels = new Map();

function showPanelForTab(tabId, tab) {
    selectedTabId = tabId;
    let url;
    if (tab) {
        url =  tab.url;
        mapTabPanels.set(tabId, tab.url);
    }
    else {
        url = mapTabPanels.get(tabId);
        if (!url) {
            return;
        }
    }

    let deckPanels = document.getElementById("panels");

    let panel = deckPanels.querySelector('div[data-url="'+url+'"]');

    // create the panel if it doesn't exist
    if (!panel) {
        panel = document.getElementById("tplPanel").content.firstElementChild.cloneNode(true);
        panel = deckPanels.appendChild(panel);
        panel.setAttribute('data-url', url);
    }

    // update title and url
    if (tab) {
        panel.querySelector(".page-title").textContent = tab.title;
        panel.querySelector(".page-url").textContent = tab.url;
    }

    let l = deckPanels.children.length;
    for (let i=0; i < l; i++) {
        deckPanels.children[i].classList.remove("active");
    }
    panel.classList.add("active");
}

function removePanelOfTab(tabId) {
    let tabUrl = mapTabPanels.get(tabId);
    if (tabUrl) {
        mapTabPanels.delete(tabId);

        // let's verify that the url is not used by an other tab
        let found = false;
        mapTabPanels.forEach((url, tabId) => {
            if (url == tabUrl) {
                found = true;
            }
        });
        if (found) {
            // don't remove the panel if the url is loaded into an other
            // tab
            return;
        }

        let deckPanels = document.getElementById("panels");
        let panel = deckPanels.querySelector('div[data-url="'+tabUrl+'"]');
        if (panel) {
            deckPanels.removeChild(panel);
        }
    }
}


window.addEventListener("load", function() {

});

window.addEventListener("unload", function() {
    browser.tabs.onCreated.removeListener(onTabCreated);
    browser.tabs.onActivated.removeListener(onTabActivated);
    browser.tabs.onUpdated.removeListener(onTabUpdated);
    browser.tabs.onRemoved.removeListener(onTabRemoved);
    browser.windows.onFocusChanged.removeListener(onWindowFocusChanged);
});
