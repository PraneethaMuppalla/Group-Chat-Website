const { CronJob } = require("cron");
const Message = require("../models/message");
const ArchievedMsg = require("../models/archieved-msg");
const { Op } = require("sequelize");

const job = CronJob.from({
  cronTime: "0 0 0 * * *",
  onTick: archieveMsg,
  start: true,
  timeZone: "Asia/Kolkata",
});

async function archieveMsg() {
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
        const promise1 = ArchievedMsg.create({
          id,
          message,
          time,
          isImage,
          userId,
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
