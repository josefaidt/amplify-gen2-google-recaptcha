import { defineFunction, secret } from "@aws-amplify/backend"

export const verifyAuthChallengeResponse = defineFunction({
  name: "verify-auth-challenge-response",
  environment: {
    GOOGLE_RECAPTCHA_SECRET_KEY: secret("GOOGLE_RECAPTCHA_SECRET_KEY"),
  },
})
