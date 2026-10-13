import { Link } from "react-router-dom";
import "./Legal.css";

export default function PrivacyPolicy() {
    return (
        <div className="legal-page">
            <nav className="legal-navbar">
                <Link to="/" className="legal-brand">
                    <div className="legal-brand-badge">D</div>
                    <span>DataLens</span>
                </Link>
                <Link to="/" className="legal-back-btn">
                    Back to Home
                </Link>
            </nav>

            <main className="legal-container">
                <header className="legal-header">
                    <span className="legal-tag">Compliance &amp; Data Security</span>
                    <h1>Privacy Policy</h1>
                    <p className="legal-meta">Last Updated: October 14, 2026</p>
                </header>

                <article className="legal-card">
                    <section className="legal-section">
                        <h2>1. Overview</h2>
                        <p>
                            DataLens ("we", "our", or "the platform") is dedicated to protecting
                            the privacy and security of your analytical datasets, personal details,
                            and session information. This Privacy Policy describes how data is
                            collected, stored, processed, and maintained across our web application
                            and associated cloud APIs.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>2. Information We Collect</h2>
                        <p>We collect information in the following categories:</p>
                        <ul>
                            <li>
                                <strong>Account Credentials:</strong> When you register an account,
                                we collect your name, email address, and an encrypted hash of your
                                password. We do not store plaintext passwords.
                            </li>
                            <li>
                                <strong>User Datasets:</strong> Tabular records, column names, row
                                values, and metadata that you enter manually or upload via file
                                formats (CSV, TSV, Excel, JSON).
                            </li>
                            <li>
                                <strong>Time Tracking Sessions:</strong> Daily session durations and
                                timestamps recorded through the integrated time tracker feature.
                            </li>
                            <li>
                                <strong>Technical &amp; Session Data:</strong> Authentication tokens
                                (JSON Web Tokens), browser user-agent strings, and local storage
                                identifiers necessary for maintaining state and preventing session
                                collision.
                            </li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>3. How Your Information Is Used</h2>
                        <p>Your data is processed strictly for functional application requirements:</p>
                        <ul>
                            <li>Authenticating your account and authorizing access to your saved datasets.</li>
                            <li>Rendering spreadsheet tables, statistical metrics, and interactive charts.</li>
                            <li>Synchronizing user data between your local browser cache and MongoDB database clusters.</li>
                            <li>Maintaining individual user isolation so that different accounts cannot access one another's data.</li>
                        </ul>
                        <p>
                            We do not sell, rent, monetize, or share your tabular records with advertising
                            networks or third-party data brokers.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>4. Data Storage and Security</h2>
                        <p>
                            Cloud-synced accounts persist data in MongoDB Atlas clusters with encryption
                            at rest and in transit (TLS/SSL). Authentication is handled via stateless
                            JSON Web Tokens with cryptographic signatures.
                        </p>
                        <p>
                            For users operating in Guest Mode or offline, datasets and session metrics
                            are stored strictly within your browser's LocalStorage sandboxed domain
                            storage.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>5. Third-Party Service Providers</h2>
                        <p>
                            DataLens uses reputable infrastructure providers to deliver its services:
                        </p>
                        <ul>
                            <li><strong>Vercel:</strong> Static asset hosting and frontend application delivery.</li>
                            <li><strong>Render:</strong> API web service execution and backend routing.</li>
                            <li><strong>MongoDB Atlas:</strong> Managed cloud database infrastructure.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>6. User Rights and Data Control</h2>
                        <p>You maintain full control over your information at all times:</p>
                        <ul>
                            <li><strong>Export:</strong> You can export any saved dataset in CSV, Excel, or JSON format.</li>
                            <li><strong>Modification:</strong> You can edit column headers, cell values, and profile details anytime.</li>
                            <li><strong>Deletion:</strong> You can delete individual datasets, clear time logs, or wipe local storage sessions.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>7. Contact and Inquiries</h2>
                        <p>
                            If you have questions regarding this Privacy Policy or data handling practices,
                            please reach out through the official project repository or account settings.
                        </p>
                    </section>

                    <div className="legal-footer-nav">
                        <span>DataLens Data Protection</span>
                        <div className="legal-footer-links">
                            <Link to="/terms">Terms and Conditions</Link>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/login">Sign In</Link>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
