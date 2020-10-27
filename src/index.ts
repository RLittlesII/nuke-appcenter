import 'reflect-metadata'
import { readdir, writeFileSync } from 'fs';
import { basename, dirname, extname } from 'path';
import { sync } from 'glob';
import { from } from 'ix/iterable'
import { map, filter } from 'ix/iterable/operators'
const commandline = require('../node_modules/appcenter-cli/dist/util/commandline/option-decorators');
const nukeSpec: any = {};

export interface command{
    commandPath:string[];
    helpText:string;
    type:string;
}

// const commands = sync('./node_modules/appcenter-cli/dist/commands/**/*.js', { absolute: true });
const commands = sync('./node_modules/appcenter-cli/dist/commands/codepush/release.js', { absolute: true });

for (const { path, command } of from(commands).pipe(map(path => ({ path, module: require(path) })), filter(z => !!z.module.default), map(({ module, path }) => ({ path, command: module.default })))) {
    const p = path.split('commands');
    const commandPath = p[p.length-1].substring(1).split('/').map(z => basename(z , '.js'));
    console.log(commandPath);
    console.log(commandline.getClassHelpText(command));
    console.log(commandline.getOptionsDescription(command.prototype));
    // console.log(command, Reflect.getPrototypeOf(command), Reflect.getMetadataKeys(Reflect.getPrototypeOf(command)));
}

writeFileSync('./nuke.spec.json', JSON.stringify(nukeSpec));

// console.log(commands[0]);