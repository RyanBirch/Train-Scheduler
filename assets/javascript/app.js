// Initialize Firebase
var config = {
  apiKey: "AIzaSyBE7YAbOPWGfvflwyUoQ3FWzJQKyLSoOn0",
  authDomain: "train-scheduler-e9e85.firebaseapp.com",
  databaseURL: "https://train-scheduler-e9e85.firebaseio.com",
  projectId: "train-scheduler-e9e85",
  storageBucket: "train-scheduler-e9e85.appspot.com",
  messagingSenderId: "592072680965"
}
firebase.initializeApp(config)

const database = firebase.database()
var trainName = '', destination = '', firstTrainTime = 0, frequency = 0, nextArrival = 0, minutesAway = 0


// take in user entry and add to database
$('#submit').on('click', function() {
  event.preventDefault()

  // grab user input
  trainName = $('#train-name').val().trim()
  destination = $('#destination').val().trim()
  firstTrainTime = $('#first-train-time').val().trim()
  frequency = $('#frequency').val().trim()

  // call function to find nextArrival and minutesAway
  let result = findNextArrival()
  nextArrival = result[0]
  minutesAway = result[1]

  // push a new node to the database
  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency,
    nextArrival: nextArrival,
    minutesAway: minutesAway
  })

  // clear input fields
  $('#train-name').val('')
  $('#destination').val('')
  $('#first-train-time').val('')
  $('#frequency').val('')
})



// calculate nextArrival and minutesAway
function findNextArrival() {
  let now = moment()
  let currentTime = moment(now).format('hh:mm')
  let firstTrain = moment(firstTrainTime, 'HH:mm')
  // find difference between now and when the first train leaves
  let diff = moment().diff(firstTrain)

  let nextTrain, minutesUntilTrain

  // train hasn't left yet
  if (diff < 0) nextArrival = firstTrainTime
  // train leaves now
  else if (diff === 0) nextArrival = currentTime
  // first train has already left
  else {
    let diffMin = moment(diff).format('mm')
    let remainder = diffMin % frequency
    minutesUntilTrain = frequency  - remainder
    nextTrain = moment().add(minutesUntilTrain, 'minutes')
    nextArrival = moment(nextTrain).format('LT')
  }
  return [nextArrival, minutesUntilTrain]
}



database.ref().on('child_added', function(snapshot) {
  let sv = snapshot.val()

  // add new entry to table
  let newRow = $('<tr>').appendTo('tbody')
  newRow.attr('id', sv.trainName + 'row')

  let trainName = $(`<td>${sv.trainName}</td>`).appendTo(newRow)
  let destination = $(`<td>${sv.destination}</td>`).appendTo(newRow)
  let frequency = $(`<td>${sv.frequency}</td>`).appendTo(newRow)
  let nextArrival = $(`<td>${sv.nextArrival}</td>`).appendTo(newRow)
  nextArrival.attr('id', 'nextArrival')
  let minutesAway = $(`<td>${sv.minutesAway}</td>`).appendTo(newRow)
  minutesAway.attr('id', 'minutesAway')

}, function(errorObject) {
  console.log(`Errors handled: ${errorObject.code}`)
})



// update html live every minute
function updateEveryMinute() {
  var interval = setInterval(function() {
    database.ref().once('value').then(function(snapshot) {
      // loop through nodes in database
      snapshot.forEach(function(childSnapshot) {

        var childKey = childSnapshot.key

        // go another layer deep
        childSnapshot.forEach(function(secondChild) {

          var key = secondChild.key

          // update global variables to values in the current node
          if (key === 'firstTrainTime') firstTrainTime = secondChild.val()
          if (key === 'frequency') frequency = secondChild.val()
          if (key === 'trainName') trainName = secondChild.val()

        })

        // calculate nextArrival for specific entry
        let result = findNextArrival()
        nextArrival = result[0]
        minutesAway = result[1]

        // update database with new arrival time
        database.ref(childKey).update({
          nextArrival: nextArrival,
          minutesAway: minutesAway
        })

        // update html
        $('#' + trainName + 'row').find('#nextArrival').html(nextArrival)
        $('#' + trainName + 'row').find('#minutesAway').html(minutesAway)
      })
    })
  }, 1000 * 60)
}


updateEveryMinute()
