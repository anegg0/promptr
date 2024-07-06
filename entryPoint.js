import FileSpooler from "./src/services/fileSpooler.js";

// Define paths and parameters
const filesListPath = "./listeOfFilesToGenerateDocstringsFor.json";
const promptrFilePath = "./promptr.txt";
const directory = "./test-files"; // Specify your directory path
const exclude = ["exclude-pattern"]; // Specify patterns to exclude

// Initialize and start processing
const fileService = new FileSpooler(
  filesListPath,
  promptrFilePath,
  directory,
  exclude,
);
fileService.startProcessing();
