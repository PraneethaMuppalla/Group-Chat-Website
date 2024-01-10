const { CronJob } = require("cron");
const Message = require("../models/message");
const Archievedmessage = require("../models/archieved-message");
const { Op } = require("sequelize");

const job = CronJob.from({
  cronTime: "0 0 0 * * *",
  onTick: archievemessage,
  start: true,
  timeZone: "Asia/Kolkata",
});

async function archievemessage() {
  try {
    const oldDate = new Date();
    const date = oldDate.getDate();
    oldDate.setDate(date - 1);
    console.log(oldDate);
    const messages = await Message.findAll({
      where: {
        createdAt: { [Op.lt]: oldDate },
      },
    });
    await Promise.all(
      messages.flatMap((each) => {
        const { id, message, time, isImage, userId, groupId, createdAt } = each;
        const promise1 = Archievedmessage.create({
          id,
          text,
          attachmentType,
          attachmentUrl,
          senderId,
          groupId,
        });
        const promise2 = each.destroy();
        return [promise1, promise2];
      })
    );
    console.log("Success");
  } catch (err) {
    console.error(err);
  }
}
