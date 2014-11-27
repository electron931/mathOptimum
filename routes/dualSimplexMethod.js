var mathjs = require('mathjs');
var Matrix = require('../libs/matrix');
var helper = require('../libs/helper');


var EPSILON = 0.00000000001;
var MAX_NUMBER_OF_ITERATIONS = 20;

exports.get = function(req, res) {
    res.render('dualSimplexMethod');
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

	var y = [];
	for (var i = 0; i < m; i++) {
		y[i] = [];
		y[i].push( mathjs.eval(elements[ offset ]) );
		offset++;
	}

	var Jb = [];
	for (var i = 0; i < m; i++) {
		Jb.push( mathjs.eval(elements[ offset ]) );
		offset++;
	}


	var b = new Matrix(m, 1, arrayB);
	var A = new Matrix(m, n, arrayA);
	var c = new Matrix(1, n, [arrayC]);
	var yVector = new Matrix(m, 1, y);
	var Js = getJs(n, Jb);
	var J = Js.J;
	var Jn = Js.Jn;

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
	output += '<div class="alpha"><span class="imp">Y (Initial Dual Basis Plan) = </span>';
	output += helper.outputMatrix(yVector);
	output += '</div>';
	output += '<span class="basis">Jb (Basic Set) = {' + Jb  + '}</span>';
	output += '<hr>';

	


	output += '<h2>Begin!</h2>';
	output += '<hr>';

	var Ab = getBasisMatrix(A, Jb);
	var B = Ab.inverse();
	var E = Ab.getIdentityMatrix(Ab.rowsNumber);


	var count = 0;

	while (true && count < MAX_NUMBER_OF_ITERATIONS) {
		output += '<div class="alpha"><span class="imp">Y (Initial Dual Basis Plan) = </span>';
		output += helper.outputMatrix(yVector);
		output += '</div>';
		output += '<span class="basis">Jb = {' + Jb  + '}</span>';
		
		count++;


		output += '<div class="alpha"><span class="imp">Ab = </span>';
		output += helper.outputMatrix(Ab);
		output += '</div>';

		output += '<div class="alpha"><span class="imp">B = </span>';
		output += helper.outputMatrix(B);
		output += '</div>';


		var ksi = B.multiply(b);
		output += '<div class="alpha"><span class="imp">&chi; (Pseudo-Plan) = </span>';
		output += helper.outputMatrix(ksi);
		output += '</div>';

		var minKsi;
		var stop = true;
		var js;

		console.log(ksi);
		console.log(Jb);

		for (var i = 0; i < ksi.rowsNumber; i++) {
			if (ksi.rowsNumber >= Jb[i] && ksi.getValue(Jb[i], 1) < 0 && minKsi == undefined) {
				minKsi = ksi.getValue(Jb[i], 1);
				stop = false;
				js = Jb[i];
				break;
			}
			/*else if (ksi.getValue(Jb[i], 1) < 0 && ksi.getValue(Jb[i], 1) < minKsi) {
				minKsi = ksi.getValue(Jb[i], 1);
				js = Jb[i];
			}*/
		}
		

		//console.log('minKsi: ' + minKsi);



		minKsi = undefined;

		if (stop) {
			output += '<hr>';
			output += '<h4>STOP</h4>'
			output += '<div class="alpha result"><span class="imp">Y (Initial Dual Basis Plan) = </span>';
			output += helper.outputMatrix(yVector);
			output += '</div>';
			output += '<span class="basis result">Jb (Basic Set) =  ' + Jb  + '</span>';
			output += '<div class="alpha result"><span class="imp">&chi; (Pseudo-Plan) = </span>';
			output += helper.outputMatrix(ksi);
			output += '</div>';

			break;
		}


		//step 3
		var deltaY = E.getRow(js).multiply(B);
		output += '<div class="alpha"><span class="imp">&Delta;Y = </span>';
		output += helper.outputMatrix(deltaY);
		output += '</div>';

		var mu = getMu(deltaY, A, Jn);
		output += '<span class="basis">&mu; =  ' + mu  + '</span>';

		var hasSolution = false;
		for (var i = 0; i < mu.length; i++) {
			if (mu[i] < 0) {
				hasSolution = true;
				break;
			}
		}


		if (!hasSolution) {		//STOP
			output += '<hr>';
			output += '<h4>STOP</h4>'
			output += '<p class="result">No solution</p>';
			break;
		}

		//step 4
		var sigma;
		var s;
		for (var j = 0; j < Jn.length; j++) {
			if (mu[j] < 0) {
				var temp = ( c.getValue(1, Jn[j]) - A.getCol(Jn[j])
					.transpose()
					.multiply(yVector)
					.getValue(1, 1) ) / mu[j];
				//console.log("temp: " + temp);
				if (sigma == undefined) {
					sigma = temp;
					s = i + 1;
				}
				else if (temp < sigma) {
					sigma = temp;
					s = i + 1;
				}
			}
		}

		//console.log(s);



		var j0 = Jn[s - 1];
		

		output += '<span class="basis">&sigma;<sub>0</sub> = ' + sigma  + '</span>';
		output += '<span class="basis">j<sub>0</sub> = ' + j0  + '</span>';

		//step 5
		yVector = yVector.add(deltaY.transpose().multiplyNumber(sigma));		//new dual basis plan


		var j0Index = Jb.indexOf(js);
		Jb[j0Index] = j0;

		//console.log(Jb);
		

		


		Jn = getNewJn(J, Jb);

		//step 6
		Ab = getBasisMatrix(A, Jb);
		B = Ab.inverse();


		sigma = undefined;
		s = undefined;
		j0 = undefined;
		js = undefined;

		output += '<hr>'
		output += '<p class="next">next iteration</p>'
		output += '<hr>'
	}		//end while

	


	res.render('dualSimplexMethodCalculate', {output: output});
}


/*
	Functions
*/

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

function getJs(n, Jb) {
	var J = [];
	var Jn = [];
	var bIndex = 0;

	for (var i = 0; i < n; i++) {
		J.push(i + 1);
		if (Jb[bIndex] == J[i]) {
			bIndex++;
		}
		else {
			Jn.push(i + 1);
		}

	}

	return { 'J': J, 'Jn': Jn };
}

function getMu(deltaY, A, Jn) {
	var mu = [];

	for (var i = 0; i < Jn.length; i++) {
		mu.push( deltaY.multiply(A.getCol(Jn[i])).getValue(1, 1) );
	}

	return mu;
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