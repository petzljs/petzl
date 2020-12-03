"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var ts_node_1 = require("ts-node");
var types_1 = require("./types");
var logger_1 = __importDefault(require("./logger"));
ts_node_1.register({
    files: true,
});
var Runner = /** @class */ (function () {
    function Runner(queue, config) {
        var _this = this;
        this.getAllFiles = function (dirPath, arrayOfFiles) {
            var files = fs_1.default.readdirSync(dirPath);
            arrayOfFiles = arrayOfFiles || [];
            files.forEach(function (file) {
                if (fs_1.default.statSync(dirPath + "/" + file).isDirectory()) {
                    arrayOfFiles = _this.getAllFiles(dirPath + "/" + file, arrayOfFiles);
                }
                else {
                    arrayOfFiles.push(path_1.default.join(dirPath, "/", file));
                }
            });
            return arrayOfFiles;
        };
        this.joinPathAndRoot = function (input, root) {
            if (root) {
                return path_1.default.join(root, input);
            }
            else {
                return input;
            }
        };
        this.readDirWithMatcher = function (dir, matchers) {
            var allFiles = _this.getAllFiles(dir);
            return allFiles.filter(function (fileName) {
                if (matchers) {
                    for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
                        var extension = matchers_1[_i];
                        if (fileName.endsWith(extension)) {
                            return fileName;
                        }
                    }
                }
                else {
                    return fileName;
                }
            });
        };
        this.getRealPaths = function (paths) {
            return paths.map(function (file) {
                var realPath = fs_1.default.realpathSync(file);
                if (!file) {
                    throw new Error("Could not create path for " + file + ". Check configuration.");
                }
                else {
                    return realPath;
                }
            });
        };
        this.runList = function (paths) {
            var realPaths = _this.getRealPaths(paths);
            var _loop_1 = function (file) {
                _this.queue.pushAction({
                    type: "doOnce",
                    cb: function () {
                        _this.logger.logTestFileName(file);
                    },
                });
                require(file);
            };
            for (var _i = 0, realPaths_1 = realPaths; _i < realPaths_1.length; _i++) {
                var file = realPaths_1[_i];
                _loop_1(file);
            }
            _this.queue.run();
        };
        this.entryPoint = function (config) {
            var root = config.root;
            var cliInput = process.argv[2];
            if (!cliInput) {
                if (root) {
                    var allFiles = _this.getAllFiles(root);
                    _this.runList(allFiles);
                    return;
                }
                else {
                    throw new Error("Must provide 'runner.root' option in config file, or path to file or directory as command line argument ");
                }
            }
            var baseDir = cliInput.split("/")[0];
            var userPath = baseDir === root ? cliInput : _this.joinPathAndRoot(cliInput, root);
            var isDir;
            var isFile;
            try {
                var fileArgStat = fs_1.default.statSync(userPath);
                isDir = fileArgStat.isDirectory();
                isFile = fileArgStat.isFile();
            }
            catch (_a) { }
            if (isFile) {
                // Run file
                _this.logger.logFileOrDirname("file", userPath);
                var filePath = fs_1.default.realpathSync(userPath);
                _this.runList([filePath]);
            }
            else if (isDir) {
                // Run directory
                _this.logger.logFileOrDirname("directory", userPath);
                var allFilesInDir = _this.getAllFiles(userPath);
                _this.runList(allFilesInDir);
            }
            else if (root) {
                var allFiles = _this.getAllFiles(root);
                var chars_1 = userPath.split("");
                var regexStr = chars_1.reduce(function (prev, acc, i) {
                    if (i === chars_1.length - 1) {
                        prev += acc;
                    }
                    else {
                        prev += acc + ".*";
                    }
                    return prev;
                }, "");
                var regex_1 = new RegExp(regexStr);
                var matchingFiles = allFiles.filter(function (fileName) {
                    var matches = fileName.match(regex_1);
                    if (matches && matches.length) {
                        return fileName;
                    }
                });
                _this.runList(matchingFiles);
            }
        };
        this.matchExtensions = function (config) {
            var match = config.match, root = config.root;
            var allPaths = _this.readDirWithMatcher(root, match);
            _this.runList(allPaths);
        };
        this.sequencer = function (config) {
            var sequence = config.sequence, ignore = config.ignore;
            var allSequencedFiles = [];
            for (var _i = 0, sequence_1 = sequence; _i < sequence_1.length; _i++) {
                var fileOrDir = sequence_1[_i];
                var isDir = fs_1.default.statSync(fileOrDir).isDirectory();
                if (isDir) {
                    allSequencedFiles.push.apply(allSequencedFiles, _this.getAllFiles(fileOrDir));
                }
                else {
                    allSequencedFiles.push(fileOrDir);
                }
            }
            if (ignore) {
                var spliceFile = function (file) {
                    var index = allSequencedFiles.indexOf(file);
                    allSequencedFiles.splice(index, 1);
                };
                for (var _a = 0, ignore_1 = ignore; _a < ignore_1.length; _a++) {
                    var fileOrDir = ignore_1[_a];
                    var isDir = fs_1.default.statSync(fileOrDir).isDirectory();
                    if (isDir) {
                        var allFilesInDir = _this.getAllFiles(fileOrDir);
                        for (var _b = 0, allFilesInDir_1 = allFilesInDir; _b < allFilesInDir_1.length; _b++) {
                            var file = allFilesInDir_1[_b];
                            spliceFile(file);
                        }
                    }
                    else {
                        spliceFile(fileOrDir);
                    }
                }
            }
            _this.runList(allSequencedFiles);
        };
        this.run = function () {
            var runnerConfig = _this.config.runner;
            if (types_1.isMatchExtensionsConfig(runnerConfig)) {
                _this.matchExtensions(runnerConfig);
            }
            else if (types_1.isEntryPointConfig(runnerConfig)) {
                _this.entryPoint(runnerConfig);
            }
            else if (types_1.isSequencerConfig(runnerConfig)) {
                _this.sequencer(runnerConfig);
            }
            else {
                throw new Error("Cannot read runner cofiguration");
            }
        };
        this.queue = queue;
        this.config = config;
        this.logger = new logger_1.default(config);
    }
    return Runner;
}());
exports.default = Runner;
//# sourceMappingURL=runner.js.map