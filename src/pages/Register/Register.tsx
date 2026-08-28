import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { register } from '../../api/auth.api';

function Register() {
    const [email, setEmail] = useState('');
    const [nickName, setNickName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await register(nickName, email, password);

            navigate('/login');
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <form
                className="auth-form"
                onSubmit={handleSubmit}
            >
                <h1>Register</h1>

                <div className="auth-field">
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="nickName">
                        Name
                    </label>

                    <input
                        id="nickName"
                        type="text"
                        value={nickName}
                        onChange={(event) =>
                            setNickName(event.target.value)
                        }
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />
                </div>

                {error && (
                    <p className="auth-error">
                        {error}
                    </p>
                )}

                <button
                    className="auth-button"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading
                        ? 'Registering...'
                        : 'Register'}
                </button>

                <p className="auth-link">
                    Already have an account?{' '}
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </form>
        </main>
    );
}

export default Register;