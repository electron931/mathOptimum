var method = Matrix.prototype;

function Matrix(rowsNumber, colsNumber, elements) {
	this.rowsNumber = rowsNumber;
	this.colsNumber = colsNumber;
	this.elements = elements;
}

method.getValue = function(i, j) {
	return this.elements[i - 1][j - 1];
}

method.insertValue = function(i, j, value) {
	this.elements[i - 1][j - 1] = value;
	return this;
}

method.getRow = function(i) {
	var array = [ this.elements[i - 1] ];
	return new Matrix(1, this.colsNumber, array);
}

method.getCol = function(j) {
	var array = [];
	for (var i = 0; i < this.rowsNumber; i++) {
		array[i] = [];
		array[i].push(this.elements[i][j - 1]);
	}
	return new Matrix(this.rowsNumber, 1, array);
}

method.setRow = function(i, newRow) {
	for (var j = 0; j < this.colsNumber; j++) {
		this.elements[i - 1][j] = newRow[0][j];
	}
	return this;
}

method.setCol = function(j, newColumn) {
	for (var i = 0; i < this.rowsNumber; i++) {
		this.elements[i][j - 1] = newColumn[i][0];
	}
	return this;
}

method.getIdentityMatrix = function(dimension) {
	var array = [];
	for (var i = 0; i < dimension; i++) {
		array[i] = [];
		for (var j = 0; j < dimension; j++) {
			array[i].push(0);
		}
	}

	for (var i = 0; i < dimension; i++) {
		array[i][i] = 1;
	}

	return new Matrix(dimension, dimension, array);
}

method.multiply = function(matrix) {
	if (this.colsNumber != matrix.rowsNumber) {
		return false;
	}
	
	var array = [];
	for (var i = 0; i < this.rowsNumber; i++) {
		array[i] = [];
		for (var j = 0; j < matrix.colsNumber; j++) {
			array[i].push(0);
		}
	}

	for (var i = 0; i < this.rowsNumber; i++) {
		for (var j = 0; j < matrix.colsNumber; j++) {
			for (var k = 0; k < this.colsNumber; k++) {
				array[i][j] += this.elements[i][k] * matrix.elements[k][j];
			}
		}
	}

	return new Matrix(this.rowsNumber, matrix.colsNumber, array);
}

method.inverse = function() {

	var EPSILON = 0.000000001;

	var dimension = this.rowsNumber;

	var identityMatrix = this.getIdentityMatrix(dimension);
	var inverseMatrix = this.getIdentityMatrix(dimension);
	
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

		for (var j = 1; j <= dimension; j++) {
			if (!contains(setJ, j)) {
				continue;
			}
			var alpha = identityMatrix.getRow(i + 1).multiply(inverseMatrix).multiply(this.getCol(j));
			if ( Math.abs(alpha.getValue(1, 1) ) >= EPSILON ) {				//!= 0
				hasSolution = true;
				k = j;
				break;
			}

		}

		if (hasSolution) {
			hasSolution = false;

			var column = this.getCol(k);

			setJ[k - 1] = 0;												//J(i)\{k}
			setS[k - 1] = i + 1;

			//finding k-column in the matrix D
			var newColumn = inverseMatrix.multiply(column);
			var z_k = newColumn.elements[i][0];
			for (var index = 0; index < newColumn.rowsNumber; index++) {
				newColumn.elements[index][0] /= -z_k;
			}
			newColumn.elements[i][0] = 1 / z_k;

			var D = this.getIdentityMatrix(dimension).setCol(i + 1, newColumn.elements);

			inverseMatrix = D.multiply(inverseMatrix);
		}	
		else {
			console.log('Inverse matrix doesn\'t exist');
			return false;
		}

	}


	var rows = [];
	for (var i = 0; i < dimension; i++) {
		rows.push(inverseMatrix.elements[i]);
	}

	var resultArray = [];
	for (var i = 0; i < dimension; i++) {
		resultArray.push(rows[setS[i] - 1]);
	}


	//rounding
	for (var i = 0; i < dimension; i++) {
		for (var j = 0; j < dimension; j++) {
			if (isFloat(resultArray[i][j])) {
				resultArray[i][j] = floatToRat(resultArray[i][j]);
			}
		}
	}

	inverseMatrix = new Matrix(dimension, dimension, resultArray);
	
	return inverseMatrix;
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



module.exports = Matrix;