import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/logo/Logo";
import ParticlesBg from "@/components/ui-custom/ParticlesBg";

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [particleType, setParticleType] = useState<"matrix" | "network">("network");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Test login for admin/admin
      if (loginForm.email === "admin" && loginForm.password === "admin") {
        localStorage.setItem("adminLoggedIn", "true");
        toast.success("Bienvenue Admin !");
        window.location.href = "/";
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        throw error;
      }

      toast.success(t("app.auth.loginSuccess"));
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("app.auth.loginError");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error(t("app.auth.passwordMismatch"));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            first_name: signupForm.firstName,
            last_name: signupForm.lastName,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success(t("app.auth.signupSuccess"));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("app.auth.signupError");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <ParticlesBg type={particleType} />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-background/20 to-background/30"></div>
      <div className="mx-auto flex w-full flex-col items-center space-y-8 sm:w-[400px] relative z-10">
        <div className="mb-6 animate-float">
          <Logo />
        </div>
        {/*<Button
          variant="outline"
          size="sm"
          onClick={() => setParticleType((prev) => (prev === "matrix" ? "network" : "matrix"))}
          className="absolute top-4 right-4 bg-background/70 backdrop-blur-sm">
          {particleType === "matrix" ? "Network Style" : "Matrix Style"}
        </Button>*/}
        <Tabs
          defaultValue="login"
          className="w-full">
          <TabsList className="grid w-full grid-cols-2 tabs-list shadow-sm">
            <TabsTrigger
              value="login"
              className="tabs-trigger font-medium">
              {t("app.auth.login")}
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="tabs-trigger font-medium">
              {t("app.auth.signup")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="glass-effect border-opacity-40 transition-all animate-fade-in animate-shimmer">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle className="card-title">{t("app.auth.login")}</CardTitle>
                  <CardDescription className="card-description">{t("app.auth.loginDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("app.auth.email")}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="text"
                      placeholder="admin"
                      required
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      className="transition-all focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t("app.auth.password")}</Label>
                      <Button
                        variant="link"
                        size="sm"
                        className="px-0">
                        {t("app.auth.forgotPassword")}
                      </Button>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="admin"
                      required
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      className="transition-all focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className={`w-full ${isLoading ? "animate-pulse-subtle" : ""}`}
                    disabled={isLoading}>
                    {isLoading ? t("common.loading") : t("app.auth.loginButton")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="glass-effect border-opacity-40 transition-all animate-fade-in animate-shimmer">
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle className="card-title">{t("app.auth.signup")}</CardTitle>
                  <CardDescription className="card-description">{t("app.auth.signupDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("app.auth.firstName")}</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={signupForm.firstName}
                        onChange={handleSignupChange}
                        className="transition-all focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("app.auth.lastName")}</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={signupForm.lastName}
                        onChange={handleSignupChange}
                        className="transition-all focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">{t("app.auth.email")}</Label>
                    <Input
                      id="signupEmail"
                      name="email"
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      className="transition-all focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">{t("app.auth.password")}</Label>
                    <Input
                      id="signupPassword"
                      name="password"
                      type="password"
                      required
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      className="transition-all focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("app.auth.confirmPassword")}</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={signupForm.confirmPassword}
                      onChange={handleSignupChange}
                      className="transition-all focus:shadow-[0_0_0_2px_rgba(59,130,246,0.3)]"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className={`w-full ${isLoading ? "animate-pulse-subtle" : ""}`}
                    disabled={isLoading}>
                    {isLoading ? t("common.loading") : t("app.auth.signupButton")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
