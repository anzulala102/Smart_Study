const Reminder=require('../models/Reminder');
function startReminderWorker(){const poll=async()=>{try{const due=await Reminder.find({sentAt:null,remindAt:{$lte:new Date()}}).limit(100);for(const r of due){r.sentAt=new Date();r.message=`REMINDER: ${r.message}`;await r.save();console.log(`[IN-APP REMINDER] student=${r.student} assignment=${r.assignment} reminder=${r.id}`);}}catch(e){console.error('Reminder worker error:',e.message);}};poll();setInterval(poll,Number(process.env.REMINDER_POLL_MS)||60000).unref();}
module.exports={startReminderWorker};
