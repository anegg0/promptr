
import { resolve } from 'path';

class FileLister {
  filterFilesAndDirectories(directory, exclude) {
    const filteredFiles = [];
    const files = readFileSync(directory, { withFileTypes: true })
      .filter((file) => file.isFile())
      .map((file) => file.name);

    for (const file of files) {
      if (!exclude.some((excluded) => file.includes(excluded))) {
        filteredFiles.push(resolve(directory, file));
      }
    }
    return filteredFiles;
  }

  processFiles(directory, exclude, outputFile) {
    const filteredFiles = this.filterFilesAndDirectories(directory, exclude);
    writeFileSync(outputFile, JSON.stringify(filteredFiles, null, 4));
    console.log(`Filtered files have been saved to ${outputFile}`);
  }
}

export default FileLister;
