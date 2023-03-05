const MongoClient = require("mongodb").MongoClient;

const url = process.env.DB_CONNECTION_STRING;

const init = () => {
  console.log("connecting...");
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("bookingforvisa");
    dbo.createCollection("formsubmissions", function (err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });
};

module.exports = { init };
