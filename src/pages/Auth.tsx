import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/logo/Logo";

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

      toast.success(t("app.login.success"));
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || t("app.login.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error(t("app.signup.passwordMismatch"));
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

      toast.success(t("app.signup.success"));
    } catch (error: any) {
      toast.error(error.message || t("app.signup.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mx-auto flex w-full flex-col items-center space-y-6 sm:w-[350px]">
        <div className="mb-4">
          <Logo />
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t("app.login.title")}</TabsTrigger>
            <TabsTrigger value="signup">{t("app.signup.title")}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>{t("app.login.title")}</CardTitle>
                  <CardDescription>{t("app.login.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("app.login.email")}</Label>
                    <Input id="email" name="email" type="text" placeholder="admin" required value={loginForm.email} onChange={handleLoginChange} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t("app.login.password")}</Label>
                      <Button variant="link" size="sm" className="px-0">
                        {t("app.login.forgotPassword")}
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
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Chargement..." : t("app.login.login")}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>{t("app.signup.title")}</CardTitle>
                  <CardDescription>{t("app.signup.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("app.signup.firstName")}</Label>
                      <Input id="firstName" name="firstName" required value={signupForm.firstName} onChange={handleSignupChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("app.signup.lastName")}</Label>
                      <Input id="lastName" name="lastName" required value={signupForm.lastName} onChange={handleSignupChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">{t("app.signup.email")}</Label>
                    <Input id="signupEmail" name="email" type="email" required value={signupForm.email} onChange={handleSignupChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">{t("app.signup.password")}</Label>
                    <Input id="signupPassword" name="password" type="password" required value={signupForm.password} onChange={handleSignupChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("app.signup.confirmPassword")}</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={signupForm.confirmPassword}
                      onChange={handleSignupChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Création..." : t("app.signup.signup")}
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
