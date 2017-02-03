"use strict";

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

let UserSchema = new Schema({
	contact : {
		type : String,
		unique : true
	},
	name : {
		type : String,
		unique : true
	},
	password : String,
	article : {
		type : ObjectId,
		ref : 'userArticleClass'
	},
	role : {
		type : Number,
		default : 0
	},
	time : {
		createTime : {
			type : Date,
			default : Date.now()
		}
	}
});

UserSchema.pre('save', function (next) {
	let user = this;
	if (this.isNew) {
		this.role = 0;
		bcrypt.genSalt(108, function(err, salt){
			if (err) {throw err}
			bcrypt.hash(user.password, null, null, function(err, hash) {
				if (err) {throw err}
				user.password = hash;
				next();
			});
		});
	}
});

UserSchema.methods = {
	comparePassword : function(_password, cd){
		bcrypt.compare(_password, this.password, cd);
	}
};

module.exports = mongoose.model('user', UserSchema);