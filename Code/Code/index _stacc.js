var data_Default = JSON.stringify({
    laanebelop: 2000000,
    nominellRente: 3,
    terminGebyr: 30,
    utlopsDato: "2045-01-01",
    saldoDato: "2020-01-01",
    datoForsteInnbetaling: "2020-02-01",
    ukjentVerdi: "TERMINBELOP"
})


$('#bnt_soklan').click(function () {
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
        saldoDato: currDate, ¨
        datoForsteInnbetaling: currDate,
        ukjentVerdi: "TERMINBELOP"
    })

    return vData
}

function addYearsToCurrentDate(pYear) {
    if (pYear != null) {
        var currDate = new Date().toISOString().slice(0, 10);
        var currYear = new Date().toISOString().slice(0, 4);
        return parseInt(currYear) + parseInt(pYear) + currDate.slice(4, 10)
    }
    else {
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
        .then(json => console.log(json))
        .then(console.log('here i would break down the actual json file and send it to its respected methods'))
        .catch(function (error) {
            console.log(error)
        });
}

/*only pass the data that is necessary to creat a single row, then return this*/
function createTableRow(pData) {

}