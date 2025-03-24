const admin = require("firebase-admin");
const fs = require("fs");

// Load Firebase credentials
const serviceAccount = require("./smart-home-system-9565d-firebase-adminsdk-fbsvc-b4c97212ef.json"); // Use the correct file name

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smart-home-system-9565d-default-rtdb.firebaseio.com", // Replace with your Firebase DB URL
});

const db = admin.database();

// Function to check EMG value and update devices
async function checkAndUpdateDevices() {
  try {
    const emgSnapshot = await db.ref("emgSensorData/value").once("value");
    const emgValue = emgSnapshot.val();

    if (emgValue === 0) {
      console.log("EMG Sensor is 0, updating devices...");

      const chooseSnapshot = await db.ref("Choose").once("value");
      if (!chooseSnapshot.exists()) {
        console.log("No Choose data found.");
        return;
      }

      const chooseData = chooseSnapshot.val();
      let updates = {};

      for (const key in chooseData) {
        if (chooseData[key] === 1) {
          updates[`device/${key}`] = 0;
        }
      }

      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        console.log("Devices updated successfully.");

        // Update EMG sensor value to 1
        await db.ref("emgSensorData/value").set(1);
        console.log("EMG Sensor value updated to 1.");
      }
    }
  } catch (error) {
    console.error("Error updating devices:", error);
  }
}

// Run the function every 5 seconds
setInterval(checkAndUpdateDevices, 5000);
