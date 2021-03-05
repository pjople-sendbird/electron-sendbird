
const SendBird = require('sendbird');

/**
 * SENDBIRD INFORMATION
 */
var APP_ID = '';
var USER_ID = '';
var ACCESS_TOKEN = null;

var GROUP_URL = '';
const UNIQUE_HANDLER_ID = '12345678';
var sb;
var connectedUser;
var messages = 0;

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
    /**
     * INTERCEPT CLICK FOR BUTTON CONNECT
     */
    document.getElementById('butConnect').addEventListener('click', doConnect);
})

function doConnect() {
    GROUP_URL = document.getElementById('groupChannelUrl').value;
    if (!GROUP_URL) {
        return;
    }
    APP_ID = document.getElementById('appId').value;
    if (!APP_ID) {
        return;
    }
    USER_ID = document.getElementById('userId').value;
    if (!APP_ID) {
        return;
    }
    initAndConnect();
}

function initAndConnect() {
    sb = new SendBird({ appId: APP_ID });
    sb.connect(USER_ID, ACCESS_TOKEN, (user, error) => {
        connectedUser = user;
        if (error) {
            alert(error);
            return;
        } else {
            addToLog('Connected!');
            messages = 0;
            defneHandlers();
            addClickListenerToButton();
        }
    });
}

function defneHandlers() {
    var channelHandler = new sb.ChannelHandler();
    channelHandler.onMessageReceived = function(channel, message) {
        addToLog(message.message);
    };
    channelHandler.onChannelChanged = function(channel) {
        addToLog('Channel changed: ' + channel.url);
    };
    sb.addChannelHandler(UNIQUE_HANDLER_ID, channelHandler);
}

function addClickListenerToButton() {
    document.getElementById('butSendMessage').addEventListener('click', sendMessage);
}

function sendMessage() {
    if (!GROUP_URL) {
        return;
    }
    const message = document.getElementById('inputMessage').value;
    if (!message) {
        return;
    }
    sb.GroupChannel.getChannel(GROUP_URL, (groupChannel, err) => {
        if (err) {
            alert(err);
        } else {
            const params = new sb.UserMessageParams();
            params.message = message;
            params.pushNotificationDeliveryOption = 'default';
            params.mentionType = 'users';
            groupChannel.sendUserMessage(params, (message, error) => {
                if (error) {
                    alert(error);
                } else {
                    addToLog(message.message);
                }
            });
        }
    })
}

function addToLog(message) {
    if (messages == 0) {
        document.getElementById('log').innerHTML = '';
    }
    const out = `<div class="card m-3" style="border-radius:10px">
        <div class="card-body text-muted">
            ${ message }
        </div>
    </div>`;
    document.getElementById('log').innerHTML += out;
    messages ++;
}
