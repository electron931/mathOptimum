var mathjs = require('mathjs');
var Matrix = require('../libs/matrix');


exports.get = function(req, res) {
    res.render('inverseMatrix');
};


exports.post = function(req, res) {
	var dimension = +req.body.dimension;
	var elements = [];

	for (var element in req.body) {
		elements.push( mathjs.eval(req.body[element]));
	}


	var array = [];
	for (var i = 0; i < dimension; i++) {
		array[i] = [];
		for (var j = 0; j < dimension; j++) {
			array[i].push( elements[dimension * i + j] );
		}
	}


	var matrix = new Matrix(dimension, dimension, array);
	

	var output = '';
	output += '<div class="alpha"><span class="imp">C = </span>';
	output += outputMatrix(matrix);
	output += '</div>';

	/*start*/
	output += '<h4>START</h4>'

	var EPSILON = 0.000000001;

	var identityMatrix = matrix.getIdentityMatrix(dimension);
	var inverseMatrix = matrix.getIdentityMatrix(dimension);
	var newMatrix = matrix.getIdentityMatrix(dimension);
	
	var hasSolution = false;
	
	var setJ = [];
	for (var i = 1; i <= dimension; i++) {
		setJ.push(i);
	}

	var setS = [];
	for (var i = 0; i < dimension; i++) {
		setS.push(0);
	}

	var k = 0;

	for (var i = 0; i < dimension; i++) {

		output += '<p><span class="imp">i = '+ i +',</span>';
		output += '<span class="imp">J = {' + setJ + '},</span></p>';
		output += '<div class="alpha"><span class="imp">C(' + i + '):</span>';
		output += outputMatrix(newMatrix);
		output += '<span class="imp" style="margin-left: 10px;">B(' + i + '):</span>';
		output += outputMatrix(inverseMatrix);
		output += '</div>';

		for (var j = 1; j <= dimension; j++) {
			if (!contains(setJ, j)) {
				continue;
			}
			output += '<div class="alpha">alpha = ' + outputMatrix(identityMatrix.getRow(i + 1)) + ' * ' + outputMatrix(inverseMatrix) + ' * ' + outputMatrix(matrix.getCol(j)) + ' = ';
			var alpha = identityMatrix.getRow(i + 1).multiply(inverseMatrix).multiply(matrix.getCol(j));
			output += alpha.getValue(1, 1) + '</div>';
			if ( Math.abs(alpha.getValue(1, 1) ) >= EPSILON ) {				//!= 0
				hasSolution = true;
				k = j;
				output += '<p>k = ' + k + '</p>';
				break;
			}

		}

		if (hasSolution) {
			hasSolution = false;

			var column = matrix.getCol(k);

			setJ[k - 1] = 0;												//J(i)\{k}
			setS[k - 1] = i + 1;

			newMatrix.setCol(i + 1, column.elements);
			output += '<div class="alpha">';
			output += '<span class="imp">C(' + (i + 1) + '):</span>';
			output += outputMatrix(newMatrix);


			//finding k-column in the matrix D
			var newColumn = inverseMatrix.multiply(column);
			var z_k = newColumn.elements[i][0];
			for (var index = 0; index < newColumn.rowsNumber; index++) {
				newColumn.elements[index][0] /= -z_k;
			}
			newColumn.elements[i][0] = 1 / z_k;

			var D = matrix.getIdentityMatrix(dimension).setCol(i + 1, newColumn.elements);

			output += '<span class="imp" style="margin-left: 10px;">B(' + (i + 1) + '):</span> ';
			output += outputMatrix(D) + ' * ' + outputMatrix(inverseMatrix);

			inverseMatrix = D.multiply(inverseMatrix);

			output += ' = ' + outputMatrix(inverseMatrix);
			output+= '</div>';
		}	
		else {
			console.log('Inverse matrix doesn\'t exist');
			inverseMatrix = false;
			break;
		}

		output+= '<hr>';

	}

	if (inverseMatrix) {
		var rows = [];
		for (var i = 0; i < dimension; i++) {
			rows.push(inverseMatrix.elements[i]);
		}

		output += '<span class="imp">S = {' + setS + '}</span>';

		var resultArray = [];
		for (var i = 0; i < dimension; i++) {
			resultArray.push(rows[setS[i] - 1]);
		}


		//rounding
		/*for (var i = 0; i < dimension; i++) {
			for (var j = 0; j < dimension; j++) {
				if (isFloat(resultArray[i][j])) {
					resultArray[i][j] = floatToRat(resultArray[i][j]);
				}
			}
		}*/

		inverseMatrix = new Matrix(dimension, dimension, resultArray);

	}

	output += '<h4>STOP</h4>'
	/*stop*/

	if (inverseMatrix) {
		output += '<h3>Result:</h3>';
		output += outputMatrix(inverseMatrix);
	}
	else {
		output += '<h3>Inverse matrix doesn\'t exist</h3>';
	}

	res.render('inverseMatrixCalculate', {output: output});
};







function isFloat(n) {
   return n % 1 != 0;
};



function contains(a, obj) {
    for (var index = 0; index < a.length; index++) {
        if (a[index] === obj) {
            return true;
        }
    }
    return false;
};



function floatToRat(x) {
	if (x == 0) {
		return "0";
	}
	else if (x == 1) {
		return "1";
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