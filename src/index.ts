import 'reflect-metadata'
import { readdir, writeFileSync } from 'fs';
import { basename, dirname, extname } from 'path';
import { sync } from 'glob';
import { from } from 'ix/iterable';
import { map, filter } from 'ix/iterable/operators';
import { nukeSchema } from './schema';

const commandline = require('../node_modules/appcenter-cli/dist/util/commandline/option-decorators');
const nukeSpec: any = {};

export interface command{
    commandPath:string[];
    helpText:string;
    options:[];
}

export interface commandOption{
    common: boolean;
    required: boolean;
    hasArg: boolean;
    defaultValue: any;
    helpText: string;
    shortName: string;
    longName: string;
}

const files = sync('./node_modules/appcenter-cli/dist/commands/**/*.js', { absolute: true });

var commands:command[] = new Array() ;

for (const { path, command } of from(files).pipe(map(path => ({ path, module: require(path) })), filter(z => !!z.module.default), map(({ module, path }) => ({ path, command: module.default })))) {
    const p = path.split('commands');
    const commandPath = p[p.length-1].substring(1).split('/').map(z => basename(z , '.js'));
    console.log(commandPath);
    console.log(commandline.getClassHelpText(command));
    console.log(commandline.getOptionsDescription(command.prototype));

    var commandDefinition : command = {
        commandPath: commandPath,
        helpText: commandline.getClassHelpText(command),
        options: commandline.getOptionsDescription(command.prototype)
    }

    commands.push(commandDefinition);
} 

writeFileSync('./nuke.spec.json', JSON.stringify(commands));

// console.log(commands[0]);