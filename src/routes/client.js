import { Router } from 'express';
import Odoo from '../odoo'

import renameObjKey from '../helpers'


const router = Router();

router.get('/', (req, res, next) => {
  const odoo = new Odoo({
    host: "api-stag.facturecr.com",
    port: 443,
    database: "api_fe_stag",
    username: "prueba",
    password: "123456"
  })

  // Connect to Odoo
  odoo.connect((err) => {
    if (err) { return next(err); }

    let params = {
      fields: ['nombre', 'correo', 'telefono', 'docs_procesados', 'cedula'],
    };
    odoo.search_read('cliente', params, (err, clients) => {
      if (err) { next(err); }

      res.send(clients)
    });
  });
});

router.get('/:id', (req, res, next) => {
  const odoo = new Odoo({
    host: "api-stag.facturecr.com",
    port: 443,
    database: "api_fe_stag",
    username: "prueba",
    password: "123456"
  })

  // Connect to Odoo
  odoo.connect((err) => {
    if (err) { return next(err); }

    let params = {
      domain: [['id', '=', parseInt(req.params.id)]],
      fields: ['nombre', 'correo', 'telefono', 'activity_id', 'cedula', 'identification_id', 'provincia_id', 'canton_id', 'distrito_id']
    };
    odoo.search_read('cliente', params, (err, client) => {
      if (err) { next(err); }

      res.send(client)
    });
  });
});

router.patch('/:id', (req, res, next) => {
  // Odoo's fields name
  // fields: ['nombre', 'correo', 'telefono', 'activity_id', 'cedula', 'identification_id', 'provincia_id', 'canton_id', 'distrito_id']

  // FactureCR Frontend fields name
  /* { economic_activity_id: '',
      name: 'CRSOPORTE TECH SOCIEDAD ANONIMA',
      identification_type: '02',
      identification: '3101724201',
      email: 'cesar_1692@hotmail.com',
      country: { name: 'Costa Rica', id: 50 },
      province: { id: 1, name: 'San José' },
      canton: { id: 7, name: 'Montes de Oca' },
      district: { id: 90, name: 'San Pedro' },
      contacts: [ { name: '', email: '' } ],
      provider: 0,
      economic_activity: { id: 1 },
      id: 1,
      phone: '40629081' 
  } */

  let vals = req.body
  let province_id = req.body.province.id
  let canton_id = req.body.canton.id
  let district_id = req.body.district.id

  // Renaming vals' keys to match odoo's fields name.
  renameObjKey(vals, 'name', 'nombre')
  renameObjKey(vals, 'email', 'correo')
  renameObjKey(vals, 'phone', 'telefono')
  renameObjKey(vals, 'identification', 'cedula')
  renameObjKey(vals, 'province', 'provincia_id')
  renameObjKey(vals, 'canton', 'canton_id')
  renameObjKey(vals, 'district', 'distrito_id')

  // Adapting data to Many2one format
  vals.provincia_id = province_id
  vals.canton_id = canton_id
  vals.distrito_id = district_id

  // If country is not Costa Rica then we clean location data
  if (vals.country.id != 50) {
    vals.provincia_id = false
    vals.canton_id = false
    vals.distrito_id = false
  }

  // Removing attributes that we are not going to use right now..
  delete vals['id'];
  delete vals['identification_type'];
  delete vals['contacts'];
  delete vals['economic_activity'];
  delete vals['economic_activity_id'];
  delete vals['provider'];
  delete vals['country'];
 
  const odoo = new Odoo({
    host: "api-stag.facturecr.com",
    port: 443,
    database: "api_fe_stag",
    username: "prueba",
    password: "123456"
  })

  // Connect to Odoo
  odoo.connect((err) => {
    if (err) { return next(err); }

    odoo.update('cliente', parseInt(req.params.id), vals, (err, client) => {
      if (err) { next(err); }

      res.send(client)
    });
  });
});


export default router;
