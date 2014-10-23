var mathjs = require('mathjs');
var Matrix = require('../libs/matrix');


exports.get = function(req, res) {
    res.render('simplexMethod');
};

exports.post = function(req, res) {

	//input data (already with slack variables and with proper signs)

	var vector1 =    [ 1, 1, 1, 1, 1, 0, 0, 0, 0, 40 ];
	var vector2 =    [ 2, 1, -1, -1, 0, -1, 0, 1, 0, 10 ];
	var vector3 =    [ 0, -1, 0, 1, 0, 0, -1, 0, 1, 10 ];
	var vector4 =    [ -0.5, -3, -1, -4, 0, 0, 0, 0, 0, 0 ];				//if f(x) -> min, inverse signs
	var lastVector = [ -2, 0, 1, 0, 0, 1, 1, 0, 0, 20 ];					//G


	var matrix = Matrix.createMatrixFromVectors([ vector1, vector2, vector3, vector4, lastVector ], true);
	console.log('Input: ');
	console.log(matrix);

	var hasSolution = true;
	var output = '';
	var count = 1;
	var EPSILON = 0.00000000001;


	while(true) {

		//rounding
		roundMatrix(matrix, EPSILON);			//small numbers to 0

		var obj = getMinNegativeAndBasisColNumber(matrix.getRow(matrix.rowsNumber));
		if (obj.minNegative >= 0 || count > 1000) {						//add epsilon
			output += outputMatrix(matrix);

			if (matrix.getValue(matrix.rowsNumber, matrix.colsNumber) == 0) {
				hasSolution = true;
			}

			break;
		}

		var basisColNumber = obj.basisColNumber;
		var basisRowNumber = getBasisRowNumber(matrix, obj.basisColNumber);

		var basis = getBasis(matrix);
		var outBasisColNumber = getOutBasisColNumber(matrix.getRow(basisRowNumber), basis);
		
		var x = matrix.getValue(basisRowNumber, basisColNumber);
		var inverseX = 1 / x;

		for (var i = 1; i <= matrix.colsNumber; i++) {
			matrix.insertValue( basisRowNumber, i, matrix.getValue(basisRowNumber, i) * inverseX );
		}


		for (var i = 1; i <= matrix.rowsNumber; i++) {
			var basisColValue = matrix.getValue(i, basisColNumber);

			for (var j = 1; j <= matrix.colsNumber; j++) {
				if (i == basisRowNumber) {
					continue;
				}

				if (basisColValue == 0) {						//add epsilon
					continue;
				}
				else if (basisColValue > 0) {
					matrix.insertValue( i, j, matrix.getValue(i, j) - matrix.getValue(basisRowNumber, j) * Math.abs(basisColValue) );
				}
				else {					//< 0
					matrix.insertValue( i, j, matrix.getValue(i, j) + matrix.getValue(basisRowNumber, j) * Math.abs(basisColValue) );
				}
			}
		}

		matrix = matrix.removeCol(outBasisColNumber);
		count++;

	}		//end while


























	if (hasSolution) {

		matrix = matrix.removeRow(matrix.rowsNumber);

		var count = 1;

		var EPSILON = 0.00000000001;

		

		while(true) {

			//rounding
			roundMatrix(matrix, EPSILON);			//small numbers to 0

			var obj = getMinNegativeAndBasisColNumber(matrix.getRow(matrix.rowsNumber));
			if (obj.minNegative >= 0 || count > 1000) {						//add epsilon
				//stop
				output += 'STOP';
				output += outputMatrix(matrix);
				output += 'Optimum: P = ' + matrix.getValue(matrix.rowsNumber, matrix.colsNumber);
				//console.log('result: ');
				//console.log(matrix);

				if (matrix.getValue(matrix.rowsNumber, matrix.colsNumber) == 0) {
					//hasSolution = true;
				}

				break;
			}

			var basisColNumber = obj.basisColNumber;
			var basisRowNumber = getBasisRowNumber(matrix, obj.basisColNumber);
			console.log( 'basisColNumber: ' + basisColNumber);
			console.log( 'basisRowNumber: ' + basisRowNumber);

			var x = matrix.getValue(basisRowNumber, basisColNumber);

			console.log('x = ' + x);

			var inverseX = 1 / x;

			for (var i = 1; i <= matrix.colsNumber; i++) {
				matrix.insertValue( basisRowNumber, i, matrix.getValue(basisRowNumber, i) * inverseX );
			}


			for (var i = 1; i <= matrix.rowsNumber; i++) {
				var basisColValue = matrix.getValue(i, basisColNumber);

				for (var j = 1; j <= matrix.colsNumber; j++) {
					if (i == basisRowNumber) {
						continue;
					}

					if (basisColValue == 0) {						//add epsilon
						continue;
					}
					else if (basisColValue > 0) {
						matrix.insertValue( i, j, matrix.getValue(i, j) - matrix.getValue(basisRowNumber, j) * Math.abs(basisColValue) );
					}
					else {					//< 0
						matrix.insertValue( i, j, matrix.getValue(i, j) + matrix.getValue(basisRowNumber, j) * Math.abs(basisColValue) );
					}
				}
			}

			count++;

		}		//end while


	}
	else {
		console.log('NO SOLUTION');
	}



	res.render('simplexMethodCalculate', {output: output});
};




















function getBasis(matrix) {
	var basisArray = [];
	var isBasis = false;
	var isOneAlreadyBeen = false;

	for (var j = 1; j <= matrix.colsNumber; j++) {
		for (var i = 1; i <= matrix.rowsNumber; i++) {

			if (matrix.getValue(i, j) != 0) {
				if (matrix.getValue(i, j) != 1) {
					isBasis = false;
					break;
				}
				else {
					if (!isOneAlreadyBeen) {
						isOneAlreadyBeen = true;
						isBasis = true;
					}
					else {
						isBasis = false;
						break;
					}
				}
			}

		}

		if (isBasis) {
			basisArray.push(j);
			isBasis = false;
		}

		isOneAlreadyBeen = false;
	}

	return basisArray;
}



function getOutBasisColNumber(vector, basis) {
	var outBasisColNumber;
	for (var i = 1; i <= vector.colsNumber - 1; i++) {
		if ( vector.getValue(1, i) == 1 ) {
			outBasisColNumber = i;
		}
	}
	
	return outBasisColNumber;
}



function checkForNegativeInLastCol(vector) {
	for (var i = 1; i <= vector.rowsNumber; i++) {
		if (vector.getValue(i, 1) < 0) {
			return true;
		}
	}

	return false;
}


function getBasisRowColNumber(matrix) {
	var min = matrix.getValue(1, matrix.colsNumber);
	
	var basisRowNumber = 1;

	for (var i = 2; i < matrix.rowsNumber; i++) {
		if (matrix.getValue(i, matrix.colsNumber) < min) {
			min = matrix.getValue(i, matrix.colsNumber);
			basisRowNumber = i;
		}
	}
	
	var row = matrix.getRow(basisRowNumber);
	min = row.elements[0][0];
	
	var basisColNumber = 1;

	for (var i = 1; i < row.elements[0].length; i++) {
		if (row.elements[0][i] < min) {
			min = row.elements[0][i];
			basisColNumber = i + 1;
		}
	}

	return { 'basisRowNumber': basisRowNumber, 'basisColNumber': basisColNumber };
}


function getMinNegativeAndBasisColNumber(vector) {
	var min = vector.elements[0][0];
	var basisColNumber = 1;

	for (var i = 1; i < vector.elements[0].length - 1; i++) {
		if (vector.elements[0][i] < min) {
			min = vector.elements[0][i];
			basisColNumber = i + 1;
		}
	}

	return { 'minNegative': min, 'basisColNumber': basisColNumber };
}


function getBasisRowNumber(matrix, basisColNumber) {
	var basisCol = matrix.getCol(basisColNumber);
	var lastCol = matrix.getCol(matrix.colsNumber);

	var basisRowNumber = 1;
	var value = lastCol.getValue(1, 1) / basisCol.getValue(1, 1);
	if (value < 0) {
		value = 10000;												//near BUG!!!!!!!!!!!
	}
	for (var i = 2; i < matrix.rowsNumber; i++) {
		var quotient = lastCol.getValue(i, 1) / basisCol.getValue(i, 1);
		if (quotient <= 0) {
			continue;
		}
		if (quotient < value) {
			value = quotient;
			basisRowNumber = i;
		}
	}

	return basisRowNumber;
}



function outputMatrix(matrix) {
	var output = '<table class="table-bordered table-condensed"><tbody>';

	for (var i = 0; i < matrix.rowsNumber; i++) {
		output += '<tr>';
		for (var j = 0; j < matrix.colsNumber; j++) {
			output += '<td>' + floatToRat(matrix.elements[i][j]) + '</td>';
		}
		output += '</tr>';
	}

	output += '</tbody></table>';
	return output;
}



function isFloat(n) {
   return n % 1 != 0;
};




function floatToRat(x) {
	if (!isFloat(x)) {
		return "" + x;
	}
    var tolerance = 1.0E-6;
    var h1 = 1; 
    var h2 = 0;
    var k1 = 0; 
    var k2 = 1;
    var posX = Math.abs(x);
    var b = posX;
    do {
        var a = Math.floor(b);
        var aux = h1; 
        h1 = a * h1 + h2; 
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2; 
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(posX - h1 / k1) > posX * tolerance);
    
    if (x < 0) {
    	return "-" + h1 + "/" + k1;
    }

    return h1 + "/" + k1;
};



function roundMatrix(matrix, epsilon) {
	for (var i = 1; i <= matrix.rowsNumber; i++) {
		for (var j = 1; j <= matrix.colsNumber; j++) {
			if (Math.abs(matrix.getValue(i, j)) <= epsilon) {
				matrix.insertValue(i, j, 0);
			}
		}
	}
}