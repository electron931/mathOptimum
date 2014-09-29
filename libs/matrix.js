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
	return new Matrix(1, this.colsNumber, this.elements[i - 1]);
}

method.getCol = function(j) {
	var array = [];
	for (var i = 0; i < this.rowsNumber; i++) {
		array.push(this.elements[i][j - 1]);
	}
	return new Matrix(this.rowsNumber, 1, array);
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

module.exports = Matrix;