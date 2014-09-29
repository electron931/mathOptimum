module.exports = function(app) {
    app.get('/', require('./frontpage').get);
    app.get('/task1', require('./task1').get);
};