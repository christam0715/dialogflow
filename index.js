
//const messageWebhookController = require('./controllers/messageWebhook');
const facebookVerificationController = require('./verification/facebookVerification');
const wechatVerificationController = require('./verification/wechatVerification');

const facebookStorer = require('./conversationStorer/facebookStorer');
const wechatStorer = require('./conversationStorer/wechatStorer');
const whatsappStorer = require('./conversationStorer/whatsappStorer');



const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(3000, () => console.log('Webhook server is listening, port 3000'));

app.get('/facebook', facebookVerificationController);
app.get('/wechat', wechatVerificationController);

app.post('/facebook', facebookStorer);
app.post('/wechat', wechatStorer);
app.post('/whatsapp', whatsappStorer);