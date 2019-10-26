var audio = new Audio('phone_message.wav');
var callinprogress = false;
var socket = io.connect();
var partner_peer_id = null;
var peer_id = null;
var peer = new Peer({
  host: 'liveweb-new.itp.io',
  port: 9000,
  path: '/'
});
var n;
var call1 = null;
var call2 = null;
var call3 = null;
var screenBeingShared = false;

socket.on('connect', function() {
  console.log("Connected");
});

socket.on('tring', function() {
  audio.play();
  setInterval(function() {
    if (!callinprogress) {
      audio.play();
      console.log("incoming!");
    }
  }, 3000);
  document.getElementById('call_button').style.display = "none";
  document.getElementById('answer_button').style.display = "inline";
});

socket.on('answered', function() {
  console.log("user answered, starting audio stream");
  audioShare();
  document.getElementById("screen_button").style.display = "inline";
  document.getElementById("audio_button").style.display = "inline";
  document.getElementById("video_button").style.display = "inline";
  document.getElementById("close_button").style.display = "inline";
  document.getElementById("start_button").style.display = "none";
  document.getElementById("stop_button").style.display = "none";
  document.getElementById("call_button").style.display = "none";
});

socket.on('position', function(pos) {
  let m = document.getElementById("mouse");
  m.style.display = "inline";
  if (m.src != "mouse.png") {
    m.src = "mouse.png";
  }
  m.style.top = pos.y - 50 + 'px';
  m.style.left = pos.x - 50 + 'px';
});

socket.on('stopMouse', function() {
  document.getElementById("mouse").style.display = "none";
});

socket.on('message', function(data) {
  console.log("Got: " + data);
  let m = document.createElement('div');
  m.setAttribute("class", "otherMessages");
  m.innerHTML += data + "<br>";
  document.getElementById('messages').appendChild(m);
  // document.getElementById('messages').innerHTML += data + "<br>";
});

socket.on('screenShare', function() {
  screenShare2(partner_peer_id);
  // console.log('recd screen share socket event');
});

socket.on('audioShare', function() {
  audioShare2(partner_peer_id);
  // console.log("Sharing audio in response");
  document.getElementById("screen_button").style.display = "inline";
  document.getElementById("audio_button").style.display = "inline";
  document.getElementById("video_button").style.display = "inline";
  document.getElementById("close_button").style.display = "inline";
  // document.getElementById("start_button").style.display = "inline";
});

socket.on('videoShare', function() {
  videoShare2(partner_peer_id);
  // console.log("Sharing video in response");
});

socket.on('closeStream', function() {
  closeStream2();
  // console.log("Closing video in response");
});

socket.on('peer_ids', function(data) {
  console.log(data);
  if (peer_id == data[data.length - 1]) {
    partner_peer_id = data[data.length - 2]
  } else {
    partner_peer_id = data[data.length - 1]
  }
  console.log("partner peer id: " + partner_peer_id);
});

let peer_stream = null; //peer.on('call', ()=>{})
let my_stream1 = null; //screen
let my_stream2 = null; //audio
let my_stream3 = null; //video

let constraints1 = { //screen
  audio: false,
  video: true
}

let constraints2 = { //audio
  audio: true,
  video: false
}

let constraints3 = { //video
  audio: false,
  video: true
}

window.addEventListener('load', function() {
  navigator.mediaDevices.getDisplayMedia(constraints1).then(function(stream1) {
      var videoElement1 = document.getElementById('myscreen');
      videoElement1.srcObject = stream1;
      my_stream1 = stream1;
    })
    .catch(function(err) {
      alert(err);
    });

  navigator.mediaDevices.getUserMedia(constraints2).then(function(stream2) {
      var videoElement2 = document.getElementById('myaudio');
      videoElement2.srcObject = stream2;
      my_stream2 = stream2;
    })
    .catch(function(err) {
      alert(err);
    });

  navigator.mediaDevices.getUserMedia(constraints3).then(function(stream3) {
      var videoElement3 = document.getElementById('myvideo');
      videoElement3.srcObject = stream3;
      my_stream3 = stream3;
    })
    .catch(function(err) {
      alert(err);
    });
  let t = document.getElementById("message");
  t.addEventListener('keypress', function(e) {
    if (e.keyCode == 13) {
      sendmessage();
      t.value = "";
    }
  });
});

// Get an ID from the PeerJS server
peer.on('open', function(id) {
  console.log('My peer ID is: ' + id);
  peer_id = id;
  socket.emit('peer_id', peer_id)
});

peer.on('error', function(err) {
  console.log(err);
});

peer.on('call', function(incoming_call) {
  incoming_call.answer(peer_stream);
});

peer.on('close', function() {
  console.log("close!!!");
});

// var sendmessage = function() {
//   var message = document.getElementById('message').value;
//   console.log("Sending: " + message);
//   document.getElementById('messages').innerHTML += message + "<br>";
//   socket.send(message);
// };

var sendmessage = function() {
  var message = document.getElementById('message').value;
  console.log("Sending: " + message);
  let m = document.createElement('div');
  m.setAttribute("class", "myMessages");
  m.innerHTML += message + "<br>";
  document.getElementById('messages').appendChild(m);
  let t = document.getElementById("message");
  t.value = "";
  // document.getElementById('messages').innerHTML += message + "<br>";
  socket.send(message);
};

function screenShare(id) {
  peer_stream = my_stream1;
  socket.emit('screenShare');
  document.getElementById("video_button").disabled = true;
  document.getElementById("screen_button").disabled = true;
  document.getElementById("start_button").style.display = "none";
  call1 = peer.call(partner_peer_id, my_stream1);
  call1.on('stream', function(remoteStream) {
    // document.getElementById("messages").style.visibility = "hidden";
    // document.getElementById("chatbox").style.visibility = "hidden";
    // console.log("c");
  });
  screenBeingShared = true;
}

function audioShare(id) {
  peer_stream = my_stream2;
  socket.emit('audioShare');
  let e = document.getElementById("remoteAudio");
  document.getElementById("audio_button").disabled = true;
  // document.getElementById("audio_button").disabled = true;
  document.getElementById("call_button").disabled = true;
  // if (!screenBeingShared) {
  // 	document.getElementById("video_button").disabled = false;
  // }
  document.getElementById("close_button").disabled = false;
  console.log("sharing audio with peer");
  call2 = peer.call(partner_peer_id, my_stream2);
  call2.on('stream', function(remoteStream) {
    console.log("Got remote stream");
    if (!e) {
      var audioVideoElement = document.createElement('video');
      audioVideoElement.srcObject = remoteStream;
      audioVideoElement.id = "remoteAudio";
      audioVideoElement.setAttribute("autoplay", "true");
      audioVideoElement.play();
      document.body.appendChild(audioVideoElement);
    }
  });
}

function videoShare(id) {
  peer_stream = my_stream3;
  socket.emit('videoShare');
  let e = document.getElementById("remoteVideo");
  document.getElementById("video_button").disabled = true;
  document.getElementById("screen_button").disabled = true;
  document.getElementById("start_button").style.display = "none";
  console.log("sharing video with peer");
  call3 = peer.call(partner_peer_id, my_stream3);
  call3.on('stream', function(remoteStream) {
    console.log("Got remote stream");
    if (!e) {
      var videoVideoElement = document.createElement('video');
      let div = document.getElementById("mediadiv");
      videoVideoElement.srcObject = remoteStream;
      videoVideoElement.id = "remoteVideo";
      videoVideoElement.setAttribute("autoplay", "true");
      videoVideoElement.play();
      div.appendChild(videoVideoElement);
      // document.body.appendChild(videoVideoElement);
    }
  });
  stopMouseShare();
  let myvid = document.getElementById("myvideo");
  myvid.style.display = "inline";
  myvid.srcObject = peer_stream;
  myvid.setAttribute("autoplay", "true");
  myvid.play();
}

function closeStream() {
  peer_stream = null;
  socket.emit('closeStream');
  if (call1) {
    call1.close();
    call1 = null;
    let r = document.getElementById("remoteScreen");
    if (r) {
      r.parentNode.removeChild(r);
    }
  }
  if (call2) {
    call2.close();
    call2 = null;
    let r = document.getElementById("remoteAudio");
    r.parentNode.removeChild(r);
  }
  if (call3) {
    call3.close();
    call3 = null;
    let r = document.getElementById("remoteVideo");
    r.parentNode.removeChild(r);
    let m = document.getElementById("myvideo");
    m.style.display = "none";
  }
  document.getElementById("screen_button").disabled = false;
  document.getElementById("audio_button").disabled = false;
  document.getElementById("video_button").disabled = false;
  document.getElementById("start_button").style.display = "none";
  document.getElementById("stop_button").style.display = "none";
  document.getElementById("messages").style.visibility = "visible";
  document.getElementById("chatbox").style.visibility = "visible";
  console.log("closing stream");
  screenBeingShared = false;
  stopMouseShare();
}

function screenShare2(id) {
  peer_stream = my_stream1;
  document.getElementById("video_button").disabled = true;
  document.getElementById("screen_button").disabled = true;
  call1 = peer.call(partner_peer_id, my_stream1);
  call1.on('stream', function(remoteStream) {
    let e = document.getElementById("remoteScreen");
    if (!e) {
      var screenVideoElement = document.createElement('video');
      let div = document.getElementById("mediadiv");
      screenVideoElement.srcObject = remoteStream;
      screenVideoElement.id = "remoteScreen";
      screenVideoElement.setAttribute("autoplay", "true");
      screenVideoElement.play();
      div.appendChild(screenVideoElement);
      // document.body.appendChild(screenVideoElement);
    }
    document.getElementById("start_button").style.display = "inline";
    document.getElementById("messages").style.visibility = "hidden";
    document.getElementById("chatbox").style.visibility = "hidden";
  });
  screenBeingShared = true;
}

function audioShare2(id) {
  peer_stream = my_stream2;
  let e = document.getElementById("remoteAudio");
  document.getElementById("audio_button").disabled = true;
  // if (!screenBeingShared) {
  // 	document.getElementById("video_button").disabled = false;
  // }
  document.getElementById("close_button").disabled = false;
  call2 = peer.call(partner_peer_id, my_stream2);
  call2.on('stream', function(remoteStream) {
    console.log("Got remote stream");
    if (!e) {
      var audioVideoElement = document.createElement('video');
      audioVideoElement.srcObject = remoteStream;
      audioVideoElement.id = "remoteAudio";
      audioVideoElement.setAttribute("autoplay", "true");
      audioVideoElement.play();
      document.body.appendChild(audioVideoElement);
    }
  });
  console.log("Sharing audio in response");
}

function videoShare2(id) {
  peer_stream = my_stream3;
  let e = document.getElementById("remoteVideo");
  document.getElementById("video_button").disabled = true;
  document.getElementById("screen_button").disabled = true;
  document.getElementById("start_button").style.display = "none";
  console.log("sharing video with peer");
  call3 = peer.call(partner_peer_id, my_stream3);
  call3.on('stream', function(remoteStream) {
    console.log("Got remote stream");
    if (!e) {
      var videoVideoElement = document.createElement('video');
      let div = document.getElementById("mediadiv");
      videoVideoElement.srcObject = remoteStream;
      videoVideoElement.id = "remoteVideo";
      videoVideoElement.setAttribute("autoplay", "true");
      videoVideoElement.play();
      div.appendChild(videoVideoElement);
      // document.body.appendChild(videoVideoElement);
    }
  });
  stopMouseShare();
  console.log("Sharing video in response");
  let myvid = document.getElementById("myvideo");
  myvid.style.display = "inline";
  myvid.srcObject = peer_stream;
  myvid.setAttribute("autoplay", "true");
  myvid.play();
}

function closeStream2() {
  peer_stream = null;
  if (call1) {
    call1.close();
    call1 = null;
    let r = document.getElementById("remoteScreen");
    if (r) {
      r.parentNode.removeChild(r);
    }
  }
  if (call2) {
    call2.close();
    call2 = null;
    let r = document.getElementById("remoteAudio");
    r.parentNode.removeChild(r);
  }
  if (call3) {
    call3.close();
    call3 = null;
    let r = document.getElementById("remoteVideo");
    r.parentNode.removeChild(r);
    let m = document.getElementById("myvideo");
    m.style.display = "none";
  }
  document.getElementById("screen_button").disabled = false;
  document.getElementById("audio_button").disabled = false;
  document.getElementById("video_button").disabled = false;
  document.getElementById("start_button").style.display = "none";
  document.getElementById("messages").style.visibility = "visible";
  document.getElementById("chatbox").style.visibility = "visible";
  console.log("Closing stream in response");
  screenBeingShared = false;
  stopMouseShare();
}

function makeCall() {
  socket.emit('tring', function(e) {});
  document.getElementById('call_button').value = "calling";
  document.getElementById('call_button').disabled = true;
}

function answerCall() {
  console.log("answering call");
  callinprogress = true;
  audio.pause();
  socket.emit('answered', function(e) {});
  document.getElementById("audio_button").disabled = false;
  document.getElementById("start_button").style.display = "none";
  document.getElementById("answer_button").style.display = "none";
}

var startMouseShare = function() {
  window.addEventListener('mousemove', mousePosition);
  console.log("start");
  document.getElementById("remoteScreen").style.cursor = "none";
  document.getElementById("start_button").style.display = "none";
  document.getElementById("stop_button").style.display = "inline";
}

var stopMouseShare = function() {
  window.removeEventListener('mousemove', mousePosition);
  console.log("stop");
  socket.emit('stopMouse');
  document.getElementById("remoteScreen").style.cursor = "auto";
  if (screenBeingShared) {
    document.getElementById("start_button").style.display = "inline";
  }
  document.getElementById("stop_button").style.display = "none";
}

function mousePosition(e) {
  console.log("sending mouse position");
  let pos = {
    x: e.pageX,
    y: e.pageY
  };
  socket.emit('position', pos);
}