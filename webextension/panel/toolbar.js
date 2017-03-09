


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

    // We set the url to the iframe, so the browser will
    // open a File dialog box to save the content, as it doesn't
    // support the given content type.
    // Issue: we cannot indicate a filename
    let iframe = document.getElementById('download');
    iframe.setAttribute('src', blobUrl);
    window.URL.revokeObjectURL(blobUrl);

    // FIXME. Other solution for the download, by using a link element.
    // We can indicate a filename. However, it doesn't work
    // although it should (according to stackoverflow :-):
    // Firefox doesn't open a dialog box :-( it seems there are errors
    // from inside its components
    /*let link= document.createElementNS("http://www.w3.org/1999/xhtml", "a");
    //document.body.appendChild(link);
    //link.setAttribute('target', '_blank');
    console.log("can download", ("download" in link));
    link.href = blobUrl;
    link.download = 'opquast.csv';
    let event = new MouseEvent("click");
    link.dispatchEvent(event);
    window.setTimeout(() => {
        link.remove();
     window.URL.revokeObjectURL(blobUrl);
    }, 1000*40);
     */
}

