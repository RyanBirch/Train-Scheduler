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

const database = firebase.database()
let trainName = '', destination = '', firstTrainTime = 0, frequency = 0, nextArrival = 0, minutesAway = 0


$('#submit').on('click', function() {
  event.preventDefault()

  trainName = $('#train-name').val().trim()
  destination = $('#destination').val().trim()
  firstTrainTime = $('#first-train-time').val().trim()
  frequency = $('#frequency').val().trim()

  nextArrival = findNextArrival()
  minutesAway = findMinutesAway()

  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency,
    nextArrival: nextArrival,
    minutesAway: minutesAway
  })

  trainName = $('#train-name').val('')
  destination = $('#destination').val('')
  firstTrainTime = $('#first-train-time').val('')
  frequency = $('#frequency').val('')
})


function findNextArrival() {

}


function findMinutesAway() {

}


database.ref().on('child_added', function(snapshot) {
  let sv = snapshot.val()

  console.log(sv.trainName)
  console.log(sv.destination)
  console.log(sv.firstTrainTime)
  console.log(sv.frequency)
  console.log(sv.nextArrival)
  console.log(sv.minutesAway)

  addToTable(sv)

}, function(errorObject) {
  console.log(`Errors handled: ${errorObject.code}`)
})


function addToTable(sv) {
  let newRow = $('<tr>').appendTo('tbody')

  let trainName = $(`<td>${sv.trainName}</td>`).appendTo(newRow)
  let destination = $(`<td>${sv.destination}</td>`).appendTo(newRow)
  let frequency = $(`<td>${sv.frequency}</td>`).appendTo(newRow)
  let nextArrival = $(`<td>${sv.nextArrival}</td>`).appendTo(newRow)
  let minutesAway = $(`<td>${sv.minutesAway}</td>`).appendTo(newRow)
}
