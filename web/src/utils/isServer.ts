// to be able to tell if you are on a browser or on the server
// just check if the window variable is defined
export const isServer = () => typeof window === "undefined";