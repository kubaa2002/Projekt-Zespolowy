import React, { useState } from 'react';
import './form.scss';
import { useAuth } from '../../contexts/authProvider';
import { useNavigate } from '@tanstack/react-router';

const AccountForm = () => {
  const { token, user, logOut } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.userName,
    email: user?.email,
    password: '',
    confirmPassword: '',
    muteNotifications: 'none',
    currentPassword: '',
  });
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Hasło musi mieć co najmniej 8 znaków';
      }
      if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Hasła nie są zgodne';
      }
    }

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Aktualne hasło jest wymagane';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDeleteCheckboxChange = (e) => {
    setDeleteConfirmed(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) {
      console.log('Błędy w formularzu:', errors);
      return;
    }

    if (formData.password) {
      if (!token) {
        setErrorMessage('Brak tokena autoryzacji. Zaloguj się ponownie.');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: formData.currentPassword,
            newPassword: formData.password,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setSuccessMessage(data.message || 'Hasło zostało pomyślnie zmienione.');
          setFormData((prevData) => ({
            ...prevData,
            password: '',
            confirmPassword: '',
            currentPassword: '',
          }));
        } else {
          if (data.Status === 401) {
            setErrorMessage(data.Errors?.PasswordError?.[0] || 'Nieprawidłowe aktualne hasło.');
          } else {
            setErrorMessage(data.message || 'Błąd podczas zmiany hasła.');
          }
        }
      } catch (error) {
        setErrorMessage('Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie.');
        console.error('Error:', error);
      }
    } else {
      console.log('Formularz poprawny, brak zmiany hasła:', formData);
      setSuccessMessage('Dane zostały zapisane (bez zmiany hasła).');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) {
      setErrorMessage('Proszę potwierdzić chęć usunięcia konta.');
      return;
    }

    if (!formData.currentPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        currentPassword: 'Aktualne hasło jest wymagane do usunięcia konta.',
      }));
      return;
    }

    if (!token) {
      setErrorMessage('Brak tokena autoryzacji. Zaloguj się ponownie.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message || 'Konto zostało pomyślnie usunięte.');
        logOut();
        navigate('/login');
      } else {
        if (response.status === 401) {
          setErrorMessage(data.error || 'Nieprawidłowe hasło.');
        } else {
          setErrorMessage(data.error || 'Błąd podczas usuwania konta.');
        }
      }
    } catch (error) {
      setErrorMessage('Wystąpił błąd podczas usuwania konta. Spróbuj ponownie.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="m-4">
        <h2 className='bordered'>
          <i className="bi bi-person-circle me-2"></i>Dane konta
        </h2>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>

          <div className="row mb-3">
            <div className="col-md-6 mb-3 mb-md-0">
              <label htmlFor="username" className="form-label">
                Nazwa użytkownika <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  id="username"
                  disabled
                  name="username"
                  placeholder="Wpisz nazwę"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  id="email"
                  disabled
                  name="email"
                  placeholder="Wpisz swój email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
            </div>
          </div>


          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Nowe hasło
            </label>
            <div className="input-group">
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                name="password"
                placeholder="Nowe hasło"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>
          </div>


          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Powtórz nowe hasło
            </label>
            <div className="input-group">
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Powtórz nowe hasło"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>
          </div>

 
          <div className="mb-3">
            <h3 className='bordered'>
              <i className="bi bi-check-circle me-2"></i>Potwierdzenie
            </h3>
            <label htmlFor="currentPassword" className="form-label">
              Aktualne hasło <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <input
                type="password"
                className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                id="currentPassword"
                name="currentPassword"
                placeholder="Aktualne hasło"
                value={formData.currentPassword}
                onChange={handleChange}
              />
              {errors.currentPassword && (
                <div className="invalid-feedback">{errors.currentPassword}</div>
              )}
            </div>
            <small className="form-text text-muted">
              Aby zapobiec nadużyciom, wpisz swoje aktualne hasło.
            </small>
          </div>


          <div className="mb-3 mt-3">
            <h3 className='bordered'>
              <i className="bi bi-trash me-2"></i>Usunięcie konta
            </h3>
            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="deleteConfirmation"
                checked={deleteConfirmed}
                onChange={handleDeleteCheckboxChange}
              />
              <label className="form-check-label" htmlFor="deleteConfirmation">
                Potwierdzam, że chcę usunąć moje konto.
              </label>
            </div>
            <button
              type="button"
              className="btn btn-publish"
              onClick={handleDeleteAccount}
              disabled={!deleteConfirmed}
            >
              Usuń konto
            </button>
            <small className="form-text text-muted d-block mt-2">
              Usunięcie konta jest nieodwracalne. Upewnij się, że na pewno chcesz to zrobić.
            </small>
          </div>

          <div className='d-flex justify-content-end'>
            <button type="submit" className="btn btn-primary btn-publish">
              Zapisz
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default AccountForm;