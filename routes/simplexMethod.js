var mathjs = require('mathjs');
var Matrix = require('../libs/matrix');
var helper = require('../libs/helper');


var EPSILON = 0.00000000001;

exports.get = function(req, res) {
    res.render('simplexMethod');
};

exports.post = function(req, res) {

	var m = 3;
	var n = 6;
	var b = new Matrix(m, 1, [[240], [200], [160]]);
	var A = new Matrix(m, n, [[2, 3, 6, 1, 0, 0], [4, 2, 4, 0, 1, 0], [4, 6, 8, 0, 0, 1]]);
	var c = new Matrix(1, n, [[4, 5, 4, 0, 0, 0]]);
	var Ai = getMatrixColumns(A);
	var x = getBasisPlan(Ai, b);
	var Js = getJs(x, b);
	var Jb = Js.Jb;
	var Jn = Js.Jn;
	var J = Js.J;
	var Ab = getBasisMatrix(A, Jb);
	var B = Ab.inverse();


	var count = 0;

	while (true && count < 100) {
		count++;
		var cb = getCb(c, Jb);
		var u = cb.multiply(B);
		var deltas = getDeltas(u, A, c, Jn);
		var stop = true;
		var minDelta;
		var j0;
		for (var i = 0; i < deltas.length; i++) {
			if (deltas[i] < 0 && minDelta == undefined) {
				stop = false;
				minDelta = deltas[i];
				j0 = Jn[i];
			}
			else if (deltas[i] < 0 && deltas[i] < minDelta) {
				minDelta = deltas[i];
				j0 = Jn[i];
			}
		}

		minDelta = undefined;

		if (stop) {		//STOP
			console.log('Optimum has been found: ' + x);
			break;
		}

		//step 3
		var z  = B.multiply(A.getCol(j0));
		var hasSolution = false;
		for (var i = 1; i <= z.rowsNumber; i++) {
			if (z.getValue(i, 1) > 0) {
				hasSolution = true;
			}
		}


		if (!hasSolution) {		//STOP
			console.log('No solution');
			break;
		}

		//step 4
		var Q;
		var s;
		for (var i = 1; i <= m; i++) {
			if (z.getValue(i, 1) > 0) {
				var temp = x[Jb[i - 1] - 1] / z.getValue(i, 1);
				if (Q == undefined) {
					Q = temp;
					s = i;
				}
				else if (temp < Q) {
					Q = temp;
					s = i;
				}
			}
		}


		var Js = Jb[s - 1];


		//step 5
		var JnIndex = 0;
		for (var i = 1; i <= n; i++) {
			if (i == Jn[JnIndex]) {
				x[i - 1] = 0;
				JnIndex++;
			}
		}
		x[j0 - 1] = Q;
		for (var i = 0; i < Jb.length; i++) {
			x[Jb[i] - 1] = x[Jb[i ] - 1] - Q * z.getValue(i + 1, 1);
		}

		var JsIndex = Jb.indexOf(Js);
		Jb[JsIndex] = j0;
		Jb.sort();

		Jn = getNewJn(J, Jb);

		//step 6
		Ab = getBasisMatrix(A, Jb);
		B = Ab.inverse();

		Q = undefined;
		s = undefined;
		j0 - undefined;
	}


	res.end('All right');
}







/*
	Functions
*/

function getMatrixColumns(matrix) {
	var matrixColumns = [];
	for (var i = 1; i <= matrix.colsNumber; i++) {
		matrixColumns.push(matrix.getCol(i));
	}

	return matrixColumns;
}

function getBasisPlan(matrixColumns, b) {
	var bIndex = 1;
	var x = [];
	for (var i = 0; i < matrixColumns.length; i++) {
		if (isColumnBasis(matrixColumns[i])) {
			x.push(b.getValue(bIndex, 1));
			bIndex++;
		}
		else {
			x.push(0);
		}
	}

	return x;
}

function isColumnBasis(column) {
	var isOneAlreadyBeen = false;
	var isBasis = true;

	for (var i = 1; i <= column.rowsNumber; i++) {
		if (column.getValue(i, 1) == 1 && isOneAlreadyBeen == false) {
			isOneAlreadyBeen = true;
			continue;
		}
		else if (column.getValue(i, 1) == 0) {
			continue;
		}
		else {
			isBasis = false;
			break;
		}
	}

	return isBasis;
}

function getJs(x, b) {
	var bIndex = 1;
	var Jb = [];
	var Jn = [];
	var J = [];

	for (var i = 0; i < x.length; i++) {
		if (x[i] == b.getValue(bIndex, 1)) {
			Jb.push(i + 1);
			bIndex++;
		}
		else {
			Jn.push(i + 1);
		}
		J.push(i + 1);
	}
	return {'Jb': Jb, 'Jn': Jn, 'J': J};
}

function getBasisMatrix(A, Jb) {
	var JbIndex = 0;
	var array = [];

	for (var i = 1; i <= A.colsNumber; i++) {
		if (i == Jb[JbIndex]) {
			array[JbIndex] = [];
			for (var j = 1; j <= A.rowsNumber; j++) {
				array[JbIndex].push(A.getValue(j, i));
			}
			JbIndex++;
		}
	}

	return Matrix.createMatrixFromVectors(array, false);
}

function getCb(c, Jb) {
	var JbIndex = 0;
	var array = [];

	for (var i = 1; i <= c.colsNumber; i++) {
		if (i == Jb[JbIndex]) {
			array.push(c.getValue(1, i));
			JbIndex++;
		}
	}

	return new Matrix(1, JbIndex, [array]);
}

function getDeltas(u, A, c, Jn) {
	var deltas = [];

	for (var i = 0; i < Jn.length; i++) {
		deltas.push( u.multiply(A.getCol(Jn[i])).getValue(1, 1) - c.getValue(1, Jn[i]) );
	}

	return deltas;
}

function getNewJn(J, Jb) {
	var JbIndex = 0;
	var newJn = [];

	for (var i = 0; i < J.length; i++) {
		if (J[i] != Jb[JbIndex]) {
			newJn.push(J[i]);
		}
		else {
			JbIndex++;
		}
	}

	return newJn;
}