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
  setTimeout(() => {
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
    };
  } catch (err) {
    result = {
      error: err,
    };
  }
  setTimeout(() => {
    client.close();
  }, 1000);
  return result;
};

const updatePaymentStatus = async (id, isPaid, collectionName) => {
  let client = await MongoClient.connect(url);
  const dbo = client.db(process.env.DB_NAME);
  let result = {};
  try {
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { isPaid: isPaid },
    };
    const updateResult = await dbo.collection(collectionName).updateOne(filter, updateDoc);
    result = {
      succeeded: updateResult.acknowledged,
    };
  } catch (err) {
    result = {
      error: err,
    };
  }
  setTimeout(() => {
    client.close();
  }, 1000);
  return result;
};

const updateCoupon = async (data, id, collectionName) => {
  let client = await MongoClient.connect(url);
  const dbo = client.db(process.env.DB_NAME);
  let result = {};
  try {
    const filter = { _id: new ObjectId(id) };

    const upsertResult = await dbo
      .collection(collectionName)
      .updateOne(filter, { $set: data });
    result = {
      succeeded: upsertResult.acknowledged,
    };
  } catch (err) {
    result = {
      error: err,
    };
  }
  setTimeout(() => {
    client.close();
  }, 1000);
  return result;
};

const updateGiftCertificate = async (certificate, id) => {
  let result = {};
  let client = await MongoClient.connect(url);
  const dbo = client.db(process.env.DB_NAME);
  try {
    const filter = { _id: new ObjectId(id) };
    const upsertResult = await dbo
      .collection("GiftCertificates")
      .updateOne(filter, { $set: certificate });
    result = {
      succeeded: upsertResult.acknowledged,
    };
  } catch (err) {
    result = {
      error: err,
    };
  }
  setTimeout(() => {
    client.close();
  }, 1000);
  return result;
};

const findById = async (id, collectionName) => {
  let client = await MongoClient.connect(url);
  const dbo = client.db(process.env.DB_NAME);
  let result = {};
  try {
    const filter = { _id: new ObjectId(id) };
    result = await dbo.collection(collectionName).findOne(filter);
    if (result == null) {
      result = {
        notFound: true,
        error:
          '{"errors": [{"category": "INTERNAL", "code": "INTERNAL", "detail": "Could not find the id. Please contact support for assistance."}]}',
      };
    }
  } catch (err) {
    result = {
      notFound: true,
      error:
        '{"errors": [{"category": "INTERNAL", "code": "INTERNAL", "detail": "Please contact support for assistance. Error: ' +
        err.errmsg +
        '"}]}',
    };
  }
  setTimeout(() => {
    client.close();
  }, 1000);
  return result;
};

const find = async (filter, collectionName) => {
  let client = await MongoClient.connect(url);
  const dbo = client.db(process.env.DB_NAME);
  let result = {};
  try {
    result = await dbo.collection(collectionName).findOne(filter);
  } catch (err) {
    result = {
      notFound: true,
      error:
        '{"errors": [{"category": "INTERNAL", "code": "INTERNAL", "detail": "Please contact support for assistance. Error: ' +
        err.errmsg +
        '"}]}',
    };
  }
  setTimeout(() => {
    client.close();
  }, 1000);
  return result;
};

module.exports = {
  insert,
  update,
  updatePaymentStatus,
  updateCoupon,
  find,
  findById,
  updateGiftCertificate,
};
