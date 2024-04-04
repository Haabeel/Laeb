import { RecaptchaVerifier } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../firebase.config";
export function useRecaptcha(componentID: string) {
  const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier>();

  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(auth, componentID, {
      size: "invisible",
    });
    setRecaptcha(recaptchaVerifier);
    return () => {
      recaptchaVerifier.clear();
    };
  }, [componentID]);

  return recaptcha;
}
