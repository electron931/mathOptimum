var mathjs = require('mathjs');
var Matrix = require('../libs/matrix');


exports.get = function(req, res) {
    res.render('simplexMethod');
};

exports.post = function(req, res) {

	//input data (already with slack variables and with proper signs)
	/*var vector1 =  [0, 0.6, 0, 0, 0.7, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 312];
	var vector2 =  [0, 0, 0.65, 0, 0, 0.65, 0.9, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 312];
	var vector3 =  [0, 0, 0, 0.37, 0, 0, 0, 0.47, 0, 0.9, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 312];
	var vector4 =  [0, 0, 0, 0, 0, 0, 0, 0, 0.42, 0, 0.8, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 312];

	var vector5 =  [0, 1.1, 0, 0, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 800];
	var vector6 =  [0, 0, 1.1, 0, 0, 1.5, 1.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 950];
	var vector7 =  [0, 0, 0, 1.1, 0, 0, 0, 1.8, 0, 2.1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1200];
	var vector8 =  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0.42, 0, 0.8, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 500];
	
	var vector9 =  [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1100];
	var vector10 = [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 300];
	var vector11 = [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 750];
	var vector12 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 200];

	var lastVector=[1, -25, -25, -25, -40, -40, -130, -130, -130, -300, -300, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, 0];*/

	var vector1 = [ 0, 2, 3, 6, 1, 0, 0, 240 ];
	var vector2 = [ 0, 4, 2, 4, 0, 1, 0, 200 ];
	var vector3 = [ 0, 4, 6, 8, 0, 0, 1, 160 ];
	var lastVector = [ 1, -4, -5, -4, 0, 0, 0, 0 ];


	var matrix = Matrix.createMatrixFromVectors([ vector1, vector2, vector3, lastVector ], true);
	console.log('Input: ');
	console.log(matrix);

	var output = '';
	
	var count = 1;
	while(true) {
		var obj = getMinNegativeAndBasisColNumber(matrix.getRow(matrix.rowsNumber));
		if (obj.minNegative >= 0 || count > 6) {						//add epsilon
			//stop
			output += 'STOP';
			output += outputMatrix(matrix);
			output += 'Optimum: P = ' + matrix.getValue(matrix.rowsNumber, matrix.colsNumber);
			break;
		}

		var basisColNumber = obj.basisColNumber;
		var basisRowNumber = getBasisRowNumber(matrix, obj.basisColNumber);
		
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

		outputMatrix(matrix);
		count++;

	}		//end while




	//res.end('Done');
	res.render('simplexMethodCalculate', {output: output});
};



function getMinNegativeAndBasisColNumber(vector) {
	var min = vector.elements[0][0];
	var basisColNumber = 1;

	for (var i = 1; i < vector.elements[0].length; i++) {
		if (vector.elements[0][i] < min) {
			min = vector.elements[0][i];
			console.log('min = ' + min);
			console.log('basisColNumber = ' + basisColNumber);
			basisColNumber = i + 1;
		}
	}

	return { 'minNegative': min, 'basisColNumber': basisColNumber };
}


function getBasisRowNumber(matrix, basisColNumber) {
	var basisCol = matrix.getCol(basisColNumber);
	var lastCol = matrix.getCol(matrix.colsNumber);

	var basisRowNumber = 1;
	var value = lastCol.getValue(1, 1) / basisCol.getValue(1, 1);						//BUG!!
	if (value < 0) {
		value = 0;
	}
	for (var i = 2; i < matrix.rowsNumber; i++) {
		var quotient = lastCol.getValue(i, 1) / basisCol.getValue(i, 1);
		if (quotient < 0) {
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