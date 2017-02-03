"use strict";

const multer = require('multer');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + Math.random() + '.' + file.mimetype.split('/')[1])
	}
});

function fileFilter(req, file, cb) {
	if (/(jpeg|png|gif)$/g.test(file.mimetype)) {
		cb(null, true);
	} else {
		cb(null, false);
	}
}

exports.uploadPic = multer({ fileFilter : fileFilter , limits: {fileSize : 1024*1024} , storage: storage });

exports.signIn = (req, res, next) => {
	if (req.session.user) {
		next();
	} else {
		res.redirect('/user/signIn');
	}
};