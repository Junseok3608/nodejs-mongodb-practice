const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

let db;
MongoClient.connect("mongodb+srv://jsk:asdfasdf@cluster0.k72gwwy.mongodb.net/?retryWrites=true&w=majority", function (err, client) {
  // if (err) return console.log(err);

  db = client.db("todoapp");
  db.collection("post").insertOne({ 이름: "킴스킴", 나이: 15, _id: 100 }, function (err, result) {
    console.log("complete");
  });

  app.listen(8080, function () {
    console.log("listening on 8080");
  });
  app.post("/add", (req, resp) => {
    resp.send("Complete");
    console.log(req.body.title);
    console.log(req.body.date);
    db.collection("post").insertOne({ 제목: `${req.body.title}`, 날짜: `${req.body.date}` }, function (err, result) {
      console.log("complete");
    });
  });
});

app.get("/", (req, resp) => {
  resp.sendFile(__dirname + "/index.html");
});
app.get("/write", (req, resp) => {
  resp.sendFile(__dirname + "/write.html");
});
