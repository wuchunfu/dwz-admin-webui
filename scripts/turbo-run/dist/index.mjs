import { createJiti } from "../../../node_modules/.pnpm/jiti@2.4.2/node_modules/jiti/lib/jiti.mjs";

const jiti = createJiti(import.meta.url, {
  "interopDefault": true,
  "alias": {
    "@vben/turbo-run": "/Users/hepeichun/Code/cnb.cool/mliev/open/dwz-admin-webui/scripts/turbo-run"
  },
  "transformOptions": {
    "babel": {
      "plugins": []
    }
  }
})

/** @type {import("/Users/hepeichun/Code/cnb.cool/mliev/open/dwz-admin-webui/scripts/turbo-run/src/index.js")} */
const _module = await jiti.import("/Users/hepeichun/Code/cnb.cool/mliev/open/dwz-admin-webui/scripts/turbo-run/src/index.ts");

export default _module?.default ?? _module;