const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  packagerConfig: {
    icon: "./assets/app-icon/icon",
    osxSign: {
      identity: process.env.OSX_IDENTITY,
      "hardened-runtime": true,
      entitlements: "./entitlements.plist",
      "entitlements-inherit": "./entitlements.plist",
      "signature-flags": "library",
    },
    osxNotarize: {
      appleId: process.env.OSX_NOTARIZE_ID,
      appleIdPassword: process.env.OSX_NOTARIZE_PASSWORD,
    },
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "Choicelab Preview",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
};
