
var backgroundPort = browser.runtime.connect({name: "opquast-panel"});

backgroundPort.onMessage.addListener(function(msg) {
    if (!("command" in msg)) {
        return;
    }

    switch(msg.command) {
        case "show-tab-info":
            console.log("Show tab info");
            break;
        case "panel-ready":
            console.log("Panel init is done");
            break;
        case "panel-focus":
            console.log("focus to panel");
            window.focus();
            break;
    }
});

window.addEventListener("load", function() {
    document.getElementById('testbutton').addEventListener("click", event => {
        backgroundPort.postMessage({command:"click"});
    }, true );
});