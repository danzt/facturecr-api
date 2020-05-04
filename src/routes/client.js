import { Router } from 'express';
import Odoo from '../odoo'

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
    if (err) { return next(err); i}

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

export default router;
