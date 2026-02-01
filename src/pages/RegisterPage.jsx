import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useRegisterForm } from "../hooks/useFormValidation";
import FormInput from "../components/FormInput";
import authService from "../services/authService";

const RegisterPage = () => {
  const { t } = useLanguage();
  const { setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    formData,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    updateField,
    touchField,
    validateForm,
  } = useRegisterForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.register(
        formData.name,
        formData.email,
        formData.password
      );

      if (result.success) {
        setSuccess(true);

        // Use the registration response data directly (no double API call)
        const userData = {
          id: result.data.user.id,
          email: result.data.user.email,
          name: result.data.user.name,
        };

        // Update auth context immediately with registration data
        setAuthenticatedUser(result.data.token, userData);

        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        if (
          result.error === "Email déjà utilisé" ||
          result.error.includes("already")
        ) {
          setServerError(t("auth.register.errors.emailAlreadyExists"));
        } else {
          setServerError(
            result.error || t("auth.register.errors.registrationFailed")
          );
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setServerError(t("auth.register.errors.registrationFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-mage-dark-800 rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t("auth.register.success.accountCreated")}
            </h2>
            <p className="text-gray-400">
              {t("auth.register.success.redirecting")}
            </p>
          </div>
          <div className="animate-spin mx-auto w-6 h-6 border-2 border-mage-dark-600 border-t-white rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="text-4xl mb-2">🎴</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t("auth.register.title")}
            </h1>
            <p className="text-gray-400">{t("auth.register.subtitle")}</p>
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

            {/* Name */}
            <FormInput
              type="text"
              label={t("auth.register.name")}
              placeholder={t("auth.register.namePlaceholder")}
              value={formData.name}
              onChange={(value) => updateField("name", value)}
              onBlur={() => touchField("name")}
              error={touched.name ? errors.name : null}
              required
              autoComplete="name"
            />

            {/* Email */}
            <FormInput
              type="email"
              label={t("auth.register.email")}
              placeholder={t("auth.register.emailPlaceholder")}
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
              label={t("auth.register.password")}
              placeholder={t("auth.register.passwordPlaceholder")}
              value={formData.password}
              onChange={(value) => updateField("password", value)}
              onBlur={() => touchField("password")}
              error={touched.password ? errors.password : null}
              required
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <FormInput
              type="password"
              label={t("auth.register.confirmPassword")}
              placeholder={t("auth.register.confirmPasswordPlaceholder")}
              value={formData.confirmPassword}
              onChange={(value) => updateField("confirmPassword", value)}
              onBlur={() => touchField("confirmPassword")}
              error={touched.confirmPassword ? errors.confirmPassword : null}
              required
              autoComplete="new-password"
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
                  {t("auth.register.submitting")}
                </>
              ) : (
                t("auth.register.submitButton")
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {t("auth.register.alreadyAccount")}{" "}
              <Link
                to="/login"
                className="text-mage-dark-400 hover:text-mage-dark-300 font-medium transition-colors"
              >
                {t("auth.register.loginLink")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
