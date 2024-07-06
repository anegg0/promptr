const fs = require("fs");
const { exec } = require("child_process");

const filesListPath = "./listeOfFilesToGenerateDocstringsFor.json";
const promptrFilePath = "./promptr.txt";

// Load the list of files from the JSON file
let fileList;
try {
  fileList = JSON.parse(fs.readFileSync(filesListPath, "utf8"));
} catch (error) {
  console.error(`Error reading ${filesListPath}:`, error);
  process.exit(1);
}

// Function to update the content of the promptr.txt file
function updatePromptrFile(fileName, callback) {
  fs.readFile(promptrFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading ${promptrFilePath}:`, err);
      process.exit(1);
    }

    const newContent = data.replace(
      /Please write docstrings for the following file\(s\): .*/,
      `Please write docstrings for the following file(s): ${fileName}`,
    );

    fs.writeFile(promptrFilePath, newContent, "utf8", (err) => {
      if (err) {
        console.error(`Error writing to ${promptrFilePath}:`, err);
        process.exit(1);
      } else {
        console.log(`Updated ${promptrFilePath} with fileName: ${fileName}`);
        callback();
      }
    });
  });
}

// Function to run the promptr command
function runPromptr(callback) {
  exec("promptr -p promptr.txt", (err, stdout, stderr) => {
    if (err) {
      console.error("Error executing promptr:", err);
      process.exit(1);
    }
    if (stderr) {
      console.error("Error output from promptr:", stderr);
    } else {
      console.log("Output from promptr:", stdout);
    }
    callback();
  });
}

// Function to process the file list
let currentFileIndex = 0;
function processFileList() {
  if (currentFileIndex < fileList.length) {
    const fileName = fileList[currentFileIndex];
    updatePromptrFile(fileName, () => {
      runPromptr(() => {
        currentFileIndex++;
        processFileList();
      });
    });
  } else {
    console.log("All files have been processed.");
  }
}

// Initial run
processFileList();
