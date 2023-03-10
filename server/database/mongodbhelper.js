require("dotenv").config();
const { ObjectId } = require("mongodb");

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

const update = async (data, id, collectionName) => {
  let client = await MongoClient.connect(url);
  const dbo = client.db(process.env.DB_NAME);
  let result = {};
  try {
    const filter = { _id: new ObjectId(id) };

    const upsertResult = await dbo
      .collection(collectionName)
      .updateOne(filter, { $set: { formData: data } });
    result = {
      succeeded: upsertResult.acknowledged,
      id: upsertResult.upsertedId,
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

module.exports = { insert, update };
