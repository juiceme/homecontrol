<!DOCTYPE html>
<html>
<head>
<style>
    table, th, td { border:1px solid black; border-collapse: collapse; }
    th, td { padding: 10px; }
</style>
</head>
<body>
<form> status: <input type="text" id="myStatusField" value="" disabled></form>
<br>
<div id = "myDiv1"> </div>

<script language="javascript" type="text/javascript">

var site = window.location.hostname;
var mySocket = new WebSocket("ws://" + site + ":8088/");
var sessionPassword = "TempPassw0rd";
var connectionTimerId;

mySocket.onopen = function (event) {
    document.body.replaceChild(createPageGadgets(), document.getElementById("myDiv1"));
    var sendable = {type:"clientStarted", content:"none"};
    mySocket.send(JSON.stringify(sendable));
    document.getElementById("myStatusField").value = "started";
    connectionTimerId = setTimeout(function() { 
	document.getElementById("myStatusField").value = "No connection to server";
    }, 4000);
};

mySocket.onmessage = function (event) {
    var receivable = JSON.parse(event.data);

//    console.log("Received message: " + JSON.stringify(receivable));

    if(receivable.type == "statusData") {
        document.getElementById("myStatusField").value = receivable.content;
    }

    if(receivable.type == "automationData") {
	var automationData = JSON.parse(Aes.Ctr.decrypt(receivable.content, sessionPassword, 128));
	updatePageGadgets(automationData);
   }
}


// --------------

function updatePageGadgets(automationData) {
//    console.log(automationData);
    document.getElementById("temperature1").value = automationData.temp1;
    document.getElementById("temperature2").value = automationData.temp2;
    document.getElementById("temperature3").value = automationData.temp3;
    document.getElementById("temperature4").value = automationData.temp4;
}

function createPageGadgets() {
    var fieldset = document.createElement('fieldsetset');
    fieldset.appendChild(document.createElement('br'));
    var table = document.createElement('table');
    table.appendChild(document.createElement('thead'));

    var tableBody = document.createElement('tbody');
    var row1 = document.createElement('tr');
    var row2 = document.createElement('tr');
    var row3 = document.createElement('tr');
    var row4 = document.createElement('tr');
    var cell1a = document.createElement('td');
    var cell1b = document.createElement('td');
    var cell2a = document.createElement('td');
    var cell2b = document.createElement('td');
    var cell3a = document.createElement('td');
    var cell3b = document.createElement('td');
    var cell4a = document.createElement('td');
    var cell4b = document.createElement('td');
    var temperature1field = document.createElement("input");
    var temperature2field = document.createElement("input");
    var temperature3field = document.createElement("input");
    var temperature4field = document.createElement("input");
    temperature1field.id="temperature1";
    temperature1field.name="makuuhuone";
    temperature1field.type="text";
    temperature2field.id="temperature2";
    temperature2field.name="olohuone";
    temperature2field.type="text";
    temperature3field.id="temperature3";
    temperature3field.name="keittiö";
    temperature3field.type="text";
    temperature4field.id="temperature4";
    temperature4field.name="kylpyhuone";
    temperature4field.type="text";
    cell1a.appendChild(document.createTextNode(uiText("makuuhuone")));
    cell2a.appendChild(document.createTextNode(uiText("olohuone")));
    cell3a.appendChild(document.createTextNode(uiText("keittiö")));
    cell4a.appendChild(document.createTextNode(uiText("kylpyhuone")));
    cell1b.appendChild(temperature1field);
    cell2b.appendChild(temperature2field);
    cell3b.appendChild(temperature3field);
    cell4b.appendChild(temperature4field);
    row1.appendChild(cell1a);
    row1.appendChild(cell1b);
    row2.appendChild(cell2a);
    row2.appendChild(cell2b);
    row3.appendChild(cell3a);
    row3.appendChild(cell3b);
    row4.appendChild(cell4a);
    row4.appendChild(cell4b);
    tableBody.appendChild(row1);
    tableBody.appendChild(row2);
    tableBody.appendChild(row3);
    tableBody.appendChild(row4);
    table.appendChild(tableBody);
    fieldset.appendChild(table);
    fieldset.id= "myDiv1";
    return fieldset;
}

function uiText(text) {
    return decodeURIComponent(escape(text));
}

function sendToServer(type, content) {
    var sendable = { type: type, content: content };
    mySocket.send(JSON.stringify(sendable));
}

function sendToServerEncrypted(type, content) {
    var sendable = { type: type,
		     content: Aes.Ctr.encrypt(JSON.stringify(content), sessionPassword, 128) };
    mySocket.send(JSON.stringify(sendable));
}
