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
      fields: ['name'],
    };
    odoo.search_read('res.country.provincia', params, (err, provincias) => {
      if (err) { next(err); }

      res.send(provincias)
    });
  });
});

export default router;


