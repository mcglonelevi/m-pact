const depcruise = require("dependency-cruiser").cruise;

const modules = depcruise(
    [
        "src/scenes"
    ]
).output.modules;

// these are the files we want to report.
const reportRegex = /src\/scenes\//;

// this is the dependency we want to find.
const needleString = 'node_modules/moment/moment.js';

// First Pass - Remove all orphans and the exact library itself.
let filteredModules = modules.filter((module) => {
    return !(module.orphan || module.source === needleString || module.dependencies.length === 0);
});

const dependentModuleSet = new Set([needleString]);

function recursiveSearch() {
    let foundDependentModule = false;

    filteredModules.forEach((module) => {
        const dependencyArray = module.dependencies.map((dep) => dep.resolved);

        dependencyArray.forEach(dep => {
            if (dependentModuleSet.has(dep)) {
                foundDependentModule = true;
                dependentModuleSet.add(module.source);
            }
        });
    });

    filteredModules = filteredModules.filter((module) => {
        return !dependentModuleSet.has(module.source);
    });

    if (foundDependentModule) {
        // Keep searching until no dependent modules found.
        recursiveSearch();
    }
}

recursiveSearch();

console.log(Array.from(dependentModuleSet).filter(item => reportRegex.test(item)));
