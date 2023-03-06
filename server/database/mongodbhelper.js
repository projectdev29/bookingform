require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;

const url = process.env.DB_CONNECTION_STRING;

const insert = async (data, collectionName) => {
  let client = await MongoClient.connect(url);
  const dbo = client.db(process.env.DB_NAME);
  let result = {};
  try {
    const insertResult = await dbo.collection(collectionName).insertOne(data);
    result = {
      succeeded: insertResult.acknowledged,
      id: insertResult.insertedId,
    };
  } catch (err) {
    result = {
      error: err,
    };
  }
  await setTimeout(() => {
    client.close();
  }, 1000);
  return result;
};

module.exports = { insert };
