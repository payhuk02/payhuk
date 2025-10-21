import React, { useState, useCallback, useMemo } from 'react';

// Types de base pour la validation
type ValidationRule<T = any> = {
  validate: (value: T, formData?: Record<string, any>) => boolean | string;
  message?: string;
};

type ValidationRules<T = Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

type ValidationErrors<T = Record<string, any>> = {
  [K in keyof T]?: string;
};

type ValidationState<T = Record<string, any>> = {
  values: T;
  errors: ValidationErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
};

// Règles de validation prédéfinies
export const validationRules = {
  required: <T>(message = 'Ce champ est requis'): ValidationRule<T> => ({
    validate: (value: T) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message
  }),

  email: (message = 'Adresse email invalide'): ValidationRule<string> => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length >= min,
    message: message || `Minimum ${min} caractères requis`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length <= max,
    message: message || `Maximum ${max} caractères autorisés`
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value >= min,
    message: message || `La valeur doit être supérieure ou égale à ${min}`
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value <= max,
    message: message || `La valeur doit être inférieure ou égale à ${max}`
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value: string) => regex.test(value),
    message
  }),

  phone: (message = 'Numéro de téléphone invalide'): ValidationRule<string> => ({
    validate: (value: string) => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/\s/g, ''));
    },
    message
  }),

  url: (message = 'URL invalide'): ValidationRule<string> => ({
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message
  }),

  confirmPassword: (passwordField: string, message = 'Les mots de passe ne correspondent pas'): ValidationRule<string> => ({
    validate: (value: string, formData) => {
      return formData?.[passwordField] === value;
    },
    message
  }),

  custom: <T>(validator: (value: T, formData?: Record<string, any>) => boolean | string, message?: string): ValidationRule<T> => ({
    validate: validator,
    message
  })
};

// Hook principal pour la validation de formulaire
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules<T>,
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    validateOnSubmit?: boolean;
  } = {}
) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true
  } = options;

  const [state, setState] = useState<ValidationState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
    isDirty: false
  });

  // Fonction de validation d'un champ
  const validateField = useCallback((fieldName: keyof T, value: T[keyof T]): string | null => {
    const fieldRules = rules[fieldName];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const result = rule.validate(value, state.values);
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || 'Validation échouée';
      }
    }

    return null;
  }, [rules, state.values]);

  // Fonction de validation de tous les champs
  const validateForm = useCallback((): ValidationErrors<T> => {
    const errors: ValidationErrors<T> = {};

    for (const fieldName in rules) {
      const fieldRules = rules[fieldName];
      if (!fieldRules) continue;

      const value = state.values[fieldName];
      const error = validateField(fieldName, value);
      if (error) {
        errors[fieldName] = error;
      }
    }

    return errors;
  }, [rules, state.values, validateField]);

  // Mettre à jour la valeur d'un champ
  const setValue = useCallback((fieldName: keyof T, value: T[keyof T]) => {
    setState(prev => {
      const newValues = { ...prev.values, [fieldName]: value };
      const newErrors = { ...prev.errors };
      const newTouched = { ...prev.touched, [fieldName]: true };

      // Valider le champ si nécessaire
      if (validateOnChange) {
        const error = validateField(fieldName, value);
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
      }

      // Calculer la validité du formulaire
      const formErrors = validateOnChange ? newErrors : validateForm();
      const isValid = Object.keys(formErrors).length === 0;

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        touched: newTouched,
        isValid,
        isDirty: true
      };
    });
  }, [validateOnChange, validateField, validateForm]);

  // Marquer un champ comme touché
  const setTouched = useCallback((fieldName: keyof T) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldName]: true }
    }));
  }, []);

  // Valider un champ au blur
  const handleBlur = useCallback((fieldName: keyof T) => {
    if (validateOnBlur) {
      setTouched(fieldName);
      const error = validateField(fieldName, state.values[fieldName]);
      setState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: error || undefined
        }
      }));
    }
  }, [validateOnBlur, validateField, setTouched, state.values]);

  // Soumettre le formulaire
  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void> | void
  ) => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      if (validateOnSubmit) {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
          setState(prev => ({
            ...prev,
            errors,
            touched: Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
            isSubmitting: false
          }));
          return;
        }
      }

      await onSubmit(state.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [validateOnSubmit, validateForm, state.values, rules]);

  // Réinitialiser le formulaire
  const reset = useCallback((newValues?: Partial<T>) => {
    setState({
      values: { ...initialValues, ...newValues },
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
      isDirty: false
    });
  }, [initialValues]);

  // Obtenir l'erreur d'un champ
  const getFieldError = useCallback((fieldName: keyof T): string | undefined => {
    return state.errors[fieldName];
  }, [state.errors]);

  // Vérifier si un champ a une erreur
  const hasFieldError = useCallback((fieldName: keyof T): boolean => {
    return !!state.errors[fieldName];
  }, [state.errors]);

  // Vérifier si un champ a été touché
  const isFieldTouched = useCallback((fieldName: keyof T): boolean => {
    return !!state.touched[fieldName];
  }, [state.touched]);

  // Obtenir les propriétés d'un champ pour l'input
  const getFieldProps = useCallback((fieldName: keyof T) => {
    return {
      value: state.values[fieldName],
      onChange: (value: T[keyof T]) => setValue(fieldName, value),
      onBlur: () => handleBlur(fieldName),
      error: getFieldError(fieldName),
      hasError: hasFieldError(fieldName),
      isTouched: isFieldTouched(fieldName)
    };
  }, [state.values, setValue, handleBlur, getFieldError, hasFieldError, isFieldTouched]);

  // Valeurs calculées
  const isValid = useMemo(() => {
    return Object.keys(state.errors).length === 0;
  }, [state.errors]);

  const isDirty = useMemo(() => {
    return state.isDirty;
  }, [state.isDirty]);

  const isSubmitting = useMemo(() => {
    return state.isSubmitting;
  }, [state.isSubmitting]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid,
    isDirty,
    isSubmitting,
    setValue,
    setTouched,
    handleBlur,
    handleSubmit,
    reset,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    getFieldProps,
    validateField,
    validateForm
  };
}

// Hook pour la validation en temps réel
export function useRealTimeValidation<T>(
  value: T,
  rules: ValidationRule<T>[],
  formData?: Record<string, any>
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async () => {
    if (!rules.length) return;

    setIsValidating(true);
    
    try {
      for (const rule of rules) {
        const result = rule.validate(value, formData);
        if (result !== true) {
          setError(typeof result === 'string' ? result : rule.message || 'Validation échouée');
          return;
        }
      }
      setError(null);
    } finally {
      setIsValidating(false);
    }
  }, [value, rules, formData]);

  // Valider automatiquement quand la valeur change
  React.useEffect(() => {
    const timeoutId = setTimeout(validate, 300); // Debounce de 300ms
    return () => clearTimeout(timeoutId);
  }, [validate]);

  return {
    error,
    isValidating,
    isValid: !error,
    validate
  };
}

// Composant de validation pour les champs
interface ValidationFieldProps<T> {
  name: string;
  value: T;
  rules: ValidationRule<T>[];
  children: (props: {
    value: T;
    onChange: (value: T) => void;
    onBlur: () => void;
    error?: string;
    hasError: boolean;
    isValidating: boolean;
  }) => React.ReactNode;
  formData?: Record<string, any>;
}

export function ValidationField<T>({
  name,
  value,
  rules,
  children,
  formData
}: ValidationFieldProps<T>) {
  const { error, isValidating, validate } = useRealTimeValidation(value, rules, formData);

  const handleChange = useCallback((newValue: T) => {
    // La validation se fait automatiquement via useRealTimeValidation
  }, []);

  const handleBlur = useCallback(() => {
    validate();
  }, [validate]);

  return (
    <>
      {children({
        value,
        onChange: handleChange,
        onBlur: handleBlur,
        error: error || undefined,
        hasError: !!error,
        isValidating
      })}
    </>
  );
}
