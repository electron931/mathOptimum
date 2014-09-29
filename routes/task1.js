var Matrix = require('../libs/matrix');

exports.get = function(req, res) {
	var matrix1 = new Matrix(3, 3, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
	var matrix2 = new Matrix(3, 3, [[10, 11, 12], [11, 12, 13], [12, 13, 14]]);
	console.log(matrix1.multiply(matrix2).insertValue(2, 2, 451));
    res.render('task1');
};