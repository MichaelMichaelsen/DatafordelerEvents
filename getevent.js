const axios = require('axios');
const moment = require('moment');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'event.csv',
  header: [
    {id: 'ID', title: 'ID'},
    {id: 'ObjektID', title: 'ObjektID'},
    {id: 'BeskedType', title: 'BeskedType'},
    {id: 'RegistreringTid', title: 'RegistreringTid'}
  ]
});
//
// Parse arguments
//
var myArgs = process.argv.slice(2);

var datefrom = (myArgs.length == 1 ? myArgs[0] : moment().subtract(2, 'days').format('YYYY-MM-DD'))
var dateto   = (myArgs.length == 1 ? myArgs[0] : moment().subtract(1, 'days').format('YYYY-MM-DD'))
console.log(datefrom + ' ' + dateto);


let events = [];
var eventurl = `https://services.datafordeler.dk/system/EventMessages/1.0.0/custom?&username=STLCLNICSE&password=Nuga10s..`
// Make a request to get all events associated with the user
axios.get(eventurl,
          {
            params: {
              datefrom: datefrom,
              dateto: dateto,
              pagesize: 100000,
              page: 1,
              format: 'json'
            }
          })
  .then(function (response) {
    let regexp = /^Vandloebsmidte(Create|Update)/;
    // handle success
    //console.log(response);
    var vandloebsmidte = response.data.filter( event => regexp.test(event.Message.Grunddatabesked.Hændelsesbesked.Beskedkuvert.Filtreringsdata.beskedtype))
    // console.log('Total antal events : ', response.data.length);
    // console.log('Vandloebsmidte     : ', vandloebsmidte.length);
    var geodkrequest = [];
    vandloebsmidte.forEach( (event, i) => {
      // console.log( i, '. Id:', event.Message.Grunddatabesked.Hændelsesbesked.Beskedkuvert.Filtreringsdata.Objektregistrering.objektID);
      let objektID         = event.Message.Grunddatabesked.Hændelsesbesked.Beskedkuvert.Filtreringsdata.Objektregistrering[0].objektID;
      let beskedtype       = event.Message.Grunddatabesked.Hændelsesbesked.Beskedkuvert.Filtreringsdata.beskedtype;
      let registreringstid = event.Message.Grunddatabesked.Hændelsesbesked.Beskedkuvert.Filtreringsdata.Objektregistrering[0].registreringstid;
      let row = {
        ID: i,
        ObjektID: objektID,
        BeskedType: beskedtype,
        RegistreringTid: registreringstid
      }
      events.push(row);
      // console.log( `${i},${objektID},${beskedtype},${registreringstid}`);

    });
    csvWriter
      .writeRecords(events)
      .then(()=> console.log('The CSV file was written successfully'));
    // console.log('Number of promises:', geodkrequest.length);
    // let objektID = vandloebsmidte[0].Message.Grunddatabesked.Hændelsesbesked.Beskedkuvert.Filtreringsdata.Objektregistrering[0].objektID;
    // objektID = 1210801039;
    // let geodkvektorurl = `https://services.datafordeler.dk/GeoDanmarkVektor/GeoDanmark60_NOHIST_GML3/1.0.0/WFS?username=ONCVAXSNFU&password=Nuga10s..&service=WFS&version=2.0.0&request=GetFeature&typenames=gdk60:Vandloebsmidte&namespaces=xmlns(gdk60,http://data.gov.dk/schemas/geodanmark60/2/gml3),xmlns(gml,http://www.opengis.net/gml/3.2),xmlns(fes,http://www.opengis.net/fes/2.0)&filter=<fes:Filter><fes:And><fes:PropertyIsEqualTo><fes:ValueReference>gdk60:id.namespace</fes:ValueReference><fes:Literal>http://data.gov.dk/geodanmark</fes:Literal></fes:PropertyIsEqualTo><fes:PropertyIsEqualTo><fes:ValueReference>gdk60:id.lokalId</fes:ValueReference><fes:Literal>${objektID}</fes:Literal></fes:PropertyIsEqualTo><fes:PropertyIsNull><fes:ValueReference>gdk60:registreringTil</fes:ValueReference></fes:PropertyIsNull></fes:And></fes:Filter>`
    
    // console.log( geodkvektorurl)
    // axios.get(geodkvektorurl)
    //         .then( response => console.log(response.data))
  
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function () {
    // always executed
  });
