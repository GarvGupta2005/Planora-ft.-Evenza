const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
    await mongoose.connect(process.env.MONGO_URI);
    const Registration = require('./src/models/Registration');
    const User = require('./src/models/User');

    // 1. Delete orphaned registrations
    const orphans = await Registration.find({ user: null });
    console.log(`Deleting ${orphans.length} orphaned registrations...`);
    await Registration.deleteMany({ user: null });

    // Also delete registrations where user ID exists but doesn't exist in User collection
    const allRegs = await Registration.find({});
    for (const reg of allRegs) {
        if (!reg.user) continue;
        const exists = await User.findById(reg.user);
        if (!exists) {
            console.log(`Deleting registration ${reg._id} for non-existent user ${reg.user}`);
            await Registration.deleteOne({ _id: reg._id });
        }
    }

    // 2. Fix hoon's role
    const hoonUser = await User.findOne({ fullName: 'volunteer hoon' });
    if (hoonUser) {
        console.log(`Found volunteer hoon (ID: ${hoonUser._id})`);
        const res = await Registration.updateMany(
            { user: hoonUser._id },
            { $set: { role: 'volunteer' } }
        );
        console.log(`Updated ${res.modifiedCount} registrations to volunteer role for hoon.`);
    }

    process.exit(0);
}

cleanup();
