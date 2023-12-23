'use strict';

/**
 * @callback MochifyDriverEvaluate
 * @param {string} script
 * @returns {Promise<Object>}
 */

/**
 * @callback MochifyDriverEnd
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} MochifyDriver
 * @property {MochifyDriverEvaluate} evaluate
 * @property {MochifyDriverEnd} end
 */

module.exports = {};
