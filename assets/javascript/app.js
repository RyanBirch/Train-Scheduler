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


$('#submit').on('click', function() {
  event.preventDefault()

  trainName = $('#train-name').val().trim()
  destination = $('#destination').val().trim()
  firstTrainTime = $('#first-train-time').val().trim()
  frequency = $('#frequency').val().trim()

  let result = findNextArrival()
  nextArrival = result[0]
  minutesAway = result[1]

  database.ref().push({
    trainName: trainName,
    destination: destination,
    firstTrainTime: firstTrainTime,
    frequency: frequency,
    nextArrival: nextArrival,
    minutesAway: minutesAway
  })

  $('#train-name').val('')
  $('#destination').val('')
  $('#first-train-time').val('')
  $('#frequency').val('')
})


function findNextArrival() {
  let now = moment()
  let currentTime = moment(now).format('hh:mm')
  let firstTrain = moment(firstTrainTime, 'HH:mm')
  let diff = moment().diff(firstTrain)

  let nextTrain, minutesUntilTrain

  console.log(`diff: ${diff}`)

  // train hasn't left yet
  if (diff < 0) nextArrival = firstTrainTime
  // train leaves now
  else if (diff === 0) nextArrival = currentTime
  // first train has already left
  else {
    let diffMin = moment(diff).format('mm')
    console.log('diffMin: ' + diffMin)
    let remainder = diffMin % frequency
    minutesUntilTrain = frequency  - remainder
    console.log(`firstTrainTime: ${firstTrainTime}`)
    console.log(`minutesUntilTrain: ${minutesUntilTrain}`)
    console.log(`frequency: ${frequency}`)
    nextTrain = moment().add(minutesUntilTrain, 'minutes')
    nextArrival = moment(nextTrain).format('LT')
    console.log(`nextArrival: ${nextArrival}`)
  }
  return [nextArrival, minutesUntilTrain]
}


database.ref().on('child_added', function(snapshot) {
  let sv = snapshot.val()

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


function updateEveryMinute() {
  var interval = setInterval(function() {
    database.ref().once('value').then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {

        var childKey = childSnapshot.key
        console.log('child key: ' + childKey)

        childSnapshot.forEach(function(secondChild) {

          var key = secondChild.key
          console.log('second child key: ' + key)

          if (key === 'firstTrainTime') firstTrainTime = secondChild.val()
          if (key === 'frequency') frequency = secondChild.val()
          console.log('ftt: ' + firstTrainTime, 'frq: ' + frequency)

        })

        let result = findNextArrival()
        nextArrival = result[0]
        minutesAway = result[1]
        console.log('nextArrival: ' + nextArrival)
        console.log('minutesAway: ' + minutesAway)

        database.ref(childKey).update({
          nextArrival: nextArrival,
          minutesAway: minutesAway
        })

        //$(`${this.trainName}`).find()
      })
    })
  }, 1000 * 3)
}

updateEveryMinute()
