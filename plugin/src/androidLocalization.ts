import { XML } from 'expo/config-plugins';
import path from 'path';
import fs from 'fs-extra';

export interface XMLString {
  _: string;
  $: {
    name: string;
  };
}

export interface XMLResources {
  string?: XMLString[];
}

export interface XMLObject {
  resources?: XMLResources;
}

export async function mergeStringsXml(sourcePath: string, destPath: string) {
  const source = (await XML.readXMLAsync({ path: sourcePath })) as XMLObject;
  const sourceStrings = source?.resources?.['string'] || [];

  let dest = (await XML.readXMLAsync({ path: destPath }).catch(
    () => null
  )) as XMLObject | null;

  if (!dest) {
    dest = { resources: {} };
    fs.ensureDirSync(path.dirname(destPath));
  }
  if (!dest.resources) {
    dest.resources = {};
  }
  if (!dest.resources['string']) {
    dest.resources['string'] = [];
  }

  const destStrings = dest.resources['string'];

  for (const sourceString of sourceStrings) {
    const name = sourceString.$.name;
    const existing = destStrings.find((s) => s.$.name === name);

    if (existing) {
      existing._ = sourceString._;
    } else {
      destStrings.push(sourceString);
    }
  }

  await XML.writeXMLAsync({ path: destPath, xml: dest });
}
