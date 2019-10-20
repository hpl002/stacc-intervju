var gCurrEndpoint='https://visningsrom.stacc.com/dd_server_laaneberegning/rest/laaneberegning/v1/nedbetalingsplan';

var Totals = {
  Innbetalinger: 0,
  Renter: 0,
  Gebyr: 0,
  Totalt: 0,
}

var DownpaymentGraph = {
  series: [
    [],
    []
  ],
  labels: [
    [],
    []
  ],
}

var data_Default = JSON.stringify({
  laanebelop: 2000000,
  nominellRente: 3,
  terminGebyr: 30,
  utlopsDato: "2045-01-01",
  saldoDato: "2020-01-01",
  datoForsteInnbetaling: "2020-02-01",
  ukjentVerdi: "TERMINBELOP"
})


$(function() {
  getDataFromPost(getDataFromForm())
})

/*Events*/
$('#bnt_soklan').click(function() {
  console.log('getting data from post')
  getDataFromPost(getDataFromForm())
})

 $('#dropdown_stacc').click(function(){
  gCurrEndpoint='https://visningsrom.stacc.com/dd_server_laaneberegning/rest/laaneberegning/v1/nedbetalingsplan'
})

$('#dropdown_local').click(function(){
  gCurrEndpoint='http://secret-tundra-48693.herokuapp.com/api'
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

function getDataFromPost(pData) {

  console.log('utilizing endpoint:', gCurrEndpoint)
  console.log('JSON body:', pData)
  fetch(gCurrEndpoint, {
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
        resetData()
        iterateOverData(data.nedbetalingsplan.innbetalinger)
        updatePaymentsOverview(data.nedbetalingsplan.innbetalinger)
        updateDownpaymentGraph()
        updatePieGraph()
        updateBreakdown()
      }
    })
    .catch(function(error) {
      console.log(error)
    });
}

function resetData() {
  Totals.Innbetalinger = 0;
  Totals.Renter = 0;
  Totals.Gebyr = 0;
  Totals.Totalt = 0;

  DownpaymentGraph.labels = [
    [],
    []
  ]
  DownpaymentGraph.series = [
    [],
    []
  ]
}

function iterateOverData(pData) {
  $('#table_detaljertOversikt tbody').children().remove()
  /*for each element in array, create a new row and append this to table*/
  for (const element of pData) {
    insertRow(element);
    addToTotals(element)
    createLabelAndSeries(element, JSON.parse(getDataFromForm()))
  }
}

function createLabelAndSeries(pData, pJSONBody) {
  /*for every new year, push */
  if (!DownpaymentGraph.labels[0].includes(pData.dato.slice(0, 4))) {
    DownpaymentGraph.labels[0].push(pData.dato.slice(0, 4))
    DownpaymentGraph.series[0].push(pJSONBody.laanebelop - financial(pData.restgjeld))
    DownpaymentGraph.series[1].push(financial(pData.restgjeld))
  }
}

/*only pass the data that is necessary to creat a single row, then return this*/
function insertRow(pData) {
  var newRow = '<tr role="row"><td>' + pData.dato + '</td><td class="number">' + financial_format(pData.innbetaling) + '</td><td>' + financial_format(pData.renter) + '</td><td>' + financial_format(pData.gebyr) + '</td><td>' + financial_format(pData.total) + '</td><td>' + financial_format(pData.restgjeld) + '</td>'
  $('#table_detaljertOversikt tbody').append(newRow)
}

function updatePaymentsOverview(pData) {
  $('#belop_Forste').html(financial_format(pData[1].total))
  $('#belop_Deretter').html(financial_format(pData[2].total))
}

function updateDownpaymentGraph() {
  var chart = new Chartist.Line('#chart_downpayment', {
    labels: DownpaymentGraph.labels[0],
    series: [DownpaymentGraph.series[0], DownpaymentGraph.series[1]]
  }, {
    low: 0,
    showArea: true,
    showPoint: false,
    fullWidth: true,
    chartPadding: 30,
    labelOffset: 50,
    axisY: {
      labelInterpolationFnc: function(value, index) {
        return value
      },
      stretch: true
    }
  });

  chart.on('draw', function(data) {
    if (data.type === 'line' || data.type === 'area') {
      data.element.animate({
        d: {
          begin: 2000 * data.index,
          dur: 2000,
          from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
          to: data.path.clone().stringify(),
          easing: Chartist.Svg.Easing.easeOutQuint
        }
      });
    }
  });

}

function updatePieGraph() {
  var label_innbetalinger = 'Lånebeløp ' + financial_format(Totals.Innbetalinger).toString()
  var label_renter = 'Renter ' + financial_format(Totals.Renter).toString()
  var label_gebyr = 'Gebyr ' + financial_format(Totals.Gebyr).toString()
  var label_totalt = 'Totalt ' + financial_format(Totals.Totalt).toString()


  var data = {
    labels: [label_innbetalinger, label_renter, label_gebyr],
    series: [Totals.Innbetalinger, Totals.Renter, Totals.Gebyr]
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

  new Chartist.Pie('#chart_pie', data, options, responsiveOptions);
}

function updateBreakdown() {
  $('#sum_lanebelop').html(financial_format(Totals.Innbetalinger))
  $('#sum_gebyrer').html(' + ' + financial_format(Totals.Gebyr))
  $('#sum_renter').html(' + ' + financial_format(Totals.Renter))
  $('#sum_totaleInnbetalinger').html(' = ' + financial_format(Totals.Totalt))
}

function addToTotals(pData) {
  Totals.Innbetalinger += pData.innbetaling
  Totals.Renter += pData.renter
  Totals.Gebyr += pData.gebyr
  Totals.Totalt += pData.total
}


/*Helper */
function financial(x) {
  return Math.ceil(x);
}

function financial_format(x) {
  return numeral(financial(x)).format('0,0').replace(/[ ,.]/g, " ") + ' ,-';
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





  