const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

function resultOK(result) {
  if (result['wfs:FeatureCollection']) {
    if (result['wfs:FeatureCollection']['wfs:member']) {
      if (result['wfs:FeatureCollection']['wfs:member'].length) {
        if (result['wfs:FeatureCollection']['wfs:member'][0]['gdk60:virkningsaktoer']) {
          if (result['wfs:FeatureCollection']['wfs:member'][0]['gdk60:virkningsaktoer'].length) {
            return true    
          }
        }
      }
    }
  }
  return false
}
fs.createReadStream('event.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (row.BeskedType == 'VandloebsmidteCreate') {
      // console.log(row);
      let objektID = row.ObjektID;
      let geodkvektorurl = `https://services.datafordeler.dk/GeoDanmarkVektor/GeoDanmark60_NOHIST_GML3/1.0.0/WFS?username=ONCVAXSNFU&password=Nuga10s..&service=WFS&version=2.0.0&request=GetFeature&typenames=gdk60:Vandloebsmidte&namespaces=xmlns(gdk60,http://data.gov.dk/schemas/geodanmark60/2/gml3),xmlns(gml,http://www.opengis.net/gml/3.2),xmlns(fes,http://www.opengis.net/fes/2.0)&filter=<fes:Filter><fes:And><fes:PropertyIsEqualTo><fes:ValueReference>gdk60:id.namespace</fes:ValueReference><fes:Literal>http://data.gov.dk/geodanmark</fes:Literal></fes:PropertyIsEqualTo><fes:PropertyIsEqualTo><fes:ValueReference>gdk60:id.lokalId</fes:ValueReference><fes:Literal>${objektID}</fes:Literal></fes:PropertyIsEqualTo><fes:PropertyIsNull><fes:ValueReference>gdk60:registreringTil</fes:ValueReference></fes:PropertyIsNull></fes:And></fes:Filter>`
      axios
        .get(geodkvektorurl)
        .then( response => {
          // console.log(response.data)
          parser.parseString( response.data, (err, result ) => {
            // console.log(result)
            // console.log(result['wfs:FeatureCollection']['wfs:member'][0]['gdk60:Vandloebsmidte'][0]['gdk60:virkningsaktoer'][0])
            // if (resultOK(result)) {}
            let virkningsaktoer = result['wfs:FeatureCollection']['wfs:member'][0]['gdk60:Vandloebsmidte'][0]['gdk60:virkningsaktoer'][0];
            let values = Object.values(row);
            let line   = values.join()
            console.log(`${line},${virkningsaktoer}`)
          })
        })
        .catch(error => console.log(error))
    }
  })
