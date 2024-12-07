import { PublicClientApplication } from "@azure/msal-browser";
const HOST = window.location.host;

const msalConfig = {
  auth: {
    clientId: "2a26ee58-78b6-465a-85bc-39ff315cd3eb",
    authority: "https://login.microsoftonline.com/Alfapeople050.onmicrosoft.com",
    redirectUri: `http://${HOST}`,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
