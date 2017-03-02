
let manifest = browser.runtime.getManifest();

window.addEventListener("load", function() {
    let allVersions = document.querySelectorAll(".version");

    Array.prototype.forEach.call(allVersions, function(span){
        span.textContent = manifest.version;
    });

});

