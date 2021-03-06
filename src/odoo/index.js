'use strict'

var assert = require('assert'),
  http = require('http'),
  https = require('https'),
  jayson = require('jayson'),
  _ = require('lodash');

var Odoo = function (config) {
  config = config || {};

  this.ssl = config.ssl;
  this.host = config.host;
  this.port = config.port || 80;
  this.database = config.database;
  this.username = config.username;
  this.password = config.password;
};

// Connect
Odoo.prototype.connect = function (cb) {
  var params = {
    db: this.database,
    login: this.username,
    password: this.password
  };

  var json = JSON.stringify({ params: params });

  var options = {
    host: this.host,
    port: this.port,
    path: '/web/session/authenticate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': json.length
    }
  };

  var self = this;

  var req = https.request(options, function (res) {
    var response = '';

    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      response += chunk;
    });

    res.on('end', function () {
      response = JSON.parse(response);

      if (response.error) {
        return cb(response.error, null);
      }

      self.uid = response.result.uid;
      self.sid = res.headers['set-cookie'][0].split(';')[0];
      self.session_id = response.result.session_id;
      self.context = response.result.user_context;

      return cb(null, response.result);
    });
  });

  req.write(json);
};

// Create record
Odoo.prototype.create = function (model, params, callback) {
  this._request('/web/dataset/call_kw', {
    kwargs: {
      context: this.context
    },
    model: model,
    method: 'create',
    args: [params]
  }, callback);
};

// Get record
// https://www.odoo.com/documentation/8.0/api_integration.html#read-records
// https://www.odoo.com/documentation/8.0/reference/orm.html#openerp.models.Model.read
Odoo.prototype.get = function (model, params, callback) {
  assert(params.ids, "Must provide a list of IDs.");

  this._request('/web/dataset/call', {
    model: model,
    method: 'read',
    args: [
      params.ids
    ],
    kwargs: {
      fields: params.fields,
    },
  }, callback);
};

// Update record
Odoo.prototype.update = function (model, id, params, callback) {
  assert(id, "Must provide an ID.");

  this._request('/web/dataset/call_kw', {
    kwargs: {
      context: this.context
    },
    model: model,
    method: 'write',
    args: [[id], params]
  }, callback);
};

// Delete record
Odoo.prototype.delete = function (model, id, callback) {
  assert(id, "Must provide an ID.");

  this._request('/web/dataset/call_kw', {
    kwargs: {
      context: this.context
    },
    model: model,
    method: 'unlink',
    args: [[id]]
  }, callback);
};

// Generic RPC wrapper
// DOES NOT AUTO-INCLUDE context
Odoo.prototype.rpc_call = function (endpoint, params, callback) {
  assert(params.model);

  this._request(endpoint, params, callback);
}; //generic

// Search records
Odoo.prototype.search = function (model, params, callback) {
  assert(params.domain, "Must provide a search domain.");

  this._request('/web/dataset/call_kw', {
    kwargs: {
      context: this.context
    },
    model: model,
    method: 'search',
    args: [
      params.domain
    ]
  }, callback);
};

// Search & Read records
// https://www.odoo.com/documentation/8.0/api_integration.html#search-and-read
// https://www.odoo.com/documentation/8.0/reference/orm.html#openerp.models.Model.search
// https://www.odoo.com/documentation/8.0/reference/orm.html#openerp.models.Model.read
Odoo.prototype.search_read = function (model, {domain= [], fields= [], limit= 0, offset= 0, sort= ''}, callback) {
  if (!fields.length) return console.error("The search_read method doesn't support an empty fields array.");
  this._request('/web/dataset/search_read', {
    context: this.context,
    model,
    domain,
    fields,
    limit,
    offset,
    sort,
  }, callback);
};

// Added fields_get method
Odoo.prototype.fields_get = function (model, {fields= [], attributes= {}}, callback) {
  this._request('/web/dataset/call_kw', {
    kwargs: {
      context: this.context
    },
    model,
    method: 'fields_get',
    args: [fields, attributes],
  }, callback);
};

// Private functions
Odoo.prototype._request = function (path, params, callback) {
  params = params || {};

  var options = {
    host: this.host,
    port: this.port,
    path: path || '/',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': this.sid + ';'
    }
  };

  var client = jayson.client.https(options);

  client.request('call', params, function (e, err, res) {
    if (e || err) {
      return callback(e || err, null);
    }

    return callback(null, res);
  });
};

module.exports = Odoo;
