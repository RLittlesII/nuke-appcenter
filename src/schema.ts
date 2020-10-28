export interface enumeration{
    name:string;
    values:string[];
}

export interface commonTaskProperty{
    name:string;
    type:string;
    separator:string;
}

export interface commonTaskPropertySet{
    name:string;
    type:string;
    format:string;
    help:string;
}

export interface task{
    help:string;
    postfix:string;
    commonPropertySets:string[];
    definiteArgument:string;
    settingsClass:properties;
}

export interface properties{
    properties:property[];
}

export interface property{
    name:string;
    type:string;
    format:string;
    createOverload:boolean;
    customValue:boolean;
    itemFormat:string;
    disallowedCharacter:string;
    help:string;
}

export interface nukeSchema{
    references:string[];
    name:string;
    officialUrl:string;
    pathExecutable:string;
    tasks:task[];
}