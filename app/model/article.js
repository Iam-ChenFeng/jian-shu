"use strict";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

let ArticleSchema = new mongoose.Schema({
    author : {
        type : ObjectId,
        ref : 'user'
    },
    title : {
        type : String,
        default : '无标题文章'
    },
    content : {
        type : String,
        default : ''
    },
    read : {
        type : Number,
        default : 0
    },
    fabulous : {
        type : Number,
        default : 0
    },
    fabulousPeople : [],
    fabulousOnOff : Boolean,
    publish : {
        type : Boolean,
        default : false
    },
    time : {
        createTime : {
            type : Date,
            default : Date.now()
        }
    },
    commentLength : {
        type : Number,
        default : 0
    },
    comment : [{
        own : {
            type : ObjectId,
            ref : 'user'
        },
        floor : Number,
        content : String,
        fabulous : {
            type : Number,
            default : 0
        },
        fabulousPeople : [],
        fabulousOnOff : Boolean,
        time : {
            createTime : {
                type : String,
                default : new Date().toLocaleString()
            }
        },
        childCommentLength : {
            type : Number,
            default : 0
        },
        childComment : [{
            own : {
                type : ObjectId,
                ref : 'user'
            },
            to : {
                type : ObjectId,
                ref : 'user'
            },
            floor : Number,
            content : String,
            fabulous : {
                type : Number,
                default : 0
            },
            time : {
                createTime : {
                    type : String,
                    default : new Date().toLocaleString()
                }
            },
        }],
    }]
});

module.exports = mongoose.model('article', ArticleSchema);