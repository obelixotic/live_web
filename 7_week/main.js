let video;
let canvas;
let context;
let mouseX = 0;
let mouseY = 0;

var chunks = [];
var mediaRecorder;

let socket = io.connect();
socket.on('connect', function() {
  console.log("we're connected!");
});

window.addEventListener('load', function() {
  video = document.getElementById("thevideo");
  canvas = document.getElementById("thecanvas");

  let constraints = {
    audio: false,
    video: true
  };

  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

      mediaRecorder = new MediaRecorder(stream);
      setupMediarecorder();

      video.srcObject = stream;
      video.onloadedmetadata = function(e) {
        video.play();
        setupCanvas();
      };
    })
    // .then(setupMediarecorder)
    .catch(function(error) {
      alert(error);
    });

  window.addEventListener('mousemove', function(e) {
    // console.log(e);
    mouseX = e.clientX;
    mouseY = e.clientY;
    // console.log(mouseX, mouseY);
  });

});

function setupCanvas() {
  context = canvas.getContext("2d");

  // let canvasStream = canvas.captureStream();
  // mediaRecorder = new MediaRecorder(canvasStream);
  // setupMediarecorder();
  drawCanvas();
}

function drawCanvas() {
  //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
  // context.drawImage(video, video.width / 4, video.height / 4, video.width / 4 * 3, video.height / 4 * 3, 0, 0, canvas.width, canvas.height);

  context.drawImage(video, 0, 0, video.width * mouseX / 600, video.height * mouseY / 600, 0, 0, canvas.width, canvas.height);
  var imageData = context.getImageData(0, 0, 600, 400); //try(0,0,300,400)

  for (var i = 0, n = imageData.data.length; i < n; i += 4) {
    let r = imageData.data[i];
    let g = imageData.data[i + 1];
    let b = imageData.data[i + 2];
    let a = imageData.data[i + 3];

    imageData.data[i + 1] = 128;
    imageData.data[i + 2] = r;
    imageData.data[i + 3] = 128;
  }
  context.putImageData(imageData, 0, 0);
  requestAnimationFrame(drawCanvas);
}

window.addEventListener('click', function() {
  let data = canvas.toDataURL("image/jpeg");
  console.log(data);
  socket.emit('imagedata', data);

  mediaRecorder.start();

  // After 2 seconds, stop the MediaRecorder
  setTimeout(function() {
    mediaRecorder.stop();
  }, 5000);

});

function setupMediarecorder() {
  // This is an event listener for the "stop" event on the MediaRecorder
  // Probably should write it:
  // mediaRecorder.addEventListener('stop', function(e) { ... });
  mediaRecorder.onstop = function(e) {
    console.log("stopping recording");

    // Create a new video element on the page
    var video = document.createElement('video');
    video.controls = true;

    // Create a blob - Binary Large Object of type video/webm
    var blob = new Blob(chunks, {
      'type': 'video/webm'
    });
    // Generate a URL for the blob
    var videoURL = window.URL.createObjectURL(blob);
    // Make the video element source point to that URL
    video.src = videoURL;

    // Put the video element on the page
    document.body.appendChild(video);
  };

  // Another callback/event listener - "dataavailable"
  mediaRecorder.ondataavailable = function(e) {
    console.log("starting recording");
    // Whenever data is available from the MediaRecorder put it in the array
    chunks.push(e.data);
  };
}