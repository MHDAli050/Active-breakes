const mongoose = require('mongoose');
const { Readable } = require('stream');
//const { MongoClient } = require('mongodb');
const mqtt = require('mqtt');
const catchAsync = require('../utiles/catchAsync');
const Event = require('../Model/eventModel');
const AppError = require('../utiles/AppError');

const client = mqtt.connect('mqtt://127.0.0.1');
//console.log(client); // Change the URL to match your MQTT broker
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  const topic = 'esp/esp1/control'; // Replace <topic> with the actual topic
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log('Subscribed to topic:', topic);
    }
  });
});

// Function to send a value to a specific ESP8266
function sendValueToDevice(deviceId, value) {
  const topic = `esp/${deviceId}/control`; // Generate the topic based on device ID

  client.publish(topic, value.toString());
}

// Example usage: Send the value '90' to ESP8266 with device ID 'esp1'
//sendValueToDevice('esp-84:F3:EB:31:94:EE', 0);

exports.updateRating = catchAsync(async (req, res, next) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Create a custom SSE stream
  const eventStream = new Readable({
    read() {},
  });
  //const currentEvent = await Event.findById(req.params.id);
  // Function to send SSE events to client
  const sendSSE = (data) => {
    eventStream.push(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Listen for changes at Averagesrating in the document collection and push it in the AveratingsList
  Event.watch({ $match: { _id: mongoose.Types.ObjectId(req.params.id) } }).on(
    'change',
    async (change) => {
      if (
        change.operationType === 'update' &&
        change.updateDescription.updatedFields.ratingsAverage
      ) {
        const { ratingsAverage } = change.updateDescription.updatedFields;
        const currentEvent = await Event.findById(req.params.id);
        const currentAveList = currentEvent.AveRatingsList.slice();
        currentAveList.push(ratingsAverage);
        //currentEvent.AveRatingsList = currentAveList.slice();
        const doc = await Event.findByIdAndUpdate(
          req.params.id,
          { AveRatingsList: currentAveList },
          {
            new: true,
            runValidators: true,
          }
        );
        if (!doc) {
          return next(new AppError('There is no Document with this Id', 404));
        }
        const ServoValue = (ratingsAverage * 180) / 5;
        //console.log(ServoValue);
        console.log(currentEvent.AveRatingsList);
        sendValueToDevice('esp-84:F3:EB:31:94:EE', ServoValue);
        // Send change event to client
        sendSSE(doc);
      }
    }
  );

  // Pipe SSE events to the response
  eventStream.pipe(res);

  // Handle client disconnect
  req.on('close', () => {
    eventStream.destroy();
    console.log('SSE Stream  is closed');
  });
});
