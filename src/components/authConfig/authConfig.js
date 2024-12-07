import { PublicClientApplication } from "@azure/msal-browser";
const HOST = window.location.host;
const msalConfig = {
  
  auth: {
    clientId: "fa7918aa-ebfc-476f-8a95-2c62d2fa3316",
    authority: "https://login.microsoftonline.com/Alfapeople050.onmicrosoft.com",
    redirectUri: `http://${HOST}`,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
