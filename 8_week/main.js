function initMap(pos) {
  let position = pos;
  console.log(position);
  const map = new google.maps.Map(document.getElementById('map'), {
    center: position,
    zoom: 15
  });

  const marker = new google.maps.Marker({position: position, map: map});  

  message(position);
}

function getUserPos(){
  let pos;
  // Get user's location
  if ('geolocation' in navigator) {
    console.log("geo allowed");
    navigator.geolocation.getCurrentPosition(successFunc, errorFunc);

    function successFunc(currentPosition){
        console.log("entered success call back")
        pos = {lat: currentPosition.coords.latitude, lng: currentPosition.coords.longitude}
        // console.log(pos)

        if(pos){
          console.log("got pos")
          initMap(pos);
          }
        
        // return(pos);
      }

    function errorFunc(){
      alert(`Error (${err.code}): ${err.message}`);
    } 
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

function message(pos){
  if((40.5<pos.lat) && (pos.lat<40.8) && (-74.1<pos.lng) && (pos.lng<-73.8)){
    document.getElementById('message').innerHTML = "ITP to do:<br><ul><li>async/await <li>pen test quiz <li>classes registration</ul>"
  } else {
    document.getElementById('message').innerHTML = "Home to do:<br><ul><li>get advil <li>do laundry <li>clean desk <li>sleep on time</ul>"
  }
}

//AIzaSyCWHDHLHNSTLseP3JX5MxStDcwjjf4SHHQ