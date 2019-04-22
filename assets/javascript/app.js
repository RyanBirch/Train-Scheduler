// Initialize Firebase
var config = {
  apiKey: "AIzaSyBE7YAbOPWGfvflwyUoQ3FWzJQKyLSoOn0",
  authDomain: "train-scheduler-e9e85.firebaseapp.com",
  databaseURL: "https://train-scheduler-e9e85.firebaseio.com",
  projectId: "train-scheduler-e9e85",
  storageBucket: "train-scheduler-e9e85.appspot.com",
  messagingSenderId: "592072680965"
};
firebase.initializeApp(config);

// initial variables
const database = firebase.database()
let trainName = '', destination = '', firstTrainTime = 0, frequency = 0


// info gets submitted from form
$('#submit').on('click', function() {
  event.preventDefault()

  trainName = $('#train-name').val().trim()
  destination = $('#destination').val().trim()
  firstTrainTime = $('#first-train-time').val().trim()
  frequency = $('#frequency').val().trim()

  // push data to database
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency
  })

  // clear form fields
  trainName = $('#train-name').val('')
  destination = $('#destination').val('')
  firstTrainTime = $('#first-train-time').val('')
  frequency = $('#frequency').val('')
})


// data is added to database
database.ref().on('child_added', function(snapshot) {
  let sv = snapshot.val()

  //log the user's data
  console.log(sv.trainName)
  console.log(sv.destination)
  console.log(sv.firstTrainTime)
  console.log(sv.frequency)

  // update the table with new user data
  addToTable(sv)

}, function(errorObject) {
  console.log(`Errors handled: ${errorObject.code}`)
})


// update html
function addToTable(sv) {
  let newRow = $('<tr>').appendTo('tbody')
  let trainName = $(`<td>${sv.trainName}</td>`).appendTo(newRow)
  let destination = $(`<td>${sv.destination}</td>`).appendTo(newRow)
  let firstTrainTime = $(`<td>${sv.firstTrainTime}</td>`).appendTo(newRow)
  let frequency = $(`<td>${sv.frequency}</td>`).appendTo(newRow)
}
