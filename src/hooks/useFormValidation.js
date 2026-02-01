import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";

export const useFormValidation = () => {
  const { t } = useLanguage();

  const validateEmail = useCallback(
    (email) => {
      if (!email) {
        return t("auth.register.errors.emailRequired");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return t("auth.register.errors.emailInvalid");
      }
      return null;
    },
    [t]
  );

  const validatePassword = useCallback(
    (password) => {
      if (!password) {
        return t("auth.register.errors.passwordRequired");
      }
      if (password.length < 8) {
        return t("auth.register.errors.passwordTooShort");
      }

      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      // Return the first specific error found
      if (!hasUpperCase) {
        return t("auth.register.errors.passwordNoUppercase");
      }
      if (!hasLowerCase) {
        return t("auth.register.errors.passwordNoLowercase");
      }
      if (!hasNumbers) {
        return t("auth.register.errors.passwordNoNumber");
      }
      if (!hasSpecialChar) {
        return t("auth.register.errors.passwordNoSpecialChar");
      }

      return null;
    },
    [t]
  );

  const validateConfirmPassword = useCallback(
    (password, confirmPassword) => {
      if (!confirmPassword) {
        return t("auth.register.errors.confirmPasswordRequired");
      }
      if (password !== confirmPassword) {
        return t("auth.register.errors.passwordMismatch");
      }
      return null;
    },
    [t]
  );

  const validateName = useCallback(
    (name) => {
      if (!name) {
        return t("auth.register.errors.nameRequired");
      }
      if (name.length < 2) {
        return t("auth.register.errors.nameTooShort");
      }
      if (name.length > 50) {
        return t("auth.register.errors.nameTooLong");
      }
      return null;
    },
    [t]
  );

  return {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateName,
  };
};

export const useRegisterForm = () => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateName,
  } = useFormValidation();

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

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (touched.name) {
      const nameError = validateName(formData.name);
      setErrors((prev) => ({
        ...prev,
        name: nameError,
      }));
    }
  }, [formData.name, touched.name, validateName]);

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

  useEffect(() => {
    if (touched.confirmPassword) {
      const confirmPasswordError = validateConfirmPassword(
        formData.password,
        formData.confirmPassword
      );
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }));
    }
  }, [
    formData.password,
    formData.confirmPassword,
    touched.confirmPassword,
    validateConfirmPassword,
  ]);

  return {
    formData,
    errors,
    touched,
    isSubmitting,
    setIsSubmitting,
    updateField,
    touchField,
    validateForm,
  };
};
