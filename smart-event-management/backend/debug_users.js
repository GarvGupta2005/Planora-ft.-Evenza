const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    console.log('Total Users:', users.length);
    users.forEach(u => {
        console.log(`ID: ${u._id}, Name: ${u.fullName}`);
    });
    process.exit(0);
}

check();
