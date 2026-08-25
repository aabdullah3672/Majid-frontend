import { useState } from "react";
import { api, saveSession } from "../api/client.js";
import { validateForm } from "../utils/helpers.jsx";

function Field({ label, name, type = "text", error, autoComplete, wide = false }) {
  return (
    <label className={`field${wide ? " field-wide" : ""}${error ? " has-error" : ""}`}>
      <span>{label}</span>
      <input type={type} name={name} autoComplete={autoComplete} />
      <small>{error}</small>
    </label>
  );
}

export default function AuthPage({ navigate, onSessionChange, redirectTo = "/", introTitle = "Welcome back to VoltXpress.", introCopy = "Log in or create an account using the backend API." }) {
  const [mode, setMode] = useState("login");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = mode === "login" ? ["email", "password"] : ["name", "email", "password", "confirm"];
    const nextErrors = validateForm(form, fields);
    if (mode === "register" && form.elements.password.value !== form.elements.confirm.value) {
      nextErrors.confirm = "Passwords must match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setMessage(mode === "login" ? "Logging in..." : "Creating account...");
    try {
      const session = mode === "login"
        ? await api.login({
          email: form.elements.email.value.trim(),
          password: form.elements.password.value
        })
        : await api.register({
          name: form.elements.name.value.trim(),
          email: form.elements.email.value.trim(),
          password: form.elements.password.value
        });

      saveSession(session);
      onSessionChange?.(session);
      setMessage(mode === "login"
        ? `Logged in as ${session.user.name}.`
        : `Account created for ${session.user.name}.`);
      navigate?.(redirectTo);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setMessage("");
  };

  return (
    <main className="page-shell">
      <section className="auth-shell container">
        <div className="auth-copy">
          <p className="eyebrow">Account</p>
          <h1>{introTitle}</h1>
          <p>{introCopy}</p>
        </div>

        <div className="form-panel auth-panel">
          <div className="segmented-control" role="tablist" aria-label="Authentication forms">
            <button className={mode === "login" ? "is-active" : ""} type="button" onClick={() => switchMode("login")}>Login</button>
            <button className={mode === "register" ? "is-active" : ""} type="button" onClick={() => switchMode("register")}>Register</button>
          </div>

          <form onSubmit={submit} noValidate>
            {mode === "register" && <Field label="Full name" name="name" error={errors.name} autoComplete="name" />}
            <Field label="Email" name="email" type="email" error={errors.email} autoComplete="email" />
            <Field label="Password" name="password" type="password" error={errors.password} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            {mode === "register" && <Field label="Confirm password" name="confirm" type="password" error={errors.confirm} autoComplete="new-password" />}
            <button className="btn btn-primary btn-full" type="submit">{mode === "login" ? "Login" : "Create Account"}</button>
            <p className="form-message" role="status">{message}</p>
          </form>
        </div>
      </section>
    </main>
  );
}
