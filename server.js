//importing
import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import Messages from "./dbMessages.js";
import cors from "cors";

//app config
const app = express();
const port = process.env.PORT || 5000;
const pusher = new Pusher({
  appId: "1306334",
  key: "f9888cea6103efd008ed",
  secret: "447ee6c75d91611c04ba",
  cluster: "ap2",
  useTLS: true
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("db connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    // console.log("a change occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        recieved: messageDetails.recieved
      });
    } else {
      console.log("error triggering pusher");
    }
  });
});
//middleware
app.use(express.json());
app.use(cors())
app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
})
//db config
const mongoURI =
  "mongodb+srv://admin:admin@cluster0.gaoar.mongodb.net/whatsapp?retryWrites=true&w=majority";
mongoose.connect(mongoURI, {
  // useCreateIndex: true,
  useNewUrlParser: true,
  useunifiedTopology: true,
});

// ?????

//api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
  
});

app.delete("/messages/delete", (req, res) => {
  Messages.remove((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send("data");
    }
  });
});

// app.get("/messages/name", (req, res) => {
//   Messages.findOne((err, data) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.status(200).send(data);
//     }
//   });
// });
app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

//listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));