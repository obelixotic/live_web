let globalArr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"];
let otherUser = '';

// Open and connect input socket
let socket = io();

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Connected");

});

// Input field
let input;
let username;

function setup() {
  noCanvas();

  // Listen for changes to input field
  input = select('#input');
  username = select('#username');

  input.input(inputChanged);

  // Listen for texts from partners
  socket.on('text', function(data) {
    console.log(data);
    display(data);
  });

  socket.on('istyping', function() {
    show();
  });

  socket.on('connectedUsername', function(user) {
    otherUser = user;
    console.log('connected to: ' + otherUser);
    // removeElements();
    // show(username);
  });

  // Remove disconnected users
  // Display "User left" message
  socket.on('leave room', function() {
    display('(they left...)');
  });
}

// Display text
function show() {
  removeElements();
  let u = createP();
  u.html(`${otherUser} is typing...`);
}

function display(data) {
  removeElements();
  let p = createP();
  p.html(data);
}

function inputChanged() {
  // let typing = ' is typing...';
  // console.log(typing);
  socket.emit('istyping');
}

// Listen for line breaks to clear input field
function keyPressedInput() {
  if (keyCode == ENTER) {
    console.log(input.value());
    gibber(input.value());
    input.value('');
  }
}


function keyPressed() {
  if (keyCode == UP_ARROW) {
    // console.log('my username: ' + username.value());
    let myUsername = username.value();
    socket.emit('username', myUsername);
  } else if (keyCode == ENTER) {
    console.log(input.value());
    gibber(input.value());
    input.value('');
  }
}

function gibber() {
  let ogMessage = input.value();
  console.log('ogMessage: ' + input.value());
  let newMessage = randomizeMessage(ogMessage);
  console.log('newMessage: ' + newMessage);
  socket.emit('text', newMessage);
  console.log('message sent!');
}

function randomizeMessage(x) {
  //make the string into an characters
  let array = x.split('');

  //random number of characters to replace
  let randomNum = Math.round(0.22 * array.length);
  console.log("random num is " + randomNum);

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