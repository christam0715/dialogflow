const dateFormat = require('dateformat');
const admin = require('firebase-admin');

let serviceAccount = require('./key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();
//console.log('db', db);


function insertDialog(channel, conversationID, sender, recipient, message, now) {
    let dialog = db.collection('Dialog').doc();
    dialog.set({
        Channel: channel,
        ConversationID: conversationID,
        Sender: sender,
        Recipient: recipient,
        Message: message,
        Date: dateFormat(now, "yyyy-mm-dd"),
        Time: dateFormat(now, "HH:MM:ss")
    })

}
module.exports = {
    insertDialog
};