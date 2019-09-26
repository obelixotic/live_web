let globalArr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"];
let otherUser = '';

// Open and connect input socket
let socket = io();
let mode, cipherText;

window.addEventListener('load', setup);

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");

});

// Input field
let inputText;
let username;

function setup() {
  // noCanvas();
  randomAccentCol();
  // console.log('setup happened!');
  // Listen for changes to input field
  inputText = document.getElementById('inputText');
  username = document.getElementById('username');

  inputText.addEventListener('keypress', keyPressedInput);
  username.addEventListener('keypress', keyPressedUser);

  // inputText.input(inputChanged);

  // Listen for texts from partners
  socket.on('text', function(data) {
    console.log('You: ' + data);
    mode = 'decrypt';
    cipherText = data;
    display(doCrypt(true, mode));
  });

  socket.on('istyping', function() {
    show();
    // display();
  });

  socket.on('connectedUsername', function(user) {
    otherUser = user;
    console.log('connected to: ' + otherUser);
    // removeElements();
    display(`You're connected to ${otherUser}`);
  });

  // Remove disconnected users
  // Display "User left" message
  socket.on('leave room', function() {
    console.log('(they left...)');
    display('(they left...)');
  });
}

// Display text
function show() {
  // removeElements();
  document.getElementById('displayText').innerHTML = `${otherUser} is typing...`;
}

function display(data) {
  // removeElements();
  document.getElementById('displayText').innerHTML = data;
}

function keyPressedInput(e) {
  // console.log(e);
  if (e.keyCode == 13) {
    // console.log(inputText.value);
    cipher(inputText.value);
    inputText.value = '';
  } else {
    socket.emit('istyping');
  }
}

function keyPressedUser(e) {
  // console.log(e);
  if (e.keyCode == 13) {
    console.log('my username: ' + username.value);
    let myUsername = username.value;
    socket.emit('username', myUsername);
    inputText.style.visibility = "visible";
  }
}

function cipher(data) {
  let ogMessage = data;
  // console.log('ogMessage: ' + inputText.value);
  mode = 'encrypt'
  let newMessage = doCrypt(false, mode);
  console.log('Me: ' + newMessage);
  socket.emit('text', newMessage);
  // console.log('message sent!');
  // doCrypt(false);
}

function randomAccentCol() {
  let gradientContainer = document.getElementsByClassName("gradientContainer");
  //not working!
  //gradientContainer.classList.add('gradient' + [Math.floor(Math.random() * 5)]);

  let colors = [
    "yellow",
    "pink",
    "purple",
    "green"
  ];

  // console.log('colors: ' + colors);
  let randomIndex = Math.floor(Math.random() * colors.length);

  // console.log('random index: ' + randomIndex);
  gradientContainer[0].classList.add(colors[randomIndex]);
}

/*
 * credit:
 * https://www.nayuki.io/res/vigenere-cipher-javascript/vigenere-cipher.js

"use strict";


/*
 * Handles the HTML input/output for Vigenère cipher encryption/decription.
 * This is the one and only entry point function called from the HTML code.
 */
function doCrypt(isDecrypt, mode) {
  let textElem;
  if (mode == 'encrypt') {
    if (document.getElementById("username").value.length == 0) {
      alert("Key is empty");
      return;
    }
    var key = filterKey(document.getElementById("username").value);
    if (key.length == 0) {
      alert("Key has no letters");
      return;
    }
    textElem = document.getElementById("inputText").value;
  } else if (mode == 'decrypt') {
    if (!otherUser) {
      alert("Key is empty");
      return;
    }
    var key = filterKey(otherUser);
    if (key.length == 0) {
      alert("Key has no letters");
      return;
    }
    textElem = cipherText;
    // console.log(textElem);
  }
  if (isDecrypt) {
    for (var i = 0; i < key.length; i++)
      key[i] = (26 - key[i]) % 26;
    // console.log(key);
  }
  textElem = crypt(textElem, key);
  return textElem;
}


/*
 * Returns the result the Vigenère encryption on the given text with the given key.
 */
function crypt(input, key) {
  var output = "";
  for (var i = 0, j = 0; i < input.length; i++) {
    var c = input.charCodeAt(i);
    if (isUppercase(c)) {
      output += String.fromCharCode((c - 65 + key[j % key.length]) % 26 + 65);
      j++;
    } else if (isLowercase(c)) {
      output += String.fromCharCode((c - 97 + key[j % key.length]) % 26 + 97);
      j++;
    } else {
      output += input.charAt(i);
    }
  }
  return output;
}


/*
 * Returns an array of numbers, each in the range [0, 26), representing the given key.
 * The key is case-insensitive, and non-letters are ignored.
 * Examples:
 * - filterKey("AAA") = [0, 0, 0].
 * - filterKey("abc") = [0, 1, 2].
 * - filterKey("the $123# EHT") = [19, 7, 4, 4, 7, 19].
 */
function filterKey(key) {
  var result = [];
  for (var i = 0; i < key.length; i++) {
    var c = key.charCodeAt(i);
    if (isLetter(c))
      result.push((c - 65) % 32);
  }
  return result;
}


// Tests whether the specified character code is a letter.
function isLetter(c) {
  return isUppercase(c) || isLowercase(c);
}

// Tests whether the specified character code is an uppercase letter.
function isUppercase(c) {
  return 65 <= c && c <= 90; // 65 is character code for 'A'. 90 is 'Z'.
}

// Tests whether the specified character code is a lowercase letter.
function isLowercase(c) {
  return 97 <= c && c <= 122; // 97 is character code for 'a'. 122 is 'z'.
}