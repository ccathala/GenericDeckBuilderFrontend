import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import FormInput from "../components/FormInput";
import authService from "../services/authService";

const LoginPage = () => {
  const { t } = useLanguage();
  const { setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateEmail = useCallback(
    (email) => {
      if (!email) {
        return t("auth.login.errors.emailRequired");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return t("auth.login.errors.emailInvalid");
      }
      return null;
    },
    [t]
  );

  const validatePassword = useCallback(
    (password) => {
      if (!password) {
        return t("auth.login.errors.passwordRequired");
      }
      return null;
    },
    [t]
  );

  // Form helpers
  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const touchField = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation
  useEffect(() => {
    if (touched.email) {
      const emailError = validateEmail(formData.email);
      setErrors((prev) => ({
        ...prev,
        email: emailError,
      }));
    }
  }, [formData.email, touched.email, validateEmail]);

  useEffect(() => {
    if (touched.password) {
      const passwordError = validatePassword(formData.password);
      setErrors((prev) => ({
        ...prev,
        password: passwordError,
      }));
    }
  }, [formData.password, touched.password, validatePassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.login(formData.email, formData.password);

      if (result.success) {
        // Use the login response data directly
        const userData = {
          id: result.data.user.id,
          email: result.data.user.email,
          name: result.data.user.name,
        };

        // Update auth context immediately with login data
        setAuthenticatedUser(result.data.token, userData);

        // Redirect to home page
        navigate("/");
      } else {
        if (
          result.error === "Invalid credentials" ||
          result.error.includes("incorrect")
        ) {
          setServerError(t("auth.login.errors.invalidCredentials"));
        } else if (result.error.includes("not found")) {
          setServerError(t("auth.login.errors.accountNotFound"));
        } else {
          setServerError(result.error || t("auth.login.errors.loginFailed"));
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerError(t("auth.login.errors.loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="text-4xl mb-2">🎴</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t("auth.login.title")}
            </h1>
            <p className="text-gray-400">{t("auth.login.subtitle")}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-mage-dark-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} noValidate>
            {/* Server Error */}
            {serverError && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-md">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-400 text-sm">{serverError}</p>
                </div>
              </div>
            )}

            {/* Email */}
            <FormInput
              type="email"
              label={t("auth.login.email")}
              placeholder={t("auth.login.emailPlaceholder")}
              value={formData.email}
              onChange={(value) => updateField("email", value)}
              onBlur={() => touchField("email")}
              error={touched.email ? errors.email : null}
              required
              autoComplete="email"
            />

            {/* Password */}
            <FormInput
              type="password"
              label={t("auth.login.password")}
              placeholder={t("auth.login.passwordPlaceholder")}
              value={formData.password}
              onChange={(value) => updateField("password", value)}
              onBlur={() => touchField("password")}
              error={touched.password ? errors.password : null}
              required
              autoComplete="current-password"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isSubmitting || Object.keys(errors).some((key) => errors[key])
              }
              className="w-full py-3 px-4 bg-mage-dark-600 hover:bg-mage-dark-500 disabled:bg-mage-dark-700 
                       disabled:cursor-not-allowed text-white font-medium rounded-md 
                       transition-colors duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 w-4 h-4 border-2 border-gray-400 border-t-white rounded-full"></div>
                  {t("auth.login.submitting")}
                </>
              ) : (
                t("auth.login.submitButton")
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {t("auth.login.noAccount")}{" "}
              <Link
                to="/register"
                className="text-mage-dark-400 hover:text-mage-dark-300 font-medium transition-colors"
              >
                {t("auth.login.registerLink")}
              </Link>
            </p>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <a
              href="#"
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement forgot password functionality
              }}
            >
              {t("auth.login.forgotPassword")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
