"use strict";

const {Cu} = require("chrome");

const self = require("sdk/self");
const {prefs} = require("sdk/simple-prefs");
const {URL} = require("sdk/url");

const tester = require("./app/tester");
const testRunner = require("opquast-tests/test-runner");

const exportedAPI = Cu.import(self.data.url("api.jsm"), {});


// Add a new checklist
exportedAPI.addChecklist = function(root, name, spec) {
    // Check spec
    if (typeof(spec.name) === "undefined") {
        throw new Error("Checklist spec for '" + name + "' has no name");
    }
    if (typeof(spec.langs) === "undefined" || !Array.isArray(spec.langs)) {
        throw new Error("spec.langs for '" + name + "' should be an array");
    }
    if (!spec.category) {
        spec.category = name;
    }

    spec.rootURI = root;

    tester.checklists[name] = spec;
};


// Remove a checklist
exportedAPI.removeChecklist = function(name) {
    if (tester.checklists[name]) {
        delete(tester.checklists[name]);
    }
};


// Get all checklists
exportedAPI.getChecklists = function() {
    return tester.checklists;
};


// Default checklists pref
exportedAPI.setDefault = function(id) {
    let cl = prefs.checklists.split(",");
    if (cl.indexOf(id) === -1) {
        cl.push(id);
    }
    prefs.checklists = cl.join(",");
};
exportedAPI.unsetDefault = function(id) {
    let cl = prefs.checklists.split(",");
    let idx = cl.indexOf(id);
    if (idx === -1) {
        return;
    }
    cl.splice(idx);
    prefs.checklists = cl.join(",");
};


// Test runner extension points
exportedAPI.addJSFiles = testRunner.addJSFiles;
exportedAPI.removeJSFiles = testRunner.removeJSFiles;

exportedAPI.addRules = testRunner.addRules;
exportedAPI.removeRules = testRunner.removeRules;

exportedAPI.addRuleSets = testRunner.addRuleSets;
exportedAPI.removeRuleSets = testRunner.removeRuleSets;

exportedAPI.getJSFiles = testRunner.getJSFiles;
exportedAPI.getRules = testRunner.getRules;


exportedAPI.EXPORTED_SYMBOLS.push(
    "addChecklist", "removeChecklist", "getChecklists",
    "setDefault", "unsetDefault",
    "addJSFiles", "removeJSFiles",
    "addRules", "removeRules",
    "addRuleSets", "removeRuleSets",
    "getJSFiles", "getRules"
);