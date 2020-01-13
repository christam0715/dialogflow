const wechat = require('node-wechat')('whateveryoulike');
const WechatConversation = require('../conversation/wechatConversation');
var wechatArray = [];


module.exports = (req, res) => {
    wechat.checkSignature(req, res);
    wechat.handler(req, res);
    wechat.text(function (data) {
        console.log('data', data);
        senderId = data.FromUserName;
        console.log('senderId', senderId);
        if (wechatArray.length == 0) {
            var conversation = new WechatConversation(senderId);
            wechatArray.push(conversation);
            conversation.receiveRequest(data, res);
        }
        else {
            var conversation = findWechatConversation(senderId);
            if (conversation == null) {
                conversation = new WechatConversation(senderId);
                wechatArray.push(conversation);
                conversation.receiveRequest(data, res);
            }
            else {
                conversation.receiveRequest(data, res);
            }
        }
    });
};

function findWechatConversation(customerId) {
    var i;
    for (i = 0; i < wechatArray.length; i++) {
        if (customerId == wechatArray[i].getSenderId()) {
            return wechatArray[i];
        }
    }
    return null;
}

