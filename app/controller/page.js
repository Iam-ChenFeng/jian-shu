"use strict";

let Article = require('../model/article.js');

// 主页
exports.index = index;

// test
exports.test1 = test1;
exports.test2 = test2;

function index (req, res) {
    Article
        .find({publish : true})
        .populate('author', 'name')
        .exec((err, data) => {
            if (err) {
                console.log(err);
                res.send('信息拉取失败')
            } else {
                let article = [];
                data.forEach((curr) => {
                    article.push({
                        id : curr._id,
                        author : curr.author,
                        title : curr.title,
                        read : curr.read,
                        fabulous : curr.fabulous,
                        time : curr.time.createTime.toLocaleDateString(),
                        commentLength : curr.commentLength,
                    })
                });
                console.log(article);
                res.render('index', {
                    article
                });
            }
        });
}

function test1 (req, res) {
    res.render('test/test1', {
        layout : false
    })
}
function test2 (req, res) {
    res.render('test/test2', {
        layout : false
    })
}