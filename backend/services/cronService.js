const cron = require('node-cron');
const Pod = require('../models/Pod');
const Community = require('../models/Community');

function startCronJobs() {
  // Expire pods every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      await Pod.updateMany(
        { expiresAt: { $lt: now }, active: true },
        { active: false }
      );
      console.log('✅ Expired pods cleaned up');
    } catch (error) {
      console.error('❌ Cron job error (expire pods):', error);
    }
  });

  // Recompute trending every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const communities = await Community.find();

      for (const community of communities) {
        const recentActivity = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentPods = await Pod.countDocuments({
          communityId: community._id,
          createdAt: { $gt: recentActivity }
        });

        const activityScore = community.membersCount * 0.3 + recentPods * 0.7;

        await Community.findByIdAndUpdate(community._id, {
          activityScore
        });
      }

      console.log('✅ Trending scores updated');
    } catch (error) {
      console.error('❌ Cron job error (trending):', error);
    }
  });
}

module.exports = { startCronJobs };
