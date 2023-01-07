const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const methodOverride = require("method-override");
const { ObjectId } = require("mongodb");
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

require("dotenv").config();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

let db;
MongoClient.connect(process.env.DB_URL, function (err, client) {
  // if (err) return console.log(err);

  db = client.db("todoapp");

  http.listen(process.env.PORT, function () {
    console.log("listening on 8080");
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

// passport, session, 미들웨어 세팅
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(session({ secret: "비밀코드", resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", function (req, resp) {
  resp.render("login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  function (req, resp) {
    resp.redirect("/");
  }
);

app.get("/mypage", areULogin, function (req, resp) {
  console.log(req.user);
  resp.render("mypage.ejs", { user: req.user });
});

function areULogin(req, resp, next) {
  if (req.user) {
    next();
  } else {
    resp.send("have to login");
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (입력한아이디, 입력한비번, done) {
      console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러);

        if (!결과) return done(null, false, { message: "존재하지않는 아이디요" });
        if (입력한비번 == 결과.pw) {
          return done(null, 결과);
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (아이디, done) {
  db.collection("login").findOne({ id: 아이디 }, function (err, result) {
    done(null, result);
  });
});

app.get("/search", (req, resp) => {
  console.log(req.query.value);
  let searchCon = [
    {
      $search: {
        index: "titleSearch",
        text: {
          query: req.query.value,
          path: "제목",
        },
      },
    },
  ];
  db.collection("post")
    .aggregate(searchCon)
    .toArray((err, result) => {
      resp.render("result.ejs", { data: result });
      console.log(result);
    });
});

app.post("/register", function (req, resp) {
  db.collection("login").insertOne({ id: req.body.id, pw: req.body.pw }, function (err, result) {
    resp.redirect("/");
  });
});

app.post("/add", (req, resp) => {
  resp.send("Complete");
  db.collection("counter").findOne({ name: "게시물갯수" }, function (err, result) {
    let totalPostCount = result.totalPost;
    let savefile = { _id: totalPostCount + 1, 제목: req.body.title, 날짜: req.body.date, 작성자: req.user._id };
    db.collection("post").insertOne(savefile, function (err, result) {
      console.log("complete");
      db.collection("counter").updateOne({ name: "게시물갯수" }, { $inc: { totalPost: 1 } }, function (err, result) {
        if (err) return console.log(err);
      });
    });
  });
});

app.delete("/delete", function (req, resp) {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  var deletedata = { _id: req.body._id, 작성자: req.user._id };
  db.collection("post").deleteOne(deletedata, function (err, result) {
    console.log("Delete Done");
    if (result) {
      console.log(result);
    }
    resp.status(200).send({ message: "성공했습니다" });
  });
});

app.use("/shop", require("./routes/shop"));
app.use("/board", require("./routes/board"));

let multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/image");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

app.get("/upload", function (req, resp) {
  resp.render("upload.ejs");
});

app.post("/upload", upload.single("profile"), function (req, res) {
  res.send("upload complete");
});

app.get("/image/:imagename", function (req, resp) {
  resp.sendFile(__dirname + "/public/image/" + req.params.imagename);
});

app.post("/chatroom", areULogin, function (req, res) {
  var savedata = {
    title: "어떤 채팅방",
    member: [ObjectId(req.body.당한사람id), req.user._id],
    data: new Date(),
  };

  db.collection("chatroom")
    .insertOne(savedata)
    .then((result) => {
      res.send("successsss");
    });
});

app.get("/chat", areULogin, function (req, resp) {
  db.collection("chatroom")
    .find({ member: req.user._id })
    .toArray()
    .then((result) => {
      resp.render("chat.ejs", { data: result });
    });
});

app.post("/message", areULogin, function (req, resp) {
  var chatsavedata = {
    parent: ObjectId(req.body.parent),
    content: req.body.content,
    userid: req.user._id,
    date: new Date(),
  };
  db.collection("message")
    .insertOne(chatsavedata)
    .then(() => {
      console.log("chat successs");
      resp.send("DB save Success");
    });
});

app.get("/message:id", areULogin, function (req, resp) {
  resp.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  db.collection("message")
    .find({ parent: req.params.id })
    .toArray()
    .then((result) => {
      resp.write("event: test\n");
      resp.write("data: " + JSON.stringify(result) + "\n\n");
    });

  const pipeline = [{ $match: { "fullDocument.parent": req.params.id } }];
  const collection = db.collection("message");
  const changeStream = collection.watch(pipeline);
  changeStream.on("change", (result) => {
    resp.write("event: test\n");
    resp.write("data: " + JSON.stringify([result.fullDocument]) + "\n\n");
  });
});

app.get("/socket", function (req, resp) {
  resp.render("socket.ejs");
});
io.on("connection", function (socket) {
  console.log("websocket connected");

  socket.on("room1-send", function (data) {
    io.to("room1").emit("broadcast", data);
  });

  socket.on("joinRoom", function (data) {
    socket.join("room1");
  });

  socket.on("user-send", function (data) {
    io.emit("broadcast", data);
  });
});
