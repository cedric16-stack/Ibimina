const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('users').deleteMany({ role: 'admin' });
  console.log('Admin deleted!');
  process.exit();
}).catch(err => console.log(err));
