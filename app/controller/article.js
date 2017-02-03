"use strict";

const http = require('http');
const fs = require('fs');
const config = require('../../config.js');
let User = require('../model/user.js');
let UserArticleClass = require('../model/userArticleClass.js');
let Article = require('../model/article.js');

//文章详情页
exports.details = details;

//获取撰写文章页面
exports.writeArticle = writeArticle;

//上传图片
exports.uploadImage = uploadImage;

//服务器获取图片
exports.servertoGetPic = servertoGetPic;

//创建文章分类
exports.newArticleClass = newArticleClass;

//改变文章分类
exports.changeArticleClassName = changeArticleClassName;

//删除一个文章分类
exports.deleteArticleClassName = deleteArticleClassName;

//获取一篇文章
exports.getTheArticle = getTheArticle;

//新建一片文章
exports.newArticle = newArticle;

//保存一篇文章
exports.saveArticle = saveArticle;

//删除文章
exports.deleteArticle = deleteArticle;

//发布文章
exports.publishArticle = publishArticle;

//发表评论
exports.comment = comment;

//喜欢
exports.fabulous = fabulous;


//默认文章页
function details (req, res, next) {
	Article
		.findOne({_id : req.params.id})
		.populate('author', 'name')
		.populate('comment.own', 'name')
		.populate('comment.childComment.own', 'name')
		.populate('comment.childComment.to', 'name')
		.exec((err, data) => {
			if (err) {
				console.log(err);
				//next 返回404
				next();
			} else {
				data.update({$inc: {read:1}}, (err) => { console.log(err) });
				let commentPraise = () => {};
				let articlePraise = () => {};
				try {
					var id = req.session.user.id;
					commentPraise = () => {
						return new Promise((resolve, reject) => {
							setTimeout(() => {
								data.comment.forEach((curr) => {
									curr.fabulousPeople.forEach((fabulousPeople) => {
										if (fabulousPeople._id.toString() === id) {
											curr.fabulousOnOff = true;
										}
									});
								});
								resolve()
							}, 0);
						});
					};
					articlePraise = () => {
						return new Promise((resolve, reject) => {
							setTimeout(() => {
								data.fabulousPeople.forEach((curr) => {
									if (curr._id.toString() === id) {
										data.fabulousOnOff = true;
									}
								});
								resolve()
							}, 0);
						});
					};
				} catch (e) {}

				Promise
					.all([commentPraise(), articlePraise()])
					.catch((err) => {
						console(err);
					})
					.then(() => {
						let article = {
							id : data._id,
							author : {
								id : data.author._id,
								name : data.author.name,
							},
							title : data.title,
							content : data.content,
							time : data.time.createTime.toLocaleString(),
							fabulous : data.fabulous,
							read : data.read,
							comment : data.comment,
							commentLength : data.commentLength,
							fabulousOnOff : data.fabulousOnOff,
						};
						res.render('article/details', {
							article : article,
						});
					})
					.catch((err) => {
						console.log(err)
					});
			}
		});
}

function writeArticle (req, res) {
	new Promise((resolve, reject) => {
		//获取用户文章分类id
		User
			.findOne({_id : req.session.user.id}, {article : 1})
			.populate('article', 'content')
			.exec((err, data) => {
				resolve(data);
			});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			let arr = data.article.content[0].article;
			Article
				.find({_id : {$in : arr}}, {title : 1, publish : 1, content : 1})
				.exec((err, article) => {
					if (err) {
						reject(err);
					} else {
						let articleOverview = [];
						article.forEach((curr) => {
							articleOverview.push({
								id : curr._id,
								title : curr.title,
							});
						});
						let defaultArticle = {
							id : article[0]._id,
							publish : article[0].publish,
							title : article[0].title,
							content : article[0].content
						};
						res.render('article/writeArticle', {
							articleClassId : data.article._id,
							class : data.article.content,
							defaultClassId : data.article.content[0]._id,
							article : articleOverview,
							defaultArticle : defaultArticle,
						});
					}
				});
		});
	}).catch((err) => {
		console.log(err);
		res.json('页面出现错误!');
	});
}

function uploadImage (req, res) {
	if (req.files.length) {
		let arr = [];
		req.files.forEach(function(curr){
			arr.push(curr.path);
		});
		let data = {
			success : true,
			picSrc : arr,
		};
		res.json(data);
	} else {
		res.json({success : false});
	}
}

function servertoGetPic (req, res) {
	try {
		http.get(req.body.src, (response) => {
		const type = response.headers['content-type'];
		let data = Buffer.alloc(0);
		let fileType = type.match(/^image\/(png|jqeg|gif)$/);
		if (/^image\/(png|jqeg|gif)$/g.test(type) && response.headers['content-length'] <= 1024 * 1024) {
			response.on('data', (chunk) => {
				data = Buffer.concat([data, chunk]);
			});
			response.on('end', () => {
				let path = '/uploads/' + Date.now() + Math.random() + '.' + fileType[1];
				fs.writeFile(
					config.public + path,
					data,
					(err) => {
						if (err) {
							console.log(err);
							res.json({
								success : false,
								information : '获取失败！'
							})
						} else {
							res.json({
								success : true,
								information : path
							})
						}
					}
				)
			});
		} else {
			res.json({
				success : false,
				information : '目标图片过大或者不是图片！'
			})
		}
	});
	} catch (err) {
		res.json({
			success : false,
			information : '目标不存在！'
		})
	}
}

function newArticleClass (req, res) {
	new Promise((resolve, reject) => {
		User
			.findOne({_id : req.session.user.id})
			.exec((err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data.article);
				}
			});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			UserArticleClass
				.findOne({_id : data})
				.exec((err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
		});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			data.content.push({
				'className' : req.body.notebookName,
				'article' : []
			});
			data.save((err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			let obj = data.content[data.content.length - 1];
			res.json({
				success : true,
				id : obj._id,
				className : obj.className
			});
		});
	}).catch((err) => {
		console.log(err);
		res.json({success : false});
	});
}

function changeArticleClassName (req, res) {
	const body = req.body;
	new Promise((resolve, reject) => {
		//查询数据库
		UserArticleClass
			.findOne({_id : body.classId})
			.exec((err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			//更改信息
			for (let i=0;i<data.content.length;i++) {
				if (data.content[i]._id.toString() == body.articleId) {
					data.content[i].className = body.value;
				}
			}
			data.save((err, data) => {
				if (err) {
					reject(err);
				} else {
					res.json({success : true, value : body.value});
				}
			});
		});
	}).catch((err) => {
		console.log(err);
		res.json({success : false});
	});
}

function deleteArticleClassName (req, res) {
	const body = req.body;
	new Promise((resolve, reject) => {
		//查询数据库
		UserArticleClass
			.findOne({_id : body.classId})
			.exec((err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			//更改信息
			for (let i=0;i<data.content.length;i++) {
				if (data.content[i]._id.toString() == body.articleId) {
					data.content.splice(i, 1);
				}
			}
			data.save((err, data) => {
				if (err) {
					reject(err);
				} else {
					res.json({success : true});
				}
			});
		});
	}).catch((err) => {
		console.log(err);
		res.json({success : false});
	});
}

function getTheArticle (req, res) {
	const body = req.body;
	Article
		.findOne({_id : body.articleId})
		.exec((err, data) => {
			if (err) {
				console.log(err);
				res.json({success : false});
			} else {
				res.json({
					success : true,
					article : {
						title : data.title,
						content : data.content,
						publish : data.publish
					}
				});
			}
		});
}

function newArticle (req, res) {
	const body =  req.body;
	new Promise((resolve, reject) => {
		//新建一篇文章
		let article = new Article({author : req.session.user.id});
		article.save((err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	}).then((article) => {
		return new Promise((resolve, reject) => {
			//找出用户文章分类  吧新建出来的文章放进去
			UserArticleClass
				.findOne({_id : body.id})
				.exec((err, data) => {
					if (err) {
						reject(err);
					} else {
						data.content.forEach((curr) => {
							if (curr._id.toString() === body.classId) {
								curr.article.push(article._id);
							}
						});
						data.save((err, data) => {
							if (err) {
								resolve(err);
							} else {
								res.json({
									success : true,
									article
								});
							}
						});
					}
				});
		});
	}).catch((err) => {
		console.log(err);
		res.json({success : false});
	});
}

function saveArticle (req, res) {
	const body = req.body;
	new Promise((resolve, reject) => {
		Article
			.findOne({_id : body.articleId})
			.exec((err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			data.title = body.title;
			data.content = body.content;
			data.save((err, data) => {
				if (err) {
					reject(err);
				} else {
					res.json({success : true});
				}
			});
		});
	}).catch((err) => {
		console.log(err);
		res.json({success : false});
	});
}

function deleteArticle (req, res) {
	const body = req.body;
	new Promise((resolve, reject) => {
		//删除用户文章分类中保存的id
		function deleteClassArtivle(){
			return new Promise((resolve, reject) => {
				//查找文章分类
				return UserArticleClass
					.findOne({_id : body.id})
					.exec((err, data) => {
						if (err) {
							reject(err);
						} else {
							resolve(data);
						}
					});
			}).then((data) => {
				return new Promise((resolve, reject) => {
					//删除文章中保存的文章id
					data.content.forEach((curr, i) => {
						if (curr._id.toString() === body.classId) {
							curr.article.splice(i, 1);
						}
						data.save((err, data) => {
							if (err) {
								reject(err);
							} else {
								resolve();
							}
						});
					});
				});
			}).catch((err) => {
				reject(err);
			});
		}

		//删除文章
		function deleteArticle(){
			return new Promise((resolve, reject) => {
				Article.remove({_id : body.articleId}, (err) => {
					if (err) {
						reject();
					} else {
						resolve();
					}
				});
			});
		}

		function* loop(arr){
			for (let i=0;i<arr.length;i++) {
				yield arr[i]();
			}
		}

		return Promise
			.all(loop([deleteClassArtivle, deleteArticle]))
			.then((data) => {
				resolve();
			}).catch((err) => {
				reject(err);
			});
	}).then(() => {
		res.json({success : true});
	}).catch((err) => {
		console.log(err);
		res.json({success : false});
	});
}

function publishArticle (req, res) {
	const body = req.body;
	Article.update({_id : body.articleId}, {$set : {publish : body.Boolean}}, (err, data) => {
		if (err) {
			console.log('err', err);
			res.json({success : false});
		} else {
			console.log('data', data);
			res.json({success : true});
		}
	})
}

function comment (req, res) {
	const body = req.body;
	console.log(body);
	new Promise((resolve, reject) => {
		//获取这篇文章
		Article
			.findOne({_id : body.articleId})
			.exec((err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
	}).then((data) => {
		return new Promise((resolve, reject) => {
			// 判断回复的是谁
			// 如果是用户走这里
			if (body.to) {
				let floor;
				data.comment.forEach((curr) => {
					if (curr._id.toString() === body.childCommentId) {
						floor = ++curr.childCommentLength;
						curr.childComment.push({
							own : req.session.user.id,
							to : body.to,
							content : body.content,
							floor : floor,
						});
					}
				});
				data.save((err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve({floor, data});
					}
				});
			} else {
				// 如果是回复文章
				let floor = ++data.commentLength;
				data.comment.push({
					own : req.session.user.id,
					content : body.content,
					floor : floor,
				});
				data.save((err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve({floor, data});
					}
				});
			}
		});
	}).then((data) => {
		let comment;
		if (body.childCommentId) {
			//console.log(data);
			data.data.comment.forEach((curr) => {
				if (curr._id.toString() === body.childCommentId) {
					curr.childComment.forEach((childComment) => {
						if (childComment.floor === data.floor) {
							comment = childComment;
						}
					});
				}
			});
		} else {
			data.data.comment.forEach((curr) => {
				if (curr.floor === data.floor) {
					comment = curr;
				}
			});
		}
		console.log(comment);
		res.json({
			success : true,
			comment
		});
	}).catch((err) => {
		console.log(err);
		res.json({success : false});
	});
}

function fabulous (req, res) {
	const body = req.body;
	Article
		.findOne({_id : body.articleId})
		.exec((err, data) => {
			if (err) {
				console.log(err);
				res.json({success : false});
			} else {
				let onOff = true;
				if (body.to) {
					data.comment.forEach((curr) => {
						if (curr._id.toString() === body.to) {
							curr.fabulousPeople.forEach((fabulousPeople, i) => {
								if (fabulousPeople._id.toString() === req.session.user.id) {
									--curr.fabulous;
									curr.fabulousPeople.splice(i ,1);
									onOff = false;
								}
							});
							if (onOff) {
								++curr.fabulous;
								curr.fabulousPeople.push({
									_id : req.session.user.id
								});
							}
						}
					});
				} else {
					data.fabulousPeople.forEach((curr, i) => {
						if (curr._id.toString() === req.session.user.id) {
							--data.fabulous;
							data.fabulousPeople.splice(i ,1);
							onOff = false;
						}
					});
					if (onOff) {
						++data.fabulous;
						data.fabulousPeople.push({
							_id : req.session.user.id
						});
					}
				}
				data.save((err, data) => {
					if (err) {
						console.log(err);
						res.json({success : false});
					} else {
						res.json({success : true});
					}
				});
			}
		});
		// .update(
		// 	{_id : body.articleId},
		// 	{'$inc' : {fabulous : 1}, '$push' : {fabulousPeople : body.to}},
		// 	(err) => {
		// 		if (err) {
		// 			console.log(err);
		// 			res.json({success : false});
		// 		} else {
		// 			res.json({success : false});
		// 		}
		// 	}
		// )
}