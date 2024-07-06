import fs from "fs";
import { exec } from "child_process";

class FileSpooler {
  constructor(filesListPath, promptrFilePath) {
    this.filesListPath = filesListPath;
    this.promptrFilePath = promptrFilePath;
    this.fileList = [];

    try {
      this.fileList = JSON.parse(fs.readFileSync(this.filesListPath, "utf8"));
    } catch (error) {
      console.error(`Error reading ${this.filesListPath}:`, error);
      process.exit(1);
    }
  }

  updatePromptrFile(fileName, callback) {
    fs.readFile(this.promptrFilePath, "utf8", (err, data) => {
      if (err) {
        console.error(`Error reading ${this.promptrFilePath}:`, err);
        process.exit(1);
      }

      const newContent = data.replace(
        /Please write docstrings for the following file\(s\): .*/,
        `Please write docstrings for the following file(s): ${fileName}`,
      );

      fs.writeFile(this.promptrFilePath, newContent, "utf8", (err) => {
        if (err) {
          console.error(`Error writing to ${this.promptrFilePath}:`, err);
          process.exit(1);
        } else {
          console.log(
            `Updated ${this.promptrFilePath} with fileName: ${fileName}`,
          );
          callback();
        }
      });
    });
  }

  runPromptr(callback) {
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

  processFileList() {
    if (this.currentFileIndex < this.fileList.length) {
      const fileName = this.fileList[this.currentFileIndex];
      this.updatePromptrFile(fileName, () => {
        this.runPromptr(() => {
          this.currentFileIndex++;
          this.processFileList();
        });
      });
    } else {
      console.log("All files have been processed.");
    }
  }

  startProcessing() {
    this.currentFileIndex = 0;
    this.processFileList();
  }
}

export default FileSpooler;

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const filesListPath = "./listeOfFilesToGenerateDocstringsFor.json";
  const promptrFilePath = "./promptr.txt";
  const fileService = new FileSpooler(filesListPath, promptrFilePath);
  fileService.startProcessing();
}
