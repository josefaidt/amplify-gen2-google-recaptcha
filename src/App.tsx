import type { FormEventHandler } from "react"
import type { IGoogleRecaptchaProps } from "react-google-recaptcha-v3"
import type { AuthenticatorProps } from "@aws-amplify/ui-react"
import { useEffect, useState } from "react"
import { signIn, confirmSignIn } from "aws-amplify/auth"
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react"
import { GoogleReCaptcha, useGoogleReCaptcha } from "react-google-recaptcha-v3"
import "./App.css"

function App() {
  const { challengeName, route, authStatus, user, signOut } = useAuthenticator()
  const [captcha, setCaptcha] = useState<string>()
  const [isCaptchaTime, setIsCaptchaTime] = useState(false)
  const [shouldRefreshCaptcha, setShouldRefreshCaptcha] = useState(false)
  const { executeRecaptcha } = useGoogleReCaptcha()

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
    if (!isCaptchaTime) return
    try {
      const res = await confirmSignIn({ challengeResponse: token })
      console.log("User has signed in.", res)
    } catch (error) {
      console.log("Sign in failed", error)
    }
  }

  const handleVerify2 = async () => {
    console.log("running handleVerify2")
    if (!isCaptchaTime) return
    if (!executeRecaptcha) throw new Error("Unexpected captcha error")
    const token = await executeRecaptcha()
    try {
      const res = await confirmSignIn({ challengeResponse: token })
      console.log("User has signed in.", res)
    } catch (error) {
      console.log("Sign in failed", error)
    }
  }

  const services: AuthenticatorProps["services"] = {
    async handleSignIn({ username, password, options }) {
      return signIn({
        username,
        password,
        options: {
          ...options,
          authFlowType: "CUSTOM_WITH_SRP",
        },
      }).then((response) => {
        if (
          response.nextStep.signInStep ===
          "CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE"
        ) {
          setIsCaptchaTime(true)
        }
        return response
      })
    },
  }

  useEffect(() => {
    if (isCaptchaTime) {
      setShouldRefreshCaptcha((r) => !r)
      setIsCaptchaTime(false)
      handleVerify2()
    }
  }, [isCaptchaTime])

  return (
    <main>
      {authStatus === "authenticated" ? (
        <div>
          <p>Hello {user?.signInDetails?.loginId}</p>
          <button onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <>
          <Authenticator services={services} />
          {/* <GoogleReCaptcha
            onVerify={handleVerify}
            refreshReCaptcha={shouldRefreshCaptcha}
          /> */}
        </>
      )}
    </main>
  )
}

export default App
