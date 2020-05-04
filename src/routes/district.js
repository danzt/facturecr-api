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
      fields: ['name', 'county_id'],
    };

    if (req.query.canton_id) {
      params.domain = [
        ['county_id', '=', parseInt(req.query.canton_id)],
      ]
    }

    odoo.search_read('res.country.district', params, (err, districts) => {
      if (err) { next(err); }

      res.send(districts)
    });
  });
});

export default router;


