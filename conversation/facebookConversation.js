const PureCloudChat = require('../purecloud-chat.js');
const { DialogflowConnector } = require('../helpers/dialogflowConnector');
const firestoreConnector = require('../helpers/firestoreConnector');
const request = require('request');

const FACEBOOK_ACCESS_TOKEN = 'EAAe9imZCZB8OwBALiNi7Xn3e6uurk4ujsPAKBharoZBiFsVZCk75n5vI5eszBFcWxeCDEknFTTZA3tQZCyZBAlyXfohdMMXDWfqIFCIeutx2v82aUNBj3IwYnz49aBlabmolxAfwTCywoL415KoMR3HCkXN56yZCsAd4t4EHC4BD2QZDZD';

const sendTextMessage = (senderId, text) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: { text },
        }
    });
};

const sendAttachment = (senderId, type, url) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                attachment: {
                    type: type,
                    payload: {
                        is_reusable: true,
                        url: url
                    }
                }
            }
        }
    });
}

const { MessengerClient } = require('messaging-api-messenger');

// get accessToken from facebook developers website
const client = MessengerClient.connect(FACEBOOK_ACCESS_TOKEN);

const sendSpecified = (senderId, attachment) => {
    console.log('senderId', senderId);
    request({
        url: 'https://graph.facebook.com/v3.2/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: attachment
                    }
                }
            }
        }
    });
}

class FbConversation {
    constructor(senderId) {
        this.senderId = senderId;
        this.welcome = false;
        this.language = null;
        this.purecloud = false;
        this.agentJoined = false;
        this.storageObject = {};
        this.history = [];
        this.dialogflow = new DialogflowConnector(this, 'FACEBOOK');
    }

    getSenderId() {
        return this.senderId;
    }

    getState() {
        return this.purecloud;
    }

    setStateToBot() {
        this.purecloud = false;
    }

    receiveRequest(req, res) {
        //console.log('req.body', req.body.entry[0].messaging[0]);

        req.body.entry.forEach(entry => {
            //console.log('req.body.entr', req.body.entry[0].messaging[0]);

            entry.messaging.forEach(event => {
                var request = null;
                if (event.message && event.message.text) {
                    request = event.message.text;
                }
                else if (event.postback && event.postback.payload) {
                    request = event.postback.payload;
                }
                console.log('request', request);
                if (request != null) {
                    this.history.push('Customer:\t' + request);
                    if (this.purecloud == false) {
                        firestoreConnector.insertDialog("Facebook", this.senderId, 'Client', 'Bot', request, new Date());
                    }
                    else {
                        firestoreConnector.insertDialog("Facebook", this.senderId, 'Client', 'PureCloud', request, new Date());
                    }

                    if (this.welcome == false) {
                        this.sendResponseToClient('你好！ 歡迎使用機器人\nHello! Welcome to use the bot', 'Bot')
                        this.history.push('Bot:\t' + '你好！ 歡迎使用機器人\nHello! Welcome to use the bot');
                        this.welcome = true;
                        this.dialogflow.sendResponse('show language choices');
                    }
                    else if (this.language == null) {
                        this.dialogflow.checkLanguage(request);
                    }
                    else if (this.purecloud == false) {
                        //   if (request) {
                        //firestoreConnector.insertDialog("Facebook", this.senderId, 'Client', 'Bot', request, new Date());
                        this.history.push('Customer:\t' + request);
                        this.dialogflow.sendResponse(request, this.language);
                        // }
                    }
                    else {
                        //if (request) {
                        //firestoreConnector.insertDialog("Facebook", this.senderId, 'Client', 'PureCloud', request, new Date());
                        PureCloudChat.sendMessageToPureCloud(request, this.storageObject);
                        //}
                    }
                }
            });
        });
        res.status(200).end();
    }

    sendResponseToClient(text, source) {
        firestoreConnector.insertDialog("Facebook", this.senderId, source, 'Client', text, new Date());
        sendTextMessage(this.senderId, text)
    }

    sendAttachmentToClinet(type, url, mediaId, source) {
        console.log(mediaId);
        sendAttachment(this.senderId, type, url);
    }

    sendSpecifiedToClient(card) {
        sendSpecified(this.senderId, card);
    }

    connectToAgent() {
        PureCloudChat.startChat(this.storageObject, this, this.senderId);
    }


}
module.exports = FbConversation;