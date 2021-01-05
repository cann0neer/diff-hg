# diff-hg
A module to compare differences between text files.

Based on Hirschberg's algorithm of finding longest common subsequence (LCS).
The main idea is an efficient memory usage.
Thus it is feasible to compare large files.

Test publish.

## Features
* large files comparison
* several files at once
   

## How To Install   
```bash
npm install diff-hg
```
   

## Getting Started
```js
const diff = require('diff-hg');
diff.compare('/path/to/file1', ['/path/to/file2', '/path/to/file3'], (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Succeeded!');
    }
});
```
