import "./App.css";

import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, User, signOut } from "firebase/auth";

const backendurl = process.env.REACT_APP_BACKEND_URL;

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("firebaseToken", token);

      window.history.replaceState({}, document.title, window.location.pathname);

      const auth = getAuth(app);
      signInWithCustomToken(auth, token)
        .then((userCredential) => {
          console.log("User signed in:", userCredential.user);
          setUser(userCredential.user);
        })
        .catch((error) => {
          console.error("Error during Firebase login:", error);
          window.location.href = `${backendurl}/login`;
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      const savedToken = localStorage.getItem("firebaseToken");
      if (savedToken) {
        const auth = getAuth(app);
        signInWithCustomToken(auth, savedToken)
          .then((userCredential) => {
            setUser(userCredential.user);
          })
          .catch((error) => {
            console.error("Error during Firebase login:", error);
            window.location.href = `${backendurl}/login`;
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        window.location.href = `${backendurl}/login`;
        setLoading(false);
      }
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in.</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.displayName || "User"}</h1>
      <button
        onClick={() => {
          const auth = getAuth(app);
          signOut(auth)
            .then(() => {
              localStorage.removeItem("firebaseToken");
              window.location.href = `${backendurl}/login`;
            })
            .catch((error) => {
              console.error("Sign out error:", error);
            });
        }}
      >
        Log out
      </button>
    </div>
  );
}

export default App;
