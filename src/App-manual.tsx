import type { FormEventHandler } from "react"
import type { IGoogleRecaptchaProps } from "react-google-recaptcha-v3"
import { useState } from "react"
import { Amplify } from "aws-amplify"
import { signIn, confirmSignIn } from "aws-amplify/auth"
import { GoogleReCaptcha } from "react-google-recaptcha-v3"
import config from "../amplifyconfiguration.json"
import "./App.css"

Amplify.configure(config)

function App() {
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [shouldRefreshCaptcha, setShouldRefreshCaptcha] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const response = await signIn({
        username: form.get("email") as string,
        password: form.get("password") as string,
        options: {
          authFlowType: "CUSTOM_WITH_SRP",
        },
      })
      console.log("got response", response)
      if (
        response.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE"
      ) {
        setShouldRefreshCaptcha((r) => !r)
        // setShowCaptcha(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleVerify: IGoogleRecaptchaProps["onVerify"] = async (token) => {
    console.log("running handleVerify")
    try {
      const res = await confirmSignIn({ challengeResponse: token })
      console.log("User has signed in.", res)
      setShowCaptcha(false)
    } catch (error) {
      console.log("Sign in failed", error)
    }
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input type="text" name="email" required />
        <input type="password" name="password" required />
        <button type="submit">Sign In</button>
      </form>
      <GoogleReCaptcha
        onVerify={handleVerify}
        refreshReCaptcha={shouldRefreshCaptcha}
      />
      {/* {showCaptcha && <GoogleReCaptcha onVerify={handleVerify} />} */}
    </main>
  )
}

export default App
