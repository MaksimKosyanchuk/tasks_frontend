import { useState, useContext, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './Login.css';

import { login } from '../../api/auth.api';

import { AuthContext } from '../../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const context = useContext(AuthContext);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const result = await login(email, password);

            context?.setAccessToken(result.accessToken);

            navigate('/');
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
                <h1>Login</h1>

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
                        ? 'Logging in...'
                        : 'Login'}
                </button>

                <p className="auth-link">
                    Don't have an account?{' '}
                    <Link to="/register">
                        Register
                    </Link>
                </p>
            </form>
        </main>
    );
}

export default Login;
