const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

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
  resp.sendFile(__dirname + "/index.html");
});
app.get("/write", (req, resp) => {
  resp.sendFile(__dirname + "/write.html");
});
