/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
const vscode = require('vscode');

/*
await window.showInputBox({prompt: 'prompt for something',})
*/

function elemLocToRange(elem){
    let name = elem.name?elem.name:Object(elem.name).toString();
    return new vscode.Range(
        new vscode.Position(elem.loc.start.line-1, elem.loc.start.column),
        new vscode.Position(elem.loc.start.line-1, elem.loc.start.column+name.length)
        )
}

class SolidityCodeLensProvider  {
    constructor(g_parser){
        this.g_parser = g_parser
    }

    async provideCodeLenses(document) {
        
        let codeLens = new Array()
        let firstLine = new vscode.Range(0, 0, 0, 0)
        let parser = this.g_parser.sourceUnits[document.uri.path]
        
        /** top level lenses */
        codeLens.push(
            new vscode.CodeLens(
                firstLine, {
                    command: 'solidity-va.surya.mdreport',
                    title: 'report',
                    arguments: [document.uri.path]
                }
            )
        )
        /*  does not yet return values but writes to console
        codeLens.push(
            new vscode.CodeLens(
                firstLine, {
                    command: 'solidity-va.surya.describe',
                    title: 'describe',
                    arguments: [document.uri.path]
                }
            )
        )
        */
        codeLens.push(
            new vscode.CodeLens(
                firstLine, {
                    command: 'solidity-va.surya.graph',
                    title: 'graph',
                    arguments: [document.uri.path]
                }
            )
        )
        codeLens.push(
            new vscode.CodeLens(
                firstLine, {
                    command: 'solidity-va.surya.inheritance',
                    title: 'intheritance',
                    arguments: [document.uri.path]
                }
            )
        )
        codeLens.push(
            new vscode.CodeLens(
                firstLine, {
                    command: 'solidity-va.surya.parse',
                    title: 'parse',
                    arguments: [document.uri.path]
                }
            )
        )

        let annotateContractTypes = ["contract","library"]
        /** all contract decls */
        for(let name in parser.contracts){
            if(annotateContractTypes.indexOf(parser.contracts[name]._node.kind)>=0){
                codeLens = codeLens.concat(this.onContractDecl(document,parser.contracts[name]))

                /** all function decls */
                for(let funcName in parser.contracts[name].functions){
                    codeLens = codeLens.concat(this.onFunctionDecl(document, name, parser.contracts[name].functions[funcName]))
                }
            }
        }
        return codeLens
    }

    onContractDecl(document, item){
        let lenses = new Array()
        let range = elemLocToRange(item._node)

        lenses.push(new vscode.CodeLens(range, {
            command: 'solidity-va.test.createTemplate',
            title: 'UnitTest stub',
            arguments: [item.name]
            })
        )
        lenses.push(new vscode.CodeLens(range, {
            command: 'solidity-va.surya.dependencies',
            title: 'dependencies',
            arguments: [item.name, []]
            })
        )
        return lenses
    }

    onFunctionDecl(document, contractName, item){
        let lenses = new Array()
        let range = elemLocToRange(item._node)

        lenses.push(new vscode.CodeLens(range, {
            command: 'solidity-va.surya.ftrace',
            title: 'ftrace',
            arguments: [contractName+"::"+item._node.name, "all", document.uri.path]
            })
        )
        return lenses
    }
}

module.exports = {
    SolidityCodeLensProvider:SolidityCodeLensProvider
}
