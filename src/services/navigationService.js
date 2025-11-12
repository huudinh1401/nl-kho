let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

export const getLogoutCallback = () => {
  return logoutCallback;
};

export const clearLogoutCallback = () => {
  logoutCallback = null;
};
