const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

let db;
MongoClient.connect("mongodb+srv://jsk:asdfasdf@cluster0.k72gwwy.mongodb.net/?retryWrites=true&w=majority", function (err, client) {
  // if (err) return console.log(err);

  db = client.db("todoapp");

  app.listen(8080, function () {
    console.log("listening on 8080");
  });
  app.post("/add", (req, resp) => {
    resp.send("Complete");
    db.collection("counter").findOne({ name: "게시물갯수" }, function (err, result) {
      let totalPostCount = result.totalPost;
      db.collection("post").insertOne({ _id: totalPostCount + 1, 제목: req.body.title, 날짜: req.body.date }, function (err, result) {
        console.log("complete");
        db.collection("counter").updateOne({ name: "게시물갯수" }, { $inc: { totalPost: 1 } }, function (err, result) {
          if (err) return console.log(err);
        });
      });
    });
  });

  app.get("/list", (req, resp) => {
    db.collection("post")
      .find()
      .toArray(function (err, result) {
        console.log(result);
        resp.render("list.ejs", { posts: result });
      });
  });
});

app.get("/", (req, resp) => {
  // resp.sendFile(__dirname + "/index.ejs");
  resp.render("index.ejs");
});
app.get("/write", (req, resp) => {
  resp.render("write.ejs");
});

app.delete("/delete", function (req, resp) {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, function (err, result) {
    console.log("Delete Done");
    resp.status(200).send({ message: "성공했습니다" });
  });
});

app.get("/detail/:id", (req, resp) => {
  db.collection("post").findOne({ _id: parseInt(req.params.id) }, function (err, result) {
    console.log(result);
    resp.render("detail.ejs", { data: result });
  });
});
app.get("/edit/:id", (req, resp) => {
  db.collection("post").findOne({ _id: parseInt(req.params.id) }, function (err, result) {
    if (result != null) {
      resp.render("edit.ejs", { data: result });
    } else {
      resp.render("error.ejs");
    }
  });
});

app.put("/edit", function (req, resp) {
  db.collection("post").updateOne({ _id: parseInt(req.body.id) }, { $set: { 제목: req.body.title, 날짜: req.body.date } }, function (err, result) {
    console.log("수정완료");
    resp.redirect("/list");
  });
});
