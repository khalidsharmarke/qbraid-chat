import * as vscode from 'vscode';
import { Commands } from '../commands';

/**
 * Creates a status bar button in the Visual Studio Code editor.
 * Tells the user if agent behavior is enabled
 *
 * The button is aligned to the far right of the left side
 * It is associated with the `Commands.SelectChatModel` command and displays the text 'QBraid Chat Bot'.
 */
const statusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1);
statusBarButton.command = Commands.SwitchAgentBehavior;

export { statusBarButton };
