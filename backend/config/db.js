const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('Mongoose connected..');
  } catch (error) {
    console.log(`Error while connecting DB ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
