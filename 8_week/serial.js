var SerialPort require('serialPort');

var serialPort = new SerialPort("dev/cu.usbmodem1421", {
  baudRate: 9600
});

serialPort.on("open", function() {

  serialPort.on("data", function() {
    console.log(data);
  });

  serialPort.on("close", function() {

  });
});