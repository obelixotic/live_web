let globalArr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"];
let otherUser = '';

// Open and connect input socket
let socket = io();

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
    display(data);
  });

  socket.on('istyping', function() {
    // show();
    display();
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
    gibber(inputText.value);
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

function gibber(data) {
  let ogMessage = data;
  // console.log('ogMessage: ' + inputText.value);
  let newMessage = randomizeMessage(ogMessage);
  console.log('Me: ' + newMessage);
  socket.emit('text', newMessage);
  // console.log('message sent!');
}

function randomizeMessage(x) {
  //make the string into an characters
  let array = x.split('');

  //random number of characters to replace
  let randomNum = Math.round(0.15 * array.length);
  // console.log("random num is " + randomNum);

  //getting a random index from for loop
  for (let i = 0; i < randomNum; i++) {

    //index numbers from random char in the message array
    let randomIndex = Math.floor(Math.random() * array.length);
    // console.log("random index: " + randomIndex);

    //index numbers from random char in globalChar array
    let globalIndex = Math.floor(Math.random() * globalArr.length);
    // console.log("global index: " + globalIndex);

    //find a character at that specific random number and then replace it with ? (as a test)
    //array[randomIndex] = "?";

    //replace the characters from [randomIndex] with characters from [globalIndex]
    if (array[randomIndex] != ' ') {
      array[randomIndex] = globalArr[globalIndex];
    }
  }
  //make into a new string
  return array.join('');
  console.log('done');
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