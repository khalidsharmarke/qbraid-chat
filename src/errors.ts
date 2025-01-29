/**
 * Enum representing different types of errors that can occur in our extension.
 */
export enum QBraidChatErrorTypes {
	/**
	 * Error indicating that the Qbraid RC file path is invalid.
	 */
	BadQBraidRcFilepath = 'Your Qbraid RC file path is invalid. Please check your settings.',

	/**
	 * Error indicating that the Qbraid API key format is incorrect.
	 */
	BadAPIKeyFormat = 'Your Qbraid API key is not in the correct format. Please check your settings.',

	/**
	 * Error indicating that the Qbraid RC file path is invalid.
	 */
	InvalidConfigFilePath = 'Your Qbraid RC file path is invalid. Please check your settings.',

	/**
	 * Error indicating that the chat API response format is incorrect.
	 */
	BadChatJsonResponseFormat = 'The chat API response is not in the correct format.',

	/**
	 * Error indicating that the chat model API response format is incorrect.
	 */
	BadChatModelResponseFormat = 'The chat model API response is not in the correct format.',

	/**
	 * Error indicating that the user configuration format is incorrect.
	 */
	BadUserConfigFormat = 'The user configuration is not in the correct format.',

	/**
	 * Error indicating that the API response format is unexpected
	 */
	BadAPIResponseFormat = 'The API response format wasnt expected for the following type: ',
}

/**
 * Class representing an error in our extension
 */
export class QBraidChatError extends Error {
	/**
	 * The type of error.
	 */
	errorType: QBraidChatErrorTypes;

	/**
	 * Creates an instance of QBraidChatError.
	 * @param type - The type of error.
	 */
	constructor(type: QBraidChatErrorTypes, extra?: string) {
		super();
		this.errorType = type;
		super.message = extra ? `${type}: ${extra}` : type;
	}
}
