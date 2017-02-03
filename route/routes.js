"use strict";

const authority = require('./authority.js');

//路由模块
module.exports = app => {
    //设置session
	app.use((req, res, next) => {
		let _user = req.session.user;
		res.locals.user = _user;
		next();
	});

    //普通页面
    const page = require('../app/controller/page.js');
    app.get(['/', '/index'], page.index);
    app.get('/test1', page.test1);
    app.get('/test2', page.test2);

    //用户有关页面
    const user = require('../app/controller/user.js');
    app.get('/user/signUp', user.signUp);
    app.post('/user/signUpPost', user.signUpPost);
    app.get('/user/signIn', user.signIn);
    app.post('/user/signInPost', user.signInPost);
    app.get('/user/signOut', user.signOut);
    app.post('/user/findName', user.findName);

    //文章页面
    const article = require('../app/controller/article.js');
    app.get('/article/details/:id', article.details);
    app.get('/article/writeArticle', authority.signIn, article.writeArticle);

    app.post('/article/uploadImage', authority.uploadPic.array('pic', 5), article.uploadImage);
    app.post('/article/servertoGetPic', article.servertoGetPic);

    app.post('/article/newArticleClass', article.newArticleClass);
    app.post('/article/changeArticleClassName', article.changeArticleClassName);
    app.delete('/article/deleteArticleClassName', article.deleteArticleClassName);

    app.post('/article/getTheArticle', article.getTheArticle);
    app.post('/article/newArticle', article.newArticle);
    app.post('/article/saveArticle', article.saveArticle);
    app.delete('/article/deleteArticle', article.deleteArticle);
    app.post('/article/publishArticle', article.publishArticle);

    app.post('/article/comment', article.comment);
    app.post('/article/fabulous', article.fabulous);
};