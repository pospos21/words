// ==UserScript==
// @name         Optimized Autoguesser
// @author       positivelypositive
// @include      *https://skribbl.io/*
// @grant        GM.xmlHttpRequest
// @connect      raw.githubusercontent.com
// @require      http://code.jquery.com/jquery-3.5.1.min.js
// @require      http://code.jquery.com/ui/1.12.1/jquery-ui.js
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

//For fastest/continuous guessing: SEE COMMENTS IN ALL CAPS
//Note: this version is not optimized for user experience; only for actual guessing speed.

var words, visible, guessed, relevant, name;

$(document).ready(() => {
    name = localStorage.getItem("name");
    unsafeWindow.dictionary = {
        words: []
    };
    GM.xmlHttpRequest({
    method: "GET",
    url: "https://raw.githubusercontent.com/pospos21/words/master/Word.json",
        onload(res) {
            unsafeWindow.dictionary.words = Object.values(JSON.parse(res.responseText))[0];
            words = unsafeWindow.dictionary.words.map(function(item) {
                return item.Word;
            });
            var int0 = setInterval(function(){
                if ($('#currentWord').text() != ""){
                    clearInterval(int0);
                    guesser();
                    return;
                }
            }, 100); //250 FAST, 1000 SLOW
        }
    });
});

function guesser() {
    guessed = 0;
    visible = 0;
    relevant = words.slice(0);
    var int1 = setInterval(function(){ //keep checking until it sees someone drawing
        for (var i = 0; i < 12; i++){
            if ($(".drawing").eq(i).is(":visible") && !$(".name").eq(i).html().includes(name)){
                visible = 1;
                clearInterval(int1);
                guesser2();
                return;
            }
        }
    }, 100); //250 FAST, 1000 SLOW
}

function guesser2() {
    setTimeout(function(){
        guess($('#currentWord').text()); //UNCOMMENT FOR FASTEST GUESSING
    }, 100);
    var int2 = setInterval(function(){
        visible = 0;
        for (var i = 0; i < 12; i++){
            if ($(".drawing").eq(i).is(":visible")){
                visible = 1;
            }
        }
        if (guessed == 1 || visible == 0){ //if the word has been guessed or no one is drawing anymore
            clearInterval(int2);
            if (guessed == 1){
                guesser3();
            }
            else{
                guesser();
            }
            return;
        }
        else{
            guess($('#currentWord').text()); //guesses up to four times at once, every two seconds
        }
    }, 2250); //2100 occasionally kicked at full guessing power
}

function guesser3() {
    var int3 = setInterval(function(){ //keep checking until it sees someone drawing
        visible = 0;
        for (var i = 0; i < 12; i++){
            if ($(".drawing").eq(i).is(":visible")){
                visible = 1;
            }
        }
        if (visible == 0){
            clearInterval(int3);
            guesser();
            return;
        }
    }, 100); //250 FAST, 1000 SLOW
}

function guess(hint) {
    var len = hint.length;

    for (var i = 0; i < relevant.length; i++){
        if (relevant[i].length != len){
            relevant.splice(i,1);
            i--;
        }
    }

    if (hint != '_'.repeat(len)){
        for (var j = 0; j < len; j++){
            if (hint[j] != '_'){
                for (var k = 0; k < relevant.length; k++){
                    if (relevant[k][j] != hint[j]){
                        relevant.splice(k,1);
                        k--;
                    }
                }
            }
        }
    }
    else{
        for (var x = 0; x < relevant.length; x++){
            if (relevant[x].includes(" ") || relevant[x].includes("-")){
                relevant.splice(x,1);
                x--;
            }
        }
    }

    var gwords = [];
    if (relevant.length > 0){
        for (var z = 0; z<4; z++){ //CHANGE Z<1 TO Z<4 FOR FASTEST GUESSING
            if (relevant.length > 0){
                var ind = Math.floor(relevant.length*Math.random());
                gwords.push(relevant[ind]);
                unsafeWindow.submit(relevant[ind]);
                relevant.splice(ind,1);
            }
        }
    }

    var isclose = 0;
    var closeword = "";

    setTimeout(function(){
        var chat = getchat(16);

        for (var r = 0; r < gwords.length; r++){
            var word = gwords[r];
            for (var m = 0; m < chat.length; m++){
                if (chat[m] == name.concat(" guessed the word!")){
                    guessed = 1;
                }
                else if (chat[m].includes("is close!")){
                    closeword = chat[m].replace("' is close!","").replace("'","");
                    if (closeword == word){
                        isclose = 1;
                    }
                }
            }

            if (isclose == 0){
                for (var n = 0; n < relevant.length; n++){
                    if (close(word.toLowerCase(), relevant[n].toLowerCase()) == true){
                        relevant.splice(n,1);
                        n--;
                    }
                }
            }
            else{
                for (var o = 0; o < relevant.length; o++){
                    if (close(closeword.toLowerCase(), relevant[o].toLowerCase()) == false){
                        relevant.splice(o,1);
                        o--;
                    }
                }
            }
        }

    }, 300); //300-1500
}

function close(word, listword){
    var match = 0;
    for (var i = 0; i < word.length; i++){
        if (word[i] == listword[i]){
            match++;
        }
    }

    if (match > word.length - 2){
        return true;
    }
    else{
        return false;
    }
}

function getchat(num_msgs){
    var msgs = $('#boxMessages').find("span").map(function(){
        return $.trim($(this).text());
    }).get();
    if (msgs.length > num_msgs){
        msgs = msgs.slice(msgs.length - num_msgs);
    }
    for (var y = 0; y < msgs.length; y++){
        if (msgs[y].includes("is drawing now!")){
            msgs = msgs.slice(y);
            if (msgs.length > 1){
                y = 0;
            }
        }
    }
    return msgs;
}

unsafeWindow.submit = (guess) => {
    const submitProp = Object.keys(unsafeWindow.formChat).filter((k) => ~k.indexOf("jQuery"))[0];
    unsafeWindow.getInput().val(guess.toLowerCase()); //toLowerCase for "less bot-like" guessing
    unsafeWindow.formChat[submitProp].events.submit[0].handler();
};

unsafeWindow.getInput = () => $("#inputChat");