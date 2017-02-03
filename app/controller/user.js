"use strict";

const User = require('../model/user.js');
const Article = require('../model/article.js');
const UserArticleClass = require('../model/userArticleClass.js');

exports.signUp = (req, res) => {
	res.render('user/signUp');
};

exports.signUpPost = (req, res) => {
	new Promise((resolve, reject) => {
		//创建一个新用户
		let user = new User(req.body.user);
		user.save((err, user) => {
			if (err) {
				reject(err);
			} else {
				resolve(user);
			}
		});
	}).then((user) => {
		return new Promise((resolve, reject) => {
			//为用户创建一个文章分类  比如 日记本
			var userArticleClass = UserArticleClass({
				content : [{'className' : '日记本', 'article' : []}]
			});
			userArticleClass.save((err, userArticleClass) => {
				if (err) {
					reject(err)
				} else {
					resolve({user, userArticleClass, userArticleClassId : userArticleClass._id});
				}
			});
		});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			//将创建出来的用户文章分类绑定到用户信息上
			data.user.update(
				{
					$set: {
						article: data.userArticleClassId
					}
				},
				(err) => {
					if (err) {
						reject(err);
					} else {
						resolve({userId : data.user._id, userArticleClass : data.userArticleClass});
					}
				}
			);
		});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			//创建一片默认文章
			var article = new Article({
				author : data.userId
			});
			article.save((err, article) => {
				if (err) {
					reject(err);
				} else {
					resolve({userArticleClass : data.userArticleClass, articleId : article._id});
				}
			});
		});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			//把文章保存到用户文章分类
			data.userArticleClass.content[0].article.push(data.articleId);
			data.userArticleClass.save((err, data) => {
				if (err) {
					reject(err);
				} else {
					res.redirect('/user/signIn');
				}
			});
		});
	}).catch((err) => {
		console.log(err);
		res.send('出现错误');
	});
};

exports.signIn = (req, res) => {
	res.render('user/signIn');
};

exports.signInPost = (req, res) => {
	let user = req.body.user;
	new Promise((resolve, reject) => {
		//查找用户
		User
			.findOne({contact : user.contact})
			.exec((err, data) => {
				if (err) {
					reject(err);
				} else {
					if (data) {
						resolve(data);
					} else {
						reject(err);
					}
				}
			});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			//判断用户密码是否正确
			data.comparePassword(user.password, (err, isMatch) => {
				if (err) {reject(err)}
				if (isMatch) {
					var user = {};
					user.id = data._id;
					user.contact = data.contact;
					user.name = data.name;
					user.role = data.role;
					req.session.user = user;
					res.redirect('/');
				} else {
					reject('账号或密码错误！');
				}
			})
		});
	}).catch((err) => {
		console.log(err);
		res.send(err);
	});
};

exports.signOut = (req, res) => {
	delete req.session.user;
	res.redirect('/');
};

exports.findName = (req, res) => {
	User.findOne({name : req.body.name}, (err, data) => {
		if (err) {console.log(data);}
		if (data) {
			res.json({success : false});
		} else {
			res.json({success : true});
		}
	});
};
