const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

let db;
const MongoClient = require("mongodb").MongoClient;
MongoClient.connect("mongodb+srv://jskim:<6l2sn3k4>@cluster0.gmtfm.mongodb.net/?retryWrites=true&w=majority", (error, client) => {
  // 연결되면 할 일
  if (error) return console.log(error);
  db = client.db("todoapp");

  db.collection("post").insertOne({ 이름: "jsk", 나이: 20 }, function (error, result) {
    console.log("저장 완료");
  });

  app.listen(8080, function () {
    console.log("listening on 8080");
  });
});

// 사용자가 /pet으로 방문하면(get요청하면) 펫 관련된 것 띄워주기
app.get("/", (req, resp) => {
  resp.sendFile(__dirname + "/index.html");
});
app.get("/write", (req, resp) => {
  resp.sendFile(__dirname + "/write.html");
});

app.post("/add", (req, resp) => {
  resp.send("Complete");
});
