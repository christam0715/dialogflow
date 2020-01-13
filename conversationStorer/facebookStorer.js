const FacebookConversation = require('../conversation/facebookConversation');
var facebookArray = [];


module.exports = (req, res) => {
    senderId = req.body.entry[0].messaging[0].sender.id;
    if (facebookArray.length == 0) {
        var conversation = new FacebookConversation(senderId);
        facebookArray.push(conversation);
        conversation.receiveRequest(req, res);
    }
    else {
        var conversation = findFbConversation(senderId);
        if (conversation == null) {
            conversation = new FacebookConversation(senderId);
            facebookArray.push(conversation);
            conversation.receiveRequest(req, res);
        }
        else {
            conversation.receiveRequest(req, res);
        }
    }
};

function findFbConversation(customerId) {
    var i;
    for (i = 0; i < facebookArray.length; i++) {
        if (customerId == facebookArray[i].getSenderId()) {
            return facebookArray[i];
        }
    }
    return null;
}
