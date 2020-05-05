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

  // connect to odoo
  odoo.connect((err) => {
    if (err) { return next(err); }

    let params = {
      fields: ['name', 'provincia_id'],
    };

    if (req.query.province_id) {
      params.domain = [['provincia_id', '=', parseInt(req.query.province_id)]]
    }

    odoo.search_read('res.country.county', params, (err, counties) => {
      if (err) { next(err); }

      res.send(counties)
    });
  });
});

export default router;

