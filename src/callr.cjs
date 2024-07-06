const fs = require("fs");
const { exec } = require("child_process");

// Path to the JSON file containing the list of files
const filesListPath = "./listeOfFilesToGenerateDocstringsFor.json";

// Path to promptr.txt
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
function updatePromptrFile(fileName) {
  fs.readFile(promptrFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading ${promptrFilePath}:`, err);
      return;
    }

    const newContent = data.replace(
      /Please write docstrings for the following file\(s\): .*/,
      `Please write docstrings for the following file(s): ${fileName}`,
    );

    fs.writeFile(promptrFilePath, newContent, "utf8", (err) => {
      if (err) {
        console.error(`Error writing to ${promptrFilePath}:`, err);
      } else {
        console.log(`Updated ${promptrFilePath} with fileName: ${fileName}`);
        runPromptr();
      }
    });
  });
}

// Function to run the promptr command
function runPromptr() {
  exec("promptr -p promptr.txt", (err, stdout, stderr) => {
    if (err) {
      console.error("Error executing promptr:", err);
      return;
    }
    if (stderr) {
      console.error("Error output from promptr:", stderr);
    } else {
      console.log("Output from promptr:", stdout);
    }
  });
}

// Function to process the file list
let currentFileIndex = 0;
function processFileList() {
  if (currentFileIndex >= fileList.length) {
    currentFileIndex = 0;
  }

  const fileName = fileList[currentFileIndex];
  updatePromptrFile(fileName);

  currentFileIndex++;
}

// Initial run
processFileList();
