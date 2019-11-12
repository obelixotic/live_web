var socket = io.connect();
var data;

socket.on('connect', function() {
  console.log("Connected");
});

async function initMap() {
    console.log("initializing geo process");

    let currentPosition = await getCoordinates();
    console.log("got position:");

    let position = {lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude}
    console.log(position);

    await renderMap(position);    
    message(position);
}

function getCoordinates() {
  console.log("getting position");
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function renderMap(pos){
  console.log("rendering map")
  let position = pos;
  const map = new google.maps.Map(document.getElementById('map'), {
      center: position,
      zoom: 15
  });

  const marker = new google.maps.Marker({position: position, map: map});  
  console.log("done");
};

// function message(pos){
//   if((40.692740-0.001)<pos.lat && pos.lat<(40.692740+0.001) && (-73.987430-0.001)<pos.lng && pos.lng<(-73.987430+0.001)){
//     console.log("showing ITP to-do list");
//     document.getElementById('message').innerHTML = "ITP to do:<br><ul><li>async/await <li>pen test quiz <li>classes registration</ul>"
//   } else {
//     console.log("showing Home list");
//     document.getElementById('message').innerHTML = "Home to do:<br><ul><li>get advil <li>do laundry <li>clean desk <li>sleep on time</ul>"
//   }
// }

async function message(pos){
  // console.log("message func entered");
  if((40.692740-0.001)<pos.lat && pos.lat<(40.692740+0.001) && (-73.987430-0.001)<pos.lng && pos.lng<(-73.987430+0.001)){
    console.log("getting itp list")
    let list = await getList_itp();
    console.log("got list: ");
    console.log(list);
    document.getElementById('message').innerHTML = "ITP to do:<br><ul>"
    for (var i = 0; i < list.length; i++) {
      document.getElementById('message').innerHTML += "<li>" + list[i].item + "<br>";
    }
  } else {
    let list = await getList_home();
    console.log("got list: ");
    console.log(list);
    document.getElementById('message').innerHTML = "Home to do:<br><ul>"
    for (var i = 0; i < list.length; i++) {
      document.getElementById('message').innerHTML += "<li>" + list[i].item + "<br>";
    }

  }
}

function getList_itp() {
  console.log("fetching itp list");
  socket.emit('history_itp', null);
  return new Promise((resolve, reject) => {
    socket.on('showList', resolve)
      // console.log(resolve);  
  });
}

function getList_home() {
  console.log("fetching home list");
  socket.emit('history_home', null);
  return new Promise((resolve, reject) => {
    socket.on('showList', resolve)
      // console.log(resolve);  
  });
}