"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChatToExtensionMessage = exports.ChatToExtensionMessageType = exports.isExtensionToChatMessage = exports.ExtensionToChatMessageType = void 0;
var ExtensionToChatMessageType;
(function (ExtensionToChatMessageType) {
    ExtensionToChatMessageType["BotMessage"] = "botMessage";
    ExtensionToChatMessageType["ChatModel"] = "chatModel";
})(ExtensionToChatMessageType || (exports.ExtensionToChatMessageType = ExtensionToChatMessageType = {}));
function isExtensionToChatMessage(message) {
    return (message &&
        typeof message === 'object' &&
        typeof message.type === 'string' &&
        message.type in ExtensionToChatMessageType &&
        (message.content === undefined || typeof message.content === 'string'));
}
exports.isExtensionToChatMessage = isExtensionToChatMessage;
var ChatToExtensionMessageType;
(function (ChatToExtensionMessageType) {
    ChatToExtensionMessageType["UserMessage"] = "userMessage";
    ChatToExtensionMessageType["GetChatModel"] = "getChatModel";
    ChatToExtensionMessageType["ChangeChatModel"] = "changeChatModel";
})(ChatToExtensionMessageType || (exports.ChatToExtensionMessageType = ChatToExtensionMessageType = {}));
function isChatToExtensionMessage(message) {
    return (message &&
        typeof message === 'object' &&
        typeof message.type === 'string' &&
        message.type in ChatToExtensionMessageType &&
        (message.content === undefined || typeof message.content === 'string'));
}
exports.isChatToExtensionMessage = isChatToExtensionMessage;
//# sourceMappingURL=types.js.map