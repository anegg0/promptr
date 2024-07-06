"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
function filter_files_and_directories(directory, exclude) {
    var filtered_files = [];
    var files = fs.readdirSync(directory);
    var _loop_1 = function (file) {
        if (!exclude.some(function (excluded) { return file.includes(excluded); })) {
            filtered_files.push(path.resolve(directory, file));
        }
    };
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        _loop_1(file);
    }
    return filtered_files;
}
function main() {
    var args = {
        directory: process.argv[2],
        exclude: process.argv.slice(3, -1),
        output_file: process.argv[process.argv.length - 1],
    };
    var filtered_files = filter_files_and_directories(args.directory, args.exclude);
    fs.writeFileSync(args.output_file, JSON.stringify(filtered_files, null, 4));
    console.log("Filtered files have been saved to ".concat(args.output_file));
}
main();
