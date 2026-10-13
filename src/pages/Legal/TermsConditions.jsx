import { Link } from "react-router-dom";
import "./Legal.css";

export default function TermsConditions() {
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
                    <span className="legal-tag">Legal Terms of Service</span>
                    <h1>Terms and Conditions</h1>
                    <p className="legal-meta">Last Updated: October 14, 2026</p>
                </header>

                <article className="legal-card">
                    <section className="legal-section">
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using DataLens ("the platform", "the application"), you
                            agree to be bound by these Terms and Conditions. If you do not agree
                            with any provision of these terms, you must discontinue use of the
                            application immediately.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>2. Description of Service</h2>
                        <p>
                            DataLens provides a browser-based tabular data analysis workspace,
                            including manual grid entry, file importation (CSV, Excel, JSON),
                            chart generation, comparison views, and session time tracking. Services
                            may be utilized in unauthenticated local mode or through authenticated
                            cloud-persisted accounts.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>3. User Accounts and Security</h2>
                        <p>
                            When registering an account, you agree to provide accurate and complete
                            credentials. You are solely responsible for maintaining the confidentiality
                            of your login information and for all operations conducted through your
                            account.
                        </p>
                        <p>
                            We recommend selecting passwords with a minimum of eight characters
                            including numbers and special symbols. Notify platform administrators
                            immediately if you suspect unauthorized access.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>4. Ownership of User Data</h2>
                        <p>
                            You retain 100% intellectual property ownership of all datasets, tables,
                            numbers, formulas, and visual reports that you input, import, or generate
                            within DataLens.
                        </p>
                        <p>
                            DataLens claims no ownership, intellectual property rights, or commercial
                            interest in user-generated data. We only process your content as required
                            to store, render, and calculate visualizations on your behalf.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>5. Acceptable Use Policy</h2>
                        <p>While using DataLens, you agree not to:</p>
                        <ul>
                            <li>Upload files containing malicious software, viruses, or destructive scripts.</li>
                            <li>Attempt to breach, bypass, or test vulnerabilities of our authentication systems or API endpoints.</li>
                            <li>Submit tabular records containing illegal materials, unauthorized surveillance data, or unlawful personal records.</li>
                            <li>Engage in automated denial-of-service or scraping activity that degrades system performance for other users.</li>
                        </ul>
                    </section>

                    <section className="legal-section">
                        <h2>6. Service Availability and Modifications</h2>
                        <p>
                            DataLens operates utilizing cloud infrastructure. While we strive to maintain
                            continuous uptime, services may occasionally experience downtime for maintenance,
                            deployments, or upstream provider outages.
                        </p>
                        <p>
                            We reserve the right to modify application features, add analytical tools,
                            or deprecate outdated chart libraries with reasonable notice through project
                            changelogs.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>7. Disclaimer of Warranties</h2>
                        <p>
                            DataLens is provided on an "as is" and "as available" basis without warranties
                            of any kind, either express or implied. Users should verify critical financial,
                            medical, or regulatory calculations against primary data sources before
                            making business decisions.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>8. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by applicable law, DataLens and its contributors
                            shall not be liable for any indirect, incidental, consequential, or punitive
                            damages arising from data loss, server interruptions, or calculation errors.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2>9. Termination and Updates</h2>
                        <p>
                            We reserve the right to suspend or terminate accounts that violate acceptable
                            use policies. We may update these terms periodically; continued usage
                            subsequent to changes indicates acceptance of updated conditions.
                        </p>
                    </section>

                    <div className="legal-footer-nav">
                        <span>DataLens Terms of Service</span>
                        <div className="legal-footer-links">
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/login">Sign In</Link>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
