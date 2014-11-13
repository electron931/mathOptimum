
module.exports.outputMatrix = function (matrix) {
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
};


function isFloat (n) {
   return n % 1 != 0;
};

function floatToRat (x) {
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