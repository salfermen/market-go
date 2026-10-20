import { useState } from 'react';

// Centraliza el manejo de inputs y errores de los formularios (Login, CreateAccount, Payment...).
//
// Uso:
//   const form = useForm({ email: '' }, validateEmailStep);
//   <InputField label="Correo" {...form.getFieldProps('email')} />
//   <PrimaryButton onPress={form.handleSubmit((values) => ...)} />
//
// Los errores de un campo solo se muestran cuando el usuario sale del campo (blur)
// o cuando intenta enviar el formulario, para no "regañar" mientras escribe.
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const allErrors = validate ? validate(values) : {};
  const errors = {};
  Object.keys(allErrors).forEach((field) => {
    if (submitted || touched[field]) errors[field] = allErrors[field];
  });

  const setField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));
  const handleChange = (field) => (value) => setField(field, value);
  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = (onValid) => () => {
    setSubmitted(true);
    if (Object.keys(allErrors).length === 0) onValid(values);
  };

  const reset = (nextValues = initialValues) => {
    setValues(nextValues);
    setTouched({});
    setSubmitted(false);
  };

  const getFieldProps = (field) => ({
    value: values[field],
    onChangeText: handleChange(field),
    onBlur: handleBlur(field),
    error: errors[field],
  });

  return {
    values,
    errors,
    isValid: Object.keys(allErrors).length === 0,
    setField,
    setValues,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
  };
}
