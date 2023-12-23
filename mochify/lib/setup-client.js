'use strict';

exports.setupClient = setupClient;

/**
 * @param {string} client
 * @param {Object} [config]
 * @param {string} [config.ui]
 * @param {number} [config.timeout]
 * @returns {string}
 */
function setupClient(client, config = {}) {
  const configured_client = client
    .replace('/* MOCHIFY_UI */', `'${config.ui || 'bdd'}'`)
    .replace('/* MOCHIFY_TIMEOUT */', String(config.timeout || 2000));
  return `(function(){${configured_client}})()`;
}
