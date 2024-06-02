import fs from "fs";

import { browser } from "$app/environment";

let pathStuff, urlStuff;

if (!browser) {
  const path = await import("path");
  const url = await import("url");

  pathStuff = path
  urlStuff = url
}

import ApiUtil from "$lib/api.util.js";
import { API_URL, PLUGIN_DEV_MODE } from "$lib/variables.js";
import { base } from "$app/paths";

const plugins = {};

const pluginsFolder = "plugins/";
const manifestFileName = "manifest.json";

function log(message) {
  console.log(`[Plugin Manager] ${message}`);
}

const pano = {
  isPanel: base === "/panel",
};

export async function prepareSiteInfo(siteInfo) {
  if (!PLUGIN_DEV_MODE) {
    return siteInfo;
  }

  if (!fs.existsSync(pluginsFolder)) {
    fs.mkdirSync(pluginsFolder, { recursive: true });
  }

  const readPluginsFolder = fs.readdirSync(pluginsFolder);

  const plugins = {};

  readPluginsFolder.forEach((pluginId) => {
    const manifestFile = fs.readFileSync(
      pluginsFolder + pluginId + "/" + manifestFileName,
      {
        encoding: "utf8",
        flag: "r",
      },
    );

    plugins[pluginId] = JSON.parse(manifestFile);
  });

  siteInfo.plugins = plugins;

  return siteInfo;
}

export async function initializePlugins(siteInfo) {
  const pluginsInfo = siteInfo.plugins;

  if (!browser) {
    if (!fs.existsSync(pluginsFolder)) {
      fs.mkdirSync(pluginsFolder, { recursive: true });
    }

    const readPluginsFolder = fs.readdirSync(pluginsFolder);

    Object.keys(plugins)
      .filter((pluginId) => !readPluginsFolder.includes(pluginId))
      .forEach((pluginId) => {
        log(`Couldn't find plugin '${pluginId}', removing...`);

        delete plugins[pluginId];
      });

    readPluginsFolder.forEach((pluginId) => {
      if (!PLUGIN_DEV_MODE) {
        if (pluginsInfo[pluginId] === undefined) {
          log(`Couldn't find plugin '${pluginId}', removing...`);

          fs.rmSync(pluginsFolder + pluginId, { recursive: true, force: true });

          delete plugins[pluginId];
          return;
        }
      }

      const manifestFile = fs.readFileSync(
        pluginsFolder + pluginId + "/" + manifestFileName,
        {
          encoding: "utf8",
          flag: "r",
        },
      );

      plugins[pluginId] = JSON.parse(manifestFile);
    });

    if (!PLUGIN_DEV_MODE) {
      Object.keys(pluginsInfo)
        .filter((pluginId) => plugins[pluginId] === undefined)
        .forEach((pluginId) => {
          const pluginFolder = pluginsFolder + pluginId;
          const manifestFilePath = pluginFolder + "/" + manifestFileName;
          const pluginManifest = pluginsInfo[pluginId];

          log(`Installing plugin '${pluginId}'...`);

          if (!fs.existsSync(pluginFolder)) {
            fs.mkdirSync(pluginFolder, { recursive: true });
          }

          fs.writeFileSync(
            manifestFilePath,
            JSON.stringify(pluginManifest, null, 2),
          );
        });
    }

    if (!PLUGIN_DEV_MODE) {
      for (const pluginId of Object.keys(plugins)) {
        const pluginFolder = pluginsFolder + pluginId;

        const pluginInfoManifest = pluginsInfo[pluginId];
        let pluginManifest = plugins[pluginId];

        const files = fs.readdirSync(pluginFolder);

        let noHashMatch = false;

        Object.keys(pluginManifest.uiHashes)
          .filter(
            (fileName) =>
              pluginManifest.uiHashes[fileName] !==
              pluginInfoManifest.uiHashes[fileName],
          )
          .forEach((hash) => {
            noHashMatch = true;
          });

        if (
          pluginManifest.version !== pluginInfoManifest.version ||
          noHashMatch
        ) {
          const manifestFilePath = pluginFolder + "/" + manifestFileName;

          log(`Updating plugin '${pluginId}'.`);

          plugins[pluginId] = pluginInfoManifest;
          pluginManifest = plugins[pluginId];
          fs.writeFileSync(
            manifestFilePath,
            JSON.stringify(pluginManifest, null, 2),
          );

          files
            .filter((fileName) => fileName !== manifestFileName)
            .forEach((fileName) => {
              fs.rmSync(pluginFolder + "/" + fileName, { force: true });
            });
        }

        for (const fileName of Object.keys(pluginManifest.uiHashes)) {
          const fixedFileName = fileName.substring("plugin-ui/".length);
          const filePath = pluginFolder + "/" + fixedFileName;

          if (!fs.existsSync(filePath)) {
            log(`Plugin resource not found: '${filePath}'.`);
            log(`Downloading...`);

            const file = await ApiUtil.get({
              path: `/api/plugins/${pluginId}/resources/${fileName}`,
            });

            fs.writeFileSync(filePath, file);
          }
        }
      }
    }
  } else {
    Object.keys(pluginsInfo).forEach((pluginId) => {
      plugins[pluginId] = pluginsInfo[pluginId];
    });
  }

  await loadPlugins();
  await enablePlugins();
}

async function loadPlugins() {
  for (const pluginId of Object.keys(plugins)) {
    const plugin = plugins[pluginId];
    const pluginFolder = pluginsFolder + pluginId;

    if (browser) {
      plugin.module = await import(
        /* @vite-ignore */ `${PLUGIN_DEV_MODE ? base + "/dev-api" : API_URL}/plugins/${pluginId}/resources/plugin-ui/client.mjs`
      );
    } else {
      const path = `${pluginFolder}/server.mjs?${Date.now()}`;

      const __filename = urlStuff.fileURLToPath(import.meta.url);

      const currentDir = pathStuff.dirname(__filename); // Directory of the current file
      const targetFile = pathStuff.resolve(currentDir, process.cwd()); // Absolute path of the target file

      const relativePath = pathStuff.relative(currentDir, targetFile);
      const levels = relativePath.split(pathStuff.sep).length;

      const upDirs = '../'.repeat(levels); // Repeating '../' based on the number of levels

      plugin.module = await import(/* @vite-ignore */ upDirs + path);
    }
  }

  for (const pluginId of Object.keys(plugins)) {
    const plugin = plugins[pluginId];

    if (plugin.module.onLoad !== undefined) {
      await plugin.module.onLoad(pano);
    }
  }
}

async function enablePlugins() {
  for (const pluginId of Object.keys(plugins)) {
    const plugin = plugins[pluginId];

    if (plugin.module.onEnable !== undefined) {
      await plugin.module.onEnable(pano);
    }
  }
}
