const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const Registration = require('./src/models/Registration');
    const User = require('./src/models/User');
    const regs = await Registration.find({}).populate('user');
    console.log('Total Registrations:', regs.length);
    regs.forEach(r => {
        console.log(`Reg ID: ${r._id}, User: ${r.user ? r.user.fullName : 'NULL (' + r.user + ')'}, Role: ${r.role}`);
    });
    process.exit(0);
}

check();
