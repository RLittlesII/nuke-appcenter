import 'reflect-metadata'
import {writeFileSync} from 'fs';
import {basename, resolve} from 'path';
import {sync} from 'glob';
import {from} from 'ix/iterable';
import {filter, map} from 'ix/iterable/operators';
import {nukeSchema} from './schema';

const commandline = require('../node_modules/appcenter-cli/dist/util/commandline/option-decorators');

export interface command {
    commandPath: string[];
    helpText: string;
    options: Record<string, commandOption>;
}

export interface commandOption {
    common: boolean;
    required: boolean;
    hasArg: boolean;
    defaultValue: any;
    helpText: string;
    shortName: string;
    longName: string;
}

const files = sync('./node_modules/appcenter-cli/dist/commands/**/*.js', {absolute: true});

const commands: command[] = [];
for (const {path, command} of from(files)
    .pipe(
        map(path => ({
            path,
            module: require(path)
        })),
        filter(z => !!z.module.default),
        map(({module, path}) => ({path, command: module.default}))
    )) {
    const p = path.split('commands');
    const commandPath = p[p.length - 1].substring(1).split('/').map(z => basename(z, '.js'));
    console.log(commandPath);
    console.log(commandline.getClassHelpText(command));
    console.log(commandline.getOptionsDescription(command.prototype));

    if(commandPath.some(x => x.includes("-"))){
        continue;
    }
    commands.push({
        commandPath: commandPath,
        helpText: commandline.getClassHelpText(command),
        options: commandline.getOptionsDescription(command.prototype)
    });
}

const spec: nukeSchema = {
    name: "AppCenter",
    officialUrl: "https://appcenter.ms",
    pathExecutable: "appcenter-cli",
    references: [],
    commonTaskPropertySets: [],
    tasks: []
};

for(const command of commands){
    var commonOptions = Object.values(command.options).filter(x => x.common);
    
    for(const option of commonOptions){
        spec.commonTaskPropertySets.push({
            name: option.longName,
            type: option.defaultValue,
            format: option.longName,
            help: option.helpText
        });
    }

    const commonTaskPropertyNames: string[] = spec.commonTaskPropertySets.map(x => x.name);

    spec.tasks.push({
        help: command.helpText,
        postfix: command.commandPath.map(x => x[0].toUpperCase() + x.substring(1)).join(""),
        commonPropertySets: commonTaskPropertyNames.filter((n, i) => commonTaskPropertyNames.indexOf(n) === i),
        definiteArgument: getDefiniteArgument(command),
        settingsClass: {
            properties: []
        }
    });
}

function getDefiniteArgument(command: command){
    return command.commandPath.join(" ");
}
function getCommonPropertySets(command: command){
    return command.commandPath.join(" ");
}

writeFileSync(resolve(__dirname, './nuke.spec.json'), JSON.stringify(commands));

writeFileSync (resolve(__dirname, '../spec/AppCenterCli.json'), JSON.stringify(spec, null, 4));

// console.log(commands[0]);