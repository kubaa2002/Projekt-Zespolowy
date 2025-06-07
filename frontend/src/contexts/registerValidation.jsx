export function validateRegister({username,email,password,confirmPassword}){
    const errors= {};

    if (!email) errors.email = "Email jest wymagany";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email musi być poprawny";

    if (!username) errors.username = "Nazwa użytkownika jest wymagana";
    else if (username.length < 3) errors.username = "Nazwa użytkownika musi mieć co najmniej 3 znaki";
    else if (username.length > 25) errors.username = "Nazwa użytkownika może mieć maksymalnie 25 znaków";
    else if (!/^[a-zA-Z0-9._-]+$/.test(username)) errors.username = "Nazwa użytkownika może zawierać tylko litery, cyfry, kropkę, myślnik lub podkreślnik";

    if (!password) errors.password = "Hasło jest wymagane";
    else if (password.length < 8) errors.password = "Hasło musi mieć co najmniej 8 znaków";
    else if (password.length > 32) errors.password = "Hasło może mieć maksymalnie 32 znaki";
    else if (!/[a-z]/.test(password)) errors.password = "Hasło musi zawierać co najmniej jedną małą literę";
    else if (!/[A-Z]/.test(password)) errors.password = "Hasło musi zawierać co najmniej jedną wielką literę";
    else if (!/[0-9]/.test(password)) errors.password = "Hasło musi zawierać co najmniej jedną cyfrę";
    else if (!/[^a-zA-Z0-9]/.test(password)) errors.password = "Hasło musi zawierać co najmniej jeden znak specjalny";

    if (!confirmPassword) errors.confirmPassword = "Powtórz hasło";
    else if (password !== confirmPassword) errors.confirmPassword = "Hasła muszą być takie same";

    return errors;
}