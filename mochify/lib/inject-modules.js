'use strict';

exports.injectModules = injectModules;

async function injectModules(driver, source) {
  for (const mod of source) {
    const inject_cmd = [
      `var s = document.createElement('script')`,
      `s.type = 'module'`,
      `s.src = '${mod.src}'`,
      `window.mochify_pending.push(new Promise(function (resolve, reject) { s.onload = resolve; }))`,
      `document.head.appendChild(s)`
    ].join(';');
    await driver.evaluate(`(function () { ${inject_cmd} })();`);
  }
  await driver.evaluate(`window.mocha.mochify_run()`);
}
