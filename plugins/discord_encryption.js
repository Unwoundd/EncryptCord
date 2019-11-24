// CONFIG: Insert your password here.
var password = "Khr7pKJNLXd+Zstn3sZ3MIbLm43KeIcc1TeqegCx5WXJ+LY9Ndxp4r+2ic0iV7PmLL1LSifU/Sl5LU8lfnBe6LGyyDV5xk9JdAzmdPrNm05sorwzFXEUjAwkhA+ad9l9mQ2VUeez4hwNkh7SrUnMvQYQwCkBLnpxifRrSFewA3PLMSNQARAQABtBpVbndvdW5kIDxVbndvdW5kQGxtYW8uY29tPokCVAQTAQgAPhYhBFGV9ZeahZfR";
// var password = "adfaldskfjlkadsf";
var toggle_on = false;
var enter_pressed = false;
var message = '';
/////////////////////////////////////
// Replace any messages we manage to decrypt.

const Plugin = require('../plugin');
var cyph = ""

module.exports = new Plugin({

    name: 'PGP Prototype',
    author: 'Unwound',
    description: "PGP encryption - automated.",
    color: 'indigo',

    load: function () {
        send_msg();
        decryptDiscordMessages(password);
    }
});

function send_msg() {
    window.monkeyPatch(findModule('sendMessage'), 'sendMessage', b => {
        if (toggle_on) {
            if(getOS() == 'Linux') {
                var recv = b.methodArguments[1].content.replace("[!]", "")
            } else {
                var recv = b.methodArguments[1].content.replace("🔒", "")
            }
            var cypher = CryptoJS.AES.encrypt(recv, password);
            b.methodArguments[1].content = cypher + " ";
        }
        return b.callOriginalMethod(b.methodArguments);
    });
}

function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }
    return os;
}

function decryptDiscordMessages(password) {
    setTimeout(function () {
        decryptDiscordMessages(password)
    }, 10);
    var nodes = document.getElementsByClassName('markup-2BOw-j');
    for (var i = nodes.length; i--;) {
        if (nodes[i].__decrypted != undefined || nodes[i].__cypher != undefined) continue;
        nodes[i].__decrypted = true;
        var text = nodes[i].innerText;
        if (text.endsWith('(edited)')) {
            text = text.slice(0, -'(edited)'.length);
        }
        var decrypted = CryptoJS.AES.decrypt(text, password);
        if (decrypted == "") continue;
        try {
            var message = decrypted.toString(CryptoJS.enc.Utf8);
            if (message == "") continue;
            nodes[i].innerHTML = '<b style="color:PaleTurquoise;font-size:112%"><div style="color:PaleTurquoise;font-size:112%">' + message + '</div></b>';
        } catch (error) {
            // console.log("Normal Message - Can't Decrypt: " + message); //Try and decrypt
        }
    }
}
decryptDiscordMessages(password);

function registerMessageHook() {
    if(getOS() == 'Linux') {
        var lock_ico = "[!]";
    } else {
        var lock_ico = "🔒";
    }
    setTimeout(registerMessageHook, 25);
    var targetNode = document.getElementsByClassName('textArea-2Spzkt')[0];
    if (targetNode == undefined) return;
    if (targetNode.value.startsWith(lock_ico) != toggle_on) {
        if (toggle_on) targetNode.value = lock_ico + " " + targetNode.value.trim();
        else targetNode.value = targetNode.value.replace(lock_ico, "");
    }
    targetNode.onkeydown = function(e) {
        var message = targetNode.value;
        if (toggle_on) {
            try {
                targetNode.value = lock_ico + " " + message.replace(lock_ico, "").replace(/^\s+/, "");
            } catch (error) {
                console.log(error);
            }
        }
        if (e.keyCode == 113) {
            targetNode.value = message.replace(lock_ico, "").replace(/^\s+/, "");
            toggle_on = !toggle_on;
            console.log("Toggled:" + toggle_on);
        }
    }
}
registerMessageHook();