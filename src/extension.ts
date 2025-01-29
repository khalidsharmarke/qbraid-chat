// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Commands, selectChatModel, startChat, switchAgentBehavior } from './commands';
import { checkAgentBehaviorEnabled, setAPIKey, setQBraidRCPath } from './utils';
import { statusBarButton } from './components';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "qbraid-chat" is now active!');

	context.subscriptions.push(
		...[
			vscode.commands.registerCommand(Commands.SetAPIKey, async () => await setAPIKey(context)),
			vscode.commands.registerCommand(
				Commands.SetQBraidRCPath,
				async () => await setQBraidRCPath(context)
			),
			vscode.commands.registerCommand(Commands.SelectChatModel, async () => {
				const model = await selectChatModel(context);
				if (model) {
					await startChat(context, model);
				}
			}),
			vscode.commands.registerCommand(Commands.StartChat, () =>
				vscode.commands.executeCommand(Commands.SelectChatModel)
			),
			vscode.commands.registerCommand(Commands.SwitchAgentBehavior, async () => {
				const isEnabled = await switchAgentBehavior(context);
				statusBarButton.text = 'QBraid Chat Bot ' + (isEnabled ? 'Enabled' : 'Disabled');
			}),
		]
	);

	// On startup, update the statusbar item
	statusBarButton.text =
		'QBraid Chat Bot ' + (checkAgentBehaviorEnabled(context) ? 'Enabled' : 'Disabled');
	vscode.window.onDidChangeWindowState(e => console.log(e));
	statusBarButton.show();
}

// This method is called when your extension is deactivated
export function deactivate() {}
