module.exports = function(app) {
    app.get('/', require('./frontpage').get);
    app.get('/inverseMatrix', require('./inverseMatrix').get);
    app.get('/simplexMethod', require('./simplexMethod').get);

    app.post('/inverseMatrix/calculate', require('./inverseMatrix').post);
    app.post('/simplexMethod/calculate', require('./simplexMethod').post);
};