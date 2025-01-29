/**
 * Configuration settings for a user.
 */
export type UserConfig = {
	/**
	 * The URL of the API endpoint.
	 */
	apiUrl: string;

	/**
	 * The API key used for authentication.
	 */
	apiKey: string;
};

/**
 * Different types of API responses we can expect
 */
export type ApiResponse =
	| QuantumDevice[]
	| GetQuantumJobsResponse
	| ChatModel[]
	| ChatAPIJsonResponseBody;

/**
 * Describes the response from get devices service
 */
export type QuantumDevice = {
	qbraid_id: string;
	name: string;
	provider: string;
	vendor: string;
	numberQubits: number;
	pendingJobs: number;
	paradigm: string;
	type: string;
	runPackage: string;
	status: string;
	statusMsg: string | null;
	isAvailable: boolean;
	nextAvailable: string | null;
	pricing: DevicePricing;
};

type DevicePricing = {
	perTask: number;
	perShot: number;
	perMinute: number;
};

/**
 * Descrives the response from the get jobs service
 */
export type GetQuantumJobsResponse = {
	jobsArray: QuantumJob[];
	statusGroup: string;
	provider: string;
	total: number;
};

type QuantumJob = {
	timeStamps: QuantumJobTimeStamp;
	queuePosition: number | null;
	queueDepth: number | null;
	circuitNumQubits: number;
	circuitDepth: number;
	qbraidDeviceId: string;
	qbraidJobId: string;
	status: string;
	vendor: string;
	provider: string;
	escrow: number;
	cost: number;
	shots: number;
	openQasm: string;
	measurementCounts: object | null;
};

type QuantumJobTimeStamp = {
	createdAt: string;
	endedAt: string | null;
	executionDuration: number | null;
};

/**
 * Represents a chat model with its details.
 */
export type ChatModel = {
	/**
	 * The name of the chat model.
	 */
	model: string;

	/**
	 * A brief description of the chat model.
	 */
	description: string;

	/**
	 * The pricing details of the chat model.
	 */
	pricing: ChatModelPricing;
};

/**
 * Pricing details for a chat model.
 */
type ChatModelPricing = {
	/**
	 * The unit of pricing (e.g., per token, per request).
	 */
	units: string;

	/**
	 * The cost for input tokens.
	 */
	input: number;

	/**
	 * The cost for output tokens.
	 */
	output: number;
};

/**
 * Represents the request body for the Chat API.
 */
export type ChatAPIRequestBody = {
	/**
	 * The prompt to be sent to the chat model.
	 */
	prompt: string;

	/**
	 * The chat model to be used.
	 */
	model: string;

	/**
	 * Whether to stream the response.
	 */
	stream: boolean;
};

/**
 * Represents the JSON response body from the Chat API.
 */
export type ChatAPIJsonResponseBody = {
	/**
	 * The content of the chat response.
	 */
	content: string;

	/**
	 * The usage statistics of the Chat API.
	 */
	usage: ChatAPIUsage;
};

/**
 * Represents the usage statistics of the Chat API.
 */
type ChatAPIUsage = {
	/**
	 * The number of tokens used for the completion part of the chat.
	 */
	completion_tokens: number;
	/**
	 * The number of tokens used for the prompt part of the chat.
	 */
	prompt_tokens: number;
	/**
	 * The total number of tokens used for the chat, including both prompt and completion tokens.
	 */
	total_tokens: number;
};

/**
 * Enum for types of messages from the extension to the chat.
 */
export enum ExtensionToChatMessageType {
	/**
	 * Indicates that the bot is thinking.
	 */
	BotThinking = 'BotThinking',

	/**
	 * A message from the bot.
	 */
	BotMessage = 'BotMessage',

	/**
	 * A message containing chat model information.
	 */
	ChatModel = 'ChatModel',
}

/**
 * Represents a message from the extension to the chat.
 */
export type ExtensionToChatMessage = {
	/**
	 * The type of the message.
	 */
	type: ExtensionToChatMessageType;

	/**
	 * An optional identifier for the message.
	 */
	id?: string;

	/**
	 * The content of the message.
	 */
	content?: string;
};

/**
 * Enum for types of messages from the chat to the extension.
 */
export enum ChatToExtensionMessageType {
	/**
	 * A message from the user.
	 */
	UserMessage = 'UserMessage',

	/**
	 * A request to get the chat model.
	 */
	GetChatModel = 'GetChatModel',

	/**
	 * A request to change the chat model.
	 */
	ChangeChatModel = 'ChangeChatModel',
}

/**
 * Represents a message from the chat to the extension.
 */
export type ChatToExtensionMessage = {
	/**
	 * The type of the message.
	 */
	type: ChatToExtensionMessageType;

	/**
	 * The content of the message.
	 */
	content?: string;
};

/**
 * Checks if the given object is an array of ChatModels.
 *
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is an array of ChatModels.
 */
export function areChatModels(obj: any): obj is ChatModel[] {
	return Array.isArray(obj) && obj.every(isChatModel);
}

/**
 * Checks if the given object conforms to the ChatModel interface.
 *
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is a ChatModel.
 */
export function isChatModel(obj: any): obj is ChatModel {
	return (
		obj &&
		typeof obj === 'object' &&
		typeof obj.model === 'string' &&
		typeof obj.description === 'string' &&
		isChatModelPricing(obj.pricing)
	);
}

/**
 * Checks if the given object conforms to the ChatModelPricing interface.
 *
 * @param obj - The object to check.
 * @returns True if the object has the properties of a ChatModelPricing, otherwise false.
 */
function isChatModelPricing(obj: any): obj is ChatModelPricing {
	return (
		obj &&
		typeof obj.units === 'string' &&
		typeof obj.input === 'number' &&
		typeof obj.output === 'number'
	);
}

/**
 * Checks if the given object conforms to the ChatToExtensionMessage interface.
 *
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is a ChatToExtensionMessage.
 */
export function isChatToExtensionMessage(message: any): message is ChatToExtensionMessage {
	return (
		message &&
		typeof message === 'object' &&
		typeof message.type === 'string' &&
		message.type in ChatToExtensionMessageType &&
		(message.content === undefined || typeof message.content === 'string')
	);
}

/**
 * Checks if the given object conforms to the ExtensionToChatMessage interface.
 *
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is a ExtensionToChatMessage.
 */
export function isExtensionToChatMessage(message: any): message is ExtensionToChatMessage {
	return (
		message &&
		typeof message === 'object' &&
		typeof message.type === 'string' &&
		message.type in ExtensionToChatMessageType &&
		(message.content === undefined || typeof message.content === 'string')
	);
}

/**
 * Checks if the given object conforms to the ChatAPIJsonResponseBody interface.
 *
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is a ChatAPIJsonResponseBody.
 */
export function isChatAPIJsonResponseBody(obj: any): obj is ChatAPIJsonResponseBody {
	return (
		obj &&
		typeof obj === 'object' &&
		typeof obj.content === 'string' &&
		typeof obj.usage === 'object' &&
		typeof obj.usage.completion_tokens === 'number' &&
		typeof obj.usage.prompt_tokens === 'number' &&
		typeof obj.usage.total_tokens === 'number'
	);
}

/**
 * Checks if the given object conforms to the UserConfig interface.
 *
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is a UserConfig.
 */
export function isUserConfig(obj: any): obj is UserConfig {
	return (
		obj &&
		typeof obj === 'object' &&
		typeof obj.apiUrl === 'string' &&
		typeof obj.apiKey === 'string'
	);
}

/**
 * Checks if the given object conforms to the GetDevicesAPIResponse interface.
 *
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is a GetDevicesAPIResponse.
 */
export function AreQuantumDevices(obj: any): obj is QuantumDevice[] {
	return Array.isArray(obj) && obj.every(isQuantumDevice);
}

/**
 * Checks if the given object conforms to the QuantumDevice interface.
 *
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is a QuantumDevice.
 */
export function isQuantumDevice(obj: any): obj is QuantumDevice {
	return (
		obj &&
		typeof obj === 'object' &&
		typeof obj.qbraid_id === 'string' &&
		typeof obj.name === 'string' &&
		typeof obj.provider === 'string' &&
		typeof obj.vendor === 'string' &&
		typeof obj.numberQubits === 'number' &&
		typeof obj.pendingJobs === 'number' &&
		typeof obj.paradigm === 'string' &&
		typeof obj.type === 'string' &&
		typeof obj.runPackage === 'string' &&
		(typeof obj.statusMsg === 'string' || obj.statusMsg === null) &&
		typeof obj.isAvailable === 'boolean' &&
		(typeof obj.nextAvailable === 'string' || obj.nextAvailable === null)
	);
}

/**
 * Checks if the given object conforms to the GetQuantumJobsResponse interface.
 *
 * @param obj - The object to be checked.
 * @returns A boolean indicating whether the object is a GetQuantumJobsResponse.
 */
export function isGetQuantumJobsResponse(obj: any): obj is GetQuantumJobsResponse {
	return (
		obj &&
		typeof obj === 'object' &&
		typeof obj.jobsArray === 'object' &&
		Array.isArray(obj.jobsArray) &&
		typeof obj.statusGroup === 'string' &&
		typeof obj.provider === 'string' &&
		typeof obj.total === 'number'
	);
}
