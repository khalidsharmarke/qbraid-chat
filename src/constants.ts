/**
 * The default file path for the Qbraid configuration file.
 * This path points to the user's home directory under the `.qbraid` folder
 * and the file is named `qbraidrc`.
 */
export const DEFAULT_QBRAIDRC_FILEPATH = '~/.qbraid/qbraidrc';
/**
 * The default URL for the Qbraid API.
 * This URL is used to make requests to the Qbraid backend services.
 */
export const DEFAULT_QBRAID_API_URL = 'https://api.qbraid.com/api';
/**
 * The key name used to store the Qbraid configuration file path in the VSCode workspace state.
 */
export const VSCODE_STORAGE_QBRAIDRC_FILEPATH_KEYNAME = 'qbraidsrc-filepath';
/**
 * The key name used to store the chat model in the VSCode workspace state.
 */
export const VSCODE_STORAGE_QBRAID_CHAT_MODEL_KEYNAME = 'qbraid-chatmodel';
/**
 * The text displayed on the VSCode status bar button for the Qbraid Chat Bot.
 */
export const VSCODE_STATUSBAR_BUTTON_TEXT = 'QBraid Chat Bot';
/**
 * The key name used to store the agent bhavior switch in the workspace state
 */
export const VSCODE_AGENT_BEHAVIOR_KEYNAME = 'agent-bahvior-enabled';
/**
 * The text showing for the satus bar item
 */
export const VSCODE_STATUSBAR_PREFIX = 'QBraid Agent Behavior ';
