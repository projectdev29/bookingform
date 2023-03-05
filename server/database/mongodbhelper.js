const MongoClient = require("mongodb").MongoClient;

const url = process.env.DB_CONNECTION_STRING;

const init = async () => {
  console.log("connecting...");
  await MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log("error: " + err);
      throw err;
    }

    var dbo = db.db("bookingforvisa");
    dbo.collection("FormSubmissions").insertOne({
      name: "John Doe",
      age: 30,
      email: "johndoe@example.com",
    });
  });
};

module.exports = { init };
