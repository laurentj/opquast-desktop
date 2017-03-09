


window.addEventListener("load", function() {

    document.getElementById("btn-export")
        .addEventListener("click", testExport, false);

});

function testExport() {
    let csvContent = [
        String.fromCharCode(0xFEFF), // bom
        "ID;List;Reference;Label;Changed;Code;Result;Comment;Details;"+"\n",
        '"500";"Qualité Web - Opquast V2";"1";"Every image is provided with a proper alternative text";"";"nc";"Fail";"au moins un élément IMG sans attribut ALT a été détecté";"<img src=""assets/img/glouton-homeOmbre.png"">'+"\n",
        '<img class=""imgbtn"" src=""assets/img/git2.png"">'+"\n",
        '<img class=""imgbtn"" src=""assets/img/git1.png"">'+"\n",
        '<img src=""assets/img/tweet.png"">'+"\n",
        '<img class=""imgbtn"" src=""assets/img/tchat2.png"">'+"\n",
        '<img class=""imgbtn"" src=""assets/img/bug_bleu.png"">"'+"\n",
        '"501";"Qualité Web - Opquast V2";"2";"The page\'s source code begins with a Document Type Declaration (DTD) whose syntax is one of those recommended by the W3C";"";"c";"Pass";"une DTD placée avant l\'élément HTML et conforme aux recommandations du W3C a été détectée";""'+"\n",
        '"502";"Qualité Web - Opquast V2";"3";"Each page\'s content is organised according to a hierarchical heading and sub-heading structure";"";"c";"Pass";"aucune interruption dans la hiérarchie des titres n\'a été détectée";""'+"\n"
    ];
    let csvBlob = new Blob(csvContent, { type: "text/csv" });
    let blobUrl = window.URL.createObjectURL(csvBlob);

    let downloadId = null;
    let dwnOnChanged = function(downloadDelta) {
        if (downloadId === null || downloadDelta.id != downloadId) {
            return;
        }
        if (! ('state' in downloadDelta)) {
            return;
        }
        console.log(`downloading state: ${downloadDelta.state.current}`);
        if (downloadDelta.state.current == 'complete' ||
            downloadDelta.state.current == 'interrupted' ) {
            window.URL.revokeObjectURL(blobUrl);
            downloadId = null;
            browser.downloads.onChanged.removeListener(dwnOnChanged);
            console.log("finished !");
        }
    };

    browser.downloads.onChanged.addListener(dwnOnChanged);
    browser.downloads.download({
        url: blobUrl,
        filename: "opquast.csv",
        saveAs: true,
    }).then(dwnId => {
            downloadId = dwnId;
            console.log(`Started downloading: ${id}`);
    },error => {
        console.log(`Download failed: ${error}`);
    });
}

