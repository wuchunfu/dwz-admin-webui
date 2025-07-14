const { createJiti } = require("../../../node_modules/.pnpm/jiti@2.4.2/node_modules/jiti/lib/jiti.cjs")

const jiti = createJiti(__filename, {
  "interopDefault": true,
  "alias": {
    "@vben/tailwind-config": "/Users/hepeichun/Code/cnb.cool/mliev/open/dwz-admin-webui/internal/tailwind-config"
  },
  "transformOptions": {
    "babel": {
      "plugins": []
    }
  }
})

/** @type {import("/Users/hepeichun/Code/cnb.cool/mliev/open/dwz-admin-webui/internal/tailwind-config/src/index.js")} */
module.exports = jiti("/Users/hepeichun/Code/cnb.cool/mliev/open/dwz-admin-webui/internal/tailwind-config/src/index.ts")