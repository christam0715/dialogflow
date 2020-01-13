const WhatsappConversation = require('../conversation/whatsappConversation');
var whatsappArray = [];


module.exports = (req, res) => {
    senderId = req.body.From;
    if (whatsappArray.length == 0) {
        var conversation = new WhatsappConversation(senderId);
        whatsappArray.push(conversation);
        conversation.receiveRequest(req, res);
    }
    else {
        var conversation = findWhatsappConversation(senderId);
        if (conversation == null) {
            conversation = new WhatsappConversation(senderId);
            whatsappArray.push(conversation);
            conversation.receiveRequest(req, res);
        }
        else {
            conversation.receiveRequest(req, res);
        }
    }
};

function findWhatsappConversation(customerId) {
    var i;
    for (i = 0; i < whatsappArray.length; i++) {
        if (customerId == whatsappArray[i].getSenderId()) {
            return whatsappArray[i];
        }
    }
    return null;
}