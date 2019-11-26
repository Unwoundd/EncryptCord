// CONFIG: Insert your password here.
var password = "Khr7pKJNLXd+Zstn3sZ3MIbLm43KeIcc1TeqegCx5WXJ+LY9Ndxp4r+2ic0iV7PmLL1LSifU/Sl5LU8lfnBe6LGyyDV5xk9JdAzmdPrNm05sorwzFXEUjAwkhA+ad9l9mQ2VUeez4hwNkh7SrUnMvQYQwCkBLnpxifRrSFewA3PLMSNQARAQABtBpVbndvdW5kIDxVbndvdW5kQGxtYW8uY29tPokCVAQTAQgAPhYhBFGV9ZeahZfR";
var toggle_enc_on = false;
var toggle_view_on = true;
var toggle_fun_on = false;
var need_showkey = false;

var emotes_map = { //Consider putting this mapping into a different file
    ":scard:": '<img src="https://discordemoji.com/assets/emoji/9482_PepeRun.gif" height="50" width="50">',
    ":nom:": '<img src="https://discordemoji.com/assets/emoji/1301_nom_party.gif" height="50" width="50">',
    ":zoomerdance:": '<img src="https://discordemoji.com/assets/emoji/4943_zoomer.gif" height="100" width="125">',
    ":roll:": '<img src="https://discordemoji.com/assets/emoji/3993_bluba_roll.gif" height="50" width="50">',
    ":pepecorn:": '<img src="https://media.giphy.com/media/TJAQ0db5zli6s/giphy.gif" height="50" width="50">'
};



/////////////////////////////////////
// Replace any messages we manage to decrypt.

const Plugin = require("../plugin");

module.exports = new Plugin({

    name: "Encryptcord Alpha",
    author: "Unwound",
    description: "Integrated AES encryption - Hit F2 to toggle",
    color: "indigo",

    load: function () {
        send_msg();
        decryptDiscordMessages();
    }
});

function ensure_cypher(cypher, reverse = false) {
    let mid = cypher.length / 2;
    if (!reverse) {
        return cypher.substring(0, mid) + "uw" + cypher.substring(mid);
    } else {
        return cypher.substring(0, mid - 1) + cypher.substring(mid + 1);
    }
}

function send_msg() {
    window.monkeyPatch(findModule("sendMessage"), "sendMessage", b => {

        let message = b.methodArguments[1].content;
        if (message.startsWith('/key=')) {
            console.log("Prior Key:" + password)
            password = message.split("=")[1];
            console.log("Key set! current key:" + password);
            b.methodArguments[1].content = "";

        } else if (message.startsWith("/showkey") || message.startsWith("/key")) {
            console.log("Current key:" + password)
            b.methodArguments[1].content = "";
            need_showkey = true;
        }

        enc_single = false; //Encrypt when emoji detected
        for (var col in emotes_map) { //Global emojis
            if (message.includes(col)) {
                console.log("message contained emote:" + col);
                message = message.replace(col, emotes_map[col]);
                b.methodArguments[1].content = message;
                enc_single = true;
            }
        }

        if (toggle_enc_on || enc_single) {
            let message = b.methodArguments[1].content;

            if (getOS() != "Linux") {
                message = message.replace("🔒", "");
            } else {
                message = message.replace("[!]", "");
            }
            let cypher = String(CryptoJS.AES.encrypt(message, password));
            cypher = ensure_cypher(cypher);
            b.methodArguments[1].content = cypher;
            enc_single = false;
        }

        return b.callOriginalMethod(b.methodArguments);
    });
}

function getOS() {
    // userAgent, macosPlatforms, and iosPlatforms are never used
    let userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
        windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
        iosPlatforms = ["iPhone", "iPad", "iPod"],
        os = null;

    if (windowsPlatforms.indexOf(platform) !== -1) {
        os = "Windows";
    } else if (!os && /Linux/.test(platform)) {
        os = "Linux";
    }
    return os;
}

function decryptDiscordMessages() {
    setTimeout(function () {
        decryptDiscordMessages()
    }, 10);
    let nodes = document.getElementsByClassName("markup-2BOw-j");
    for (let i = nodes.length; i--;) {
        if (nodes[i].__decrypted != undefined || nodes[i].__cypher != undefined) continue;
        nodes[i].__decrypted = true;
        let text = nodes[i].innerText;
        if (text.substring((text.length / 2) - 1, (text.length / 2) + 1) != "uw") continue;
        text = ensure_cypher(text, true)
        let decrypted = CryptoJS.AES.decrypt(text, password);
        try {

            if (toggle_view_on) {
                let message = decrypted.toString(CryptoJS.enc.Utf8);
                if (message == "") continue;

                if (toggle_fun_on) {
                    nodes[i].innerHTML = '<marquee><b style="background-color:black;color:green;font-size:125%;">' + message + '</b></marquee>';
                } else {
                    nodes[i].innerHTML = '<b style="color:PaleTurquoise;font-size:125%;">' + message + '</b>';
                }
            }
        } catch (error) {
            console.log("Normal Message - Can't Decrypt: " + message); //Try and decrypt
        }
    }
}
decryptDiscordMessages();

function registerMessageHook() {
    let lock_ico = "🔒"
    if (getOS() == "Linux") {
        lock_ico = "[!]";
    }
    setTimeout(registerMessageHook, 25);
    let targetNode = document.getElementsByClassName("textArea-2Spzkt")[0];
    if (targetNode == undefined) return;
    if (need_showkey) { //Show the password in the message entry when needed
        targetNode.value = password;
        need_showkey = false;
    }
    if (targetNode.value.startsWith(lock_ico) != toggle_enc_on) {
        if (toggle_enc_on) targetNode.value = lock_ico + " " + targetNode.value.trim();
        else targetNode.value = targetNode.value.replace(lock_ico, "");
    }
    targetNode.onkeydown = function (e) {
        let message = targetNode.value;
        if (toggle_enc_on) {
            try {
                targetNode.value = lock_ico + " " + message.replace(lock_ico, "").replace(/^\s+/, "");
            } catch (error) {
                console.log(error);
            }
        }
        if (e.keyCode == 113) { // F2 to toggle lock
            targetNode.value = message.replace(lock_ico, "").replace(/^\s+/, "");
            toggle_enc_on = !toggle_enc_on;
            console.log("Toggled:" + toggle_enc_on);
        } else if (e.keyCode == 114) // F3 to toggle view 
        {
            toggle_view_on = !toggle_view_on;
            console.log("Toggled view:" + toggle_view_on);
        } else if (e.keyCode == 115) // F4 to toggle Fun mode
        {
            toggle_fun_on = !toggle_fun_on;
        }
    };
}
registerMessageHook();