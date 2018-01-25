'use strict';

/**
 * A module to compare differences between text files.
 *
 * Based on Hirschberg's algorithm of finding longest common subsequence (LCS).
 * The main idea is an efficient memory usage.
 * Thus it is feasible to compare large files.
 */

const fs    = require('fs');
const async = require('async');
const os    = require('os');

/**
 * Compares files
 * @param {string} fileOrig - original file
 * @param {string|array} filesCompare - file/files to compare with
 * @param {function} callback
 * @returns {*}
 */
module.exports.compare = (fileOrig, filesCompare, callback) => {
    filesCompare = Array.isArray(filesCompare) ? filesCompare : [filesCompare];

    if (!filesCompare.length) {
        return callback('No file to compare!');
    }

	/**
     * Converts buffer data to array with EOL delimeter
	 * @param dataBuffer
	 * @returns {string[]}
	 */
	function prepareData(dataBuffer) {
        return dataBuffer.toString().split(os.EOL);
    }

    // reading original (first) file

    fs.readFile(fileOrig, {encoding: 'utf8'}, (err, dataOrig) => {
        if (err) {
            return callback(err);
        }

        dataOrig = prepareData(dataOrig);

        let dataArrCompare = [];

        // reading all files to compare with

        async.eachSeries(filesCompare, (file, cb) => {
            fs.readFile(file, {encoding: 'utf8'}, (err, data) => {
                if (err) {
                    return cb(err);
                }

                dataArrCompare.push(prepareData(data));
                cb();
            });
        }, (err) => {
            if (err) {
                return callback(err);
            }

            dataArrCompare.forEach((dataCompare, i) => {
                console.log('DIFF');
                console.log(`File 1: '${fileOrig}'. File 2: '${filesCompare[i]}'`);
                compareArrs(dataOrig, dataCompare);
                console.log();
            });

            callback();
        });

    });
};

/**
 * Compares two array, consoles results
 * @param x
 * @param y
 * @private
 */
function compareArrs(x, y) {
    let lcf = findLcsHirschberg(x, y);

    let i = 0;
    let j = 0;
    let k = 0;
    let n = x.length + y.length - lcf.length;

    for (let line = 1; line < n; line++) {

        if (k >= lcf.length) {
            if (i < x.length && j < y.length) {
				console.log(`${line} * ${x[i]} | ${y[j]}`);
				i++;
				j++;
            } else if (i < x.length) {
                console.log(`${line} - ${x[i]}`);
                i++;
            } else if (j < y.length) {
                console.log(`${line} + ${y[j]}`);
                j++;
            }
        } else if (x[i] === lcf[k] && y[j] === lcf[k]) {
            console.log(`${line}   ${lcf[k]}`);
            i++;
            j++;
            k++;
        } else if (x[i] !== lcf[k] && y[j] !== lcf[k]) {
            console.log(`${line} * ${x[i]} | ${y[j]}`);
            i++;
            j++;
        } else if (x[i] !== lcf[k] && y[j] === lcf[k]) {
            console.log(`${line} - ${x[i]}`);
            i++;
        } else if (x[i] === lcf[k] && y[j] !== lcf[k]) {
            console.log(`${line} + ${y[j]}`);
            j++;
        }
    }
}

/**
 * Finds LCS (longest common subsequence) by Hirschberg's algorithm
 * @param x
 * @param y
 * @returns {*}
 * @private
 */
function findLcsHirschberg(x, y) {
    if (x.length === 0) { // partial case
        return [];
    } else if (x.length === 1) { // partial case
        if (y.indexOf(x[0]) !== -1) {
            return [x[0]];
        } else {
            return [];
        }
    } else { // general case

        // split to 2 sequences

        let i = Math.floor(x.length / 2);
        let xb = x.slice(0, i);
        let xe = x.slice(i);

        // matrix calculation
        // (actually, only a row for every sequence, full matrix is not needed)

        let L1 = calcLcsLength(xb, y);
        let L2 = calcLcsLength(xe.slice().reverse(), y.slice().reverse()).reverse();

        let j = 0;
        let maxSum = 0;

        for (let k = 0; k < L1.length; k++) {
            let sum = L1[k] + L2[k];

            if (sum > maxSum) {
                maxSum = sum;
                j = k;
            }
        }

        let yb = y.slice(0, j);
        let ye = y.slice(j);

        return findLcsHirschberg(xb, yb).concat(findLcsHirschberg(xe, ye));
    }
}

/**
 * Calculates LCS length (last row of dynamic matrix)
 * @param x
 * @param y
 * @returns {array}
 * @private
 */
function calcLcsLength(x, y) {
	let curr = new Array(y.length + 1).fill(0);
	let prev;

	x.forEach((xEl) => {
		prev = curr.slice();

		y.forEach((yEl, yI) => {

			if (xEl === yEl) {
				curr[yI + 1] = prev[yI] + 1;
			} else {
				curr[yI + 1] = Math.max(curr[yI], prev[yI + 1]);
			}
		});
	});

	return curr;
}