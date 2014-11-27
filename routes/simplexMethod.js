var mathjs = require('mathjs');
var Matrix = require('../libs/matrix');
var helper = require('../libs/helper');


var EPSILON = 0.00000000001;
var MAX_NUMBER_OF_ITERATIONS = 100000000;

exports.get = function(req, res) {
    res.render('simplexMethod');
};

exports.post = function(req, res) {

	var m = +req.body.m;
	var n = +req.body.n;

	if (m > n) {
		res.end('m must be less or equal n');
		return;
	}

	var elements = [];

	for (var element in req.body) {
		elements.push( req.body[element] );
	}

	var offset = 0;

	var arrayA = [];
	for (var i = 0; i < m; i++) {
		arrayA[i] = [];
		for (var j = 0; j < n; j++) {
			arrayA[i].push( mathjs.eval(elements[n * i + j ]) );
			offset++;
		}
	}


	var arrayB = [];
	for (var i = 0; i < m; i++) {
		arrayB[i] = [];
		arrayB[i].push( mathjs.eval(elements[ offset ]) );
		offset++;
	}

	var arrayC = [];
	for (var i = 0; i < n; i++) {
		arrayC.push( mathjs.eval(elements[ offset ]) );
		offset++;
	}

	var x = [];
	for (var i = 0; i < n; i++) {
		x.push( mathjs.eval(elements[ offset ]) );
		offset++;
	}


	var b = new Matrix(m, 1, arrayB);
	var A = new Matrix(m, n, arrayA);
	var c = new Matrix(1, n, [arrayC]);

	var output = '';

	output += '<h2>Input:</h2>';
	output += '<div class="alpha"><span class="imp">A = </span>';
	output += helper.outputMatrix(A);
	output += '</div>';

	output += '<div class="alpha"><span class="imp">b = </span>';
	output += helper.outputMatrix(b);
	output += '</div>';

	output += '<div class="alpha"><span class="imp">c = </span>';
	output += helper.outputMatrix(c);
	output += '</div>';
	output += '<span class="basis">X (Initial Basis Plan): ' + roundArray(x)  + '</span>';
	output += '<hr>';

	output += '<h2>Begin!</h2>';
	output += '<hr>';

	//second phase
	var Ai = getMatrixColumns(A);
	var Js = getJs(x, b);
	var Jb = Js.Jb;
	var Jn = Js.Jn;
	var J = Js.J;
	var Ab = getBasisMatrix(A, Jb);
	var B = Ab.inverse();


	var count = 0;

	while (true && count < MAX_NUMBER_OF_ITERATIONS) {
		count++;
		output += '<span class="basis">Jb: ' + Jb  + '</span>';
		output += '<span class="basis">X: ' + roundArray(x)  + '</span>';

		if (!B) {				//!!
			Ab = Ab.getIdentityMatrix(Ab.rowsNumber);
			B = Ab;
		}

		output += '<div class="alpha"><span class="imp">Ab = </span>';
		output += helper.outputMatrix(Ab);
		output += '</div>';

		output += '<div class="alpha"><span class="imp">B = </span>';
		output += helper.outputMatrix(B);
		output += '</div>';

		var cb = getCb(c, Jb);
		console.log(Jb);
		var u = cb.multiply(B);
		output += '<div class="alpha"><span class="imp">u = </span>';
		output += helper.outputMatrix(u);
		output += '</div>';
		var deltas = getDeltas(u, A, c, Jn);
		output += '<span class="basis">Deltas: ' + roundArray(deltas)  + '</span>';
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
			output += '<h4>STOP</h4>'
			output += '<p class="result">Optimum has been found!</p>';
			output += '<p class="result">X = ' + roundArray(x) + '</p>';

			var xColumn = Matrix.createMatrixFromVectors([x], false);
			var optimum = c.multiply(xColumn).getValue(1, 1);
			output += '<p class="result">Optimum = ' + optimum + '</p>';

			break;
		}

		//step 3
		var z  = B.multiply(A.getCol(j0));
		output += '<div class="alpha"><span class="imp">z = </span>';
		output += helper.outputMatrix(z);
		output += '</div>';
		var hasSolution = false;
		for (var i = 1; i <= z.rowsNumber; i++) {
			if (z.getValue(i, 1) > 0) {
				hasSolution = true;
				break;
			}
		}


		if (!hasSolution) {		//STOP
			console.log('No solution');
			output += '<h4>STOP</h4>'
			output += '<p class="result">No solution</p>';
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
			x[Jb[i] - 1] = x[Jb[i] - 1] - Q * z.getValue(i + 1, 1);
		}

		var JsIndex = Jb.indexOf(Js);
		Jb[JsIndex] = j0;

		//Jb.sort(compareNumbers);

		Jn = getNewJn(J, Jb);

		//step 6
		Ab = getBasisMatrix(A, Jb);
		B = Ab.inverse();

		Q = undefined;
		s = undefined;
		j0 - undefined;

		output += '<hr>'
		output += '<p class="next">next iteration</p>'
		output += '<hr>'
	}		//end while


	res.render('simplexMethodCalculate', {output: output});
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


function getJs(x, b) {
	var bIndex = 1;
	var Jb = [];
	var Jn = [];
	var J = [];

	for (var i = 0; i < x.length; i++) {
		//if (x[i] == b.getValue(bIndex, 1)) {
		if (x[i] != 0) {
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
	var array = [];

	for (var i = 0; i < Jb.length; i++) {
		array[i] = [];
		for (var j = 1; j <= A.rowsNumber; j++) {
			array[i].push(A.getValue(j, Jb[i]));
		}
	}

	return Matrix.createMatrixFromVectors(array, false);
}

function getCb(c, Jb) {
	var array = [];

	for (var i = 0; i < Jb.length; i++) {
		array.push(c.getValue(1, Jb[i]));
	}

	return new Matrix(1, Jb.length, [array]);
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
		if (!contains(Jb, J[i])) {						//!!
			newJn.push(J[i]);
		}
		else {
			JbIndex++;
		}
	}

	return newJn;
}


function roundArray(array) {
	var roundedArr = [];
	for (var i = 0; i < array.length; i++) {
		roundedArr.push(Math.round(array[i] * 100) / 100);
	}

	return roundedArr;
}

function contains(a, obj) {
    for (var index = 0; index < a.length; index++) {
        if (a[index] === obj) {
            return true;
        }
    }
    return false;
};