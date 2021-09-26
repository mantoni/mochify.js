'use strict';

exports.setupClient = setupClient;

function setupClient(client, config = {}) {
  const configured_client = client
    .replace('/* MOCHIFY_UI */', `'${config.ui || 'bdd'}'`)
    .replace('/* MOCHIFY_TIMEOUT */', config.timeout || 2000);
  return `(function(){${configured_client}})()`;
}
