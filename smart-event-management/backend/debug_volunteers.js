const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const Registration = require('./src/models/Registration');
    const volunteers = await Registration.find({ role: 'volunteer' }).lean();
    console.log('Total Volunteers Found:', volunteers.length);
    volunteers.forEach(v => {
        console.log(`Volunteer ID: ${v._id}, Raw User Field: ${v.user}`);
    });
    process.exit(0);
}

check();
