import React from "react"
import ReactDOM from "react-dom/client"
import { Amplify } from "aws-amplify"
import { Authenticator } from "@aws-amplify/ui-react"
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"
import App from "./App.tsx"
import config from "../amplifyconfiguration.json"
import "@aws-amplify/ui-react/styles.css"
import "./index.css"

Amplify.configure(config)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator.Provider>
      <GoogleReCaptchaProvider
        reCaptchaKey={import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY}
      >
        <App />
      </GoogleReCaptchaProvider>
    </Authenticator.Provider>
  </React.StrictMode>
)
