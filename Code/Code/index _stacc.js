var gInnbetalinger
var gRenter
var gGebyr
var gTotalt
$(function() {
  /*prevent empty table*/
  getDataFromPost(getDataFromForm())
})
var data_Default = JSON.stringify({
  laanebelop: 2000000,
  nominellRente: 3,
  terminGebyr: 30,
  utlopsDato: "2045-01-01",
  saldoDato: "2020-01-01",
  datoForsteInnbetaling: "2020-02-01",
  ukjentVerdi: "TERMINBELOP"
})


$('#bnt_soklan').click(function() {
  console.log('getting data from post')
  getDataFromPost(getDataFromForm())
})


function getDataFromForm() {
  var vBelop = $('#input_lanebelop').val()
  var vNedbetalingstid = $('#input_nedbetalingstid').val()
  var vRente = $('#input_rente').val()
  var vAvdragsfrihet = $('#input_avdragsfrihet').val()
  var currDate = new Date().toISOString().slice(0, 10);

  vNedbetalingstid = addYearsToCurrentDate(vNedbetalingstid)
  vAvdragsfrihet = addYearsToCurrentDate(vAvdragsfrihet)


  var vData = JSON.stringify({
    laanebelop: vBelop,
    nominellRente: vRente,
    terminGebyr: 30,
    utlopsDato: vNedbetalingstid,
    saldoDato: currDate,
    datoForsteInnbetaling: vAvdragsfrihet,
    ukjentVerdi: "TERMINBELOP"
  })

  return vData
}

function addYearsToCurrentDate(pYear) {
  if (pYear != null) {
    var currDate = new Date().toISOString().slice(0, 10);
    var currYear = new Date().toISOString().slice(0, 4);
    return parseInt(currYear) + parseInt(pYear) + currDate.slice(4, 10)
  } else {
    return new Date().toISOString().slice(0, 10);
  }
}


function getDataFromPost(pData) {
  fetch('https://visningsrom.stacc.com/dd_server_laaneberegning/rest/laaneberegning/v1/nedbetalingsplan', {
      method: 'POST',
      body: pData,
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
    .then(response => response.json())
    .then(function(data) {
      if (data.valideringsfeilmeldinger != null) {
        alert(data.valideringsfeilmeldinger.feilmelding)
      } else {
        console.log(data)
        resetTotals()
        iterateOverData(data.nedbetalingsplan.innbetalinger)
        updatePaymentsOverview(data.nedbetalingsplan.innbetalinger)
        updatePieGraph()
        updateBreakdown()
      }
    })
    .catch(function(error) {
      console.log(error)
    });
}

function resetTotals(){
    gInnbetalinger = 0;
    gRenter = 0;
    gGebyr = 0;
    gTotalt = 0;
}


function iterateOverData(pData) {
  $('#table_detaljertOversikt tbody').children().remove()
  /*for each element in array, create a new row and append this to table*/
  for (const element of pData) {
    insertRow(element);
    addToTotals(element)
  }
}


/*only pass the data that is necessary to creat a single row, then return this*/
function insertRow(pData) {
  var newRow = '<tr role="row"><td>' + pData.dato + '</td><td class="number">' + financial(pData.innbetaling) + '</td><td>' + financial(pData.renter) + '</td><td>' + financial(pData.gebyr) + '</td><td>' + financial(pData.total) + '</td><td>' + financial(pData.restgjeld) + '</td>'
  $('#table_detaljertOversikt tbody').append(newRow)
}

function updatePaymentsOverview(pData) {
  $('#belop_Forste').html(financial(pData[1].total) + ',-')
  $('#belop_Deretter').html(financial(pData[2].total) + ',-')
}

 

function updatePieGraph(){
    var label_innbetalinger = 'Innbetalinger ' + financial(gInnbetalinger).toString()
    var label_renter = 'Renter ' + financial(gRenter).toString()
    var label_gebyr = 'Gebyr ' + financial(gGebyr).toString()
    var label_totalt = 'Totalt ' + financial(gTotalt).toString()
  
  
    var data = {
      labels: [label_innbetalinger, label_renter, label_gebyr],
      series: [gInnbetalinger, gRenter, gGebyr]
    };
  
    var options = {
      labelInterpolationFnc: function(value) {
        return value[0]
      }
    };
  
    var responsiveOptions = [
      ['screen and (min-width: 640px)', {
        chartPadding: 30,
        labelOffset: 100,
        labelDirection: 'implode',
        labelInterpolationFnc: function(value) {
          return value;
        }
      }],
      ['screen and (min-width: 1024px)', {
        labelOffset: 80,
        chartPadding: 20
      }]
    ];
  
    new Chartist.Pie('.ct-chart', data, options, responsiveOptions);
}

function updateBreakdown(){
    $('#sum_lanebelop').html(financial(gInnbetalinger))
    $('#sum_gebyrer').html(' + '+financial(gGebyr))
    $('#sum_renter').html(' + '+financial(gRenter))
    $('#sum_totaleInnbetalinger').html(' = '+financial(gTotalt))
 }

function addToTotals(pData) {
  gInnbetalinger += pData.innbetaling
  gRenter += pData.renter
  gGebyr += pData.gebyr
  gTotalt += pData.total
}


/*Helper */
function financial(x) {
  return Math.ceil(x);
}
