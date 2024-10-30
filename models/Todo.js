// models/Todo.js
const mongoose = require("mongoose");

// 定義Schema
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "標題為必填項"],
    trim: true,
    minlength: [1, "標題至少需要1個字符"],
    maxlength: [100, "標題不能超過100個字符"],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 導出模型
module.exports = mongoose.model("Todo", todoSchema);
