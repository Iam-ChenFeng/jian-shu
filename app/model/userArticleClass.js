"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

let UserArticleClassSchema = new mongoose.Schema({
    content : [{
        className : '',
        article : [{
            type : ObjectId,
            ref : 'article'
        }]
    }]
});

module.exports = mongoose.model('userArticleClass', UserArticleClassSchema);