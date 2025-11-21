require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { getLocationFromIP } = require('../services/geoService');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for backfill');

  try {
    const batchSize = 50;
    let processed = 0;

    // Query users with missing or default location ([0,0]) and with lastIp
    const query = {
      lastIp: { $exists: true, $ne: null },
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates.0': 0, 'location.coordinates.1': 0 }
      ]
    };

    const total = await User.countDocuments(query);
    console.log(`Users to process: ${total}`);

    const cursor = User.find(query).cursor();
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      processed++;
      const userId = doc._id;
      const ip = doc.lastIp;
      if (!ip) continue;

      try {
        const geo = await getLocationFromIP(ip);
        if (geo && geo.lat !== undefined && geo.lng !== undefined) {
          await User.findByIdAndUpdate(userId, {
            location: { type: 'Point', coordinates: [parseFloat(geo.lng), parseFloat(geo.lat)] }
          });
          console.log(`Updated user ${userId} from IP ${ip} -> ${geo.lat},${geo.lng} (${processed}/${total})`);
        } else {
          console.log(`No geo for user ${userId} (ip ${ip}) (${processed}/${total})`);
        }
      } catch (err) {
        console.error(`Failed to update user ${userId}:`, err.message || err);
      }

      // Throttle requests slightly to avoid any burst issues
      if (processed % batchSize === 0) {
        console.log('Sleeping for 500ms to avoid bursts...');
        await sleep(500);
      } else {
        await sleep(100);
      }
    }

    console.log('Backfill complete');
  } catch (err) {
    console.error('Backfill error:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
