// Allows importing of html files as strings
declare module '*.html' {
  const content: string;
  export default content;
}
