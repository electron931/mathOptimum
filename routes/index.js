module.exports = function(app) {
    app.get('/', require('./frontpage').get);
    app.get('/inverseMatrix', require('./inverseMatrix').get);

    app.post('/inverseMatrix/calculate', require('./inverseMatrix').post);
};