import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";

const API_DOCS_URL = import.meta.env.VITE_API_DOCS_URL;

import "./Header.css";

function Header() {
    const { user, isLoading } = useContext(AuthContext);

    return (
        <header>
            <span>
                {isLoading ? "Loading..." : user?.nickName}
            </span>

            <a
                href={API_DOCS_URL}
                target="_blank"
                rel="noreferrer"
            >
                API
            </a>
        </header>
    );
}

export default Header;