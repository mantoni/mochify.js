'use strict';

exports.setupClient = setupClient;

function setupClient(client, config = {}) {
  return client
    .replace('/* MOCHIFY_UI */', `'${config.ui || 'bdd'}'`)
    .replace('/* MOCHIFY_TIMEOUT */', config.timeout || 2000);
}
