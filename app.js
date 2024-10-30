// app.js
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const Todo = require("./models/Todo");
const app = express();
const PORT = 3000;

// 處理未捕獲的異常和未處理的 Promise 拒絕
process.on("uncaughtException", (err) => {
  console.error("未捕獲的異常：", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("未處理的 Promise 拒絕：", promise, "原因：", reason);
});

//中間件
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // 處理提交表單的方法
app.use(methodOverride("_method"));

// 設定EJS
app.set("view engine", "ejs");

// 連接MongoDB
mongoose
  .connect("mongodb://localhost:27017/todoapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB連接成功"))
  .catch((err) => console.log("MongoDB連接錯誤:", err));

// 路由：顯示所有待辦事項
app.get("/", async (req, res, next) => {
  try {
    const todos = await Todo.find().sort("-createdAt"); //使用創建時間作為排序依據，走降序排序
    res.render("index", { todos });
  } catch (err) {
    next(err);
  }
});

// 路由：新增待辦事項
app.post("/todos", async (req, res, next) => {
  try {
    const title = req.body.title ? req.body.title.trim() : "";
    if (!title) {
      const todos = await Todo.find().sort("-createdAt"); // 獲取待辦事項列表
      return res.status(400).render("index", { todos, error: "*標題為必填項" });
    }
    const todo = new Todo({ title });
    await todo.save();
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

// 路由：切換完成狀態
app.put("/todos/:id/toggle", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("無效的ID格式");
    }
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).send("待辦事項未找到");
    }
    todo.completed = !todo.completed;
    await todo.save();
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

//編輯頁面的路由
app.get("/todos/:id/edit", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("無效的ID格式");
    }
    const todo = await Todo.findById(req.params.id);
    if (todo == null) {
      return res.status(404).send("待辦事項未找到");
    }
    res.render("edit", { todo: todo });
  } catch (err) {
    next(err);
  }
});

//處理更新的路由
app.put("/todos/:id", async (req, res, next) => {
  let todo;
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("無效的ID格式");
    }
    todo = await Todo.findById(req.params.id);
    if (todo == null) {
      return res.status(404).send("待辦事項未找到");
    }
    // 驗證標題
    const title = req.body.title ? req.body.title.trim() : "";
    if (!title) {
      return res.status(400).render("edit", {
        todo,
        error: "*標題為必填項",
      });
    }
    todo.title = req.body.title;
    await todo.save();
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

// 路由：刪除待辦事項
app.delete("/todos/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("無效的ID格式");
    }
    const result = await Todo.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send("待辦事項未找到");
    }
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

// 404 錯誤處理
app.use((req, res, next) => {
  res.status(404).send("頁面未找到");
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "ValidationError") {
    res.status(400).send(err.message);
  } else if (err.name === "CastError" && err.kind === "ObjectId") {
    res.status(400).send("無效的ID格式");
  } else {
    res.status(500).send("內部服務器錯誤");
  }
});

app.listen(PORT, () => {
  console.log(`伺服器正在執行在 http://localhost:${PORT}`);
});
