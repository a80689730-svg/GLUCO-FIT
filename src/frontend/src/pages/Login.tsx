import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, Eye, EyeOff, Loader2, Shield, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  useCurrentUser,
  useLoginUser,
  useRegisterUser,
} from "../hooks/useBackend";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useCurrentUser();
  const [tab, setTab] = useState<"signin" | "register">("signin");

  // ─── Sign In State ───────────────────────────────────────────────────────────
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // ─── Register State ──────────────────────────────────────────────────────────
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const { mutate: loginUser, isPending: isSigningIn } = useLoginUser();
  const { mutate: registerUser, isPending: isRegistering } = useRegisterUser();

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSignInError("");
    loginUser(
      { email: signInEmail, password: signInPassword },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            // result.ok contains the user's name returned from backend
            login(signInEmail, result.ok || signInEmail.split("@")[0]);
            navigate({ to: "/dashboard" });
          } else {
            setSignInError("Invalid email or password. Please try again.");
          }
        },
        onError: () => {
          setSignInError(
            "Sign in failed. Please check your connection and try again.",
          );
        },
      },
    );
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    registerUser(
      { name: regName, email: regEmail, password: regPassword },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "ok") {
            login(regEmail, regName);
            navigate({ to: "/dashboard" });
          } else {
            setRegError(result.err || "Registration failed. Please try again.");
          }
        },
        onError: () => {
          setRegError(
            "Registration failed. Please check your connection and try again.",
          );
        },
      },
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center px-4 py-12"
      data-ocid="login.page"
    >
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
            <Activity className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome to Gluco<span className="text-primary">Fit</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            India's trusted diabetes management platform
          </p>
        </div>

        <Card className="shadow-health border-border">
          <CardHeader className="pb-0 pt-5 px-6">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "signin" | "register")}
              data-ocid="login.tab"
            >
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="signin" data-ocid="login.signin_tab">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" data-ocid="login.register_tab">
                  Create Account
                </TabsTrigger>
              </TabsList>

              <CardContent className="px-0 pt-6 pb-6">
                {/* ─── Sign In Tab ─────────────────────────────────────────── */}
                <TabsContent value="signin" className="mt-0">
                  <form
                    onSubmit={handleSignIn}
                    className="space-y-4"
                    data-ocid="login.signin.form"
                  >
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="signin-email"
                        className="text-sm font-medium"
                      >
                        Email address
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        data-ocid="login.signin.email_input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="signin-password"
                        className="text-sm font-medium"
                      >
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showSignInPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          required
                          className="pr-10"
                          data-ocid="login.signin.password_input"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowSignInPassword((v) => !v)}
                          aria-label={
                            showSignInPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showSignInPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {signInError && (
                      <p
                        className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2"
                        data-ocid="login.signin.error_state"
                      >
                        {signInError}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSigningIn}
                      data-ocid="login.signin.submit_button"
                    >
                      {isSigningIn ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground pt-1">
                      New to Gluco Fit?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("register")}
                        className="text-primary font-medium hover:underline"
                        data-ocid="login.switch_to_register"
                      >
                        Create a free account
                      </button>
                    </p>
                  </form>
                </TabsContent>

                {/* ─── Register Tab ─────────────────────────────────────────── */}
                <TabsContent value="register" className="mt-0">
                  <form
                    onSubmit={handleRegister}
                    className="space-y-4"
                    data-ocid="login.register.form"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-name" className="text-sm font-medium">
                        Full name
                      </Label>
                      <Input
                        id="reg-name"
                        type="text"
                        autoComplete="name"
                        placeholder="Priya Sharma"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        data-ocid="login.register.name_input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reg-email"
                        className="text-sm font-medium"
                      >
                        Email address
                      </Label>
                      <Input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        data-ocid="login.register.email_input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="reg-password"
                        className="text-sm font-medium"
                      >
                        Create a password
                      </Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pr-10"
                          data-ocid="login.register.password_input"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowRegPassword((v) => !v)}
                          aria-label={
                            showRegPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showRegPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Minimum 6 characters
                      </p>
                    </div>

                    {regError && (
                      <p
                        className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2"
                        data-ocid="login.register.error_state"
                      >
                        {regError}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isRegistering}
                      data-ocid="login.register.submit_button"
                    >
                      {isRegistering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating account…
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Create Free Account
                        </>
                      )}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground pt-1">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("signin")}
                        className="text-primary font-medium hover:underline"
                        data-ocid="login.switch_to_signin"
                      >
                        Sign in
                      </button>
                    </p>
                  </form>
                </TabsContent>
              </CardContent>
            </Tabs>
          </CardHeader>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Account creation is free. No credit card required.
        </p>

        <div className="text-center mt-4">
          <Link to="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              data-ocid="login.admin_login_link"
            >
              <Shield className="w-4 h-4" />
              Admin Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
