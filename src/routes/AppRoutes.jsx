import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import CreateDataset from "../pages/Dataset/CreateDataset";
import UploadDataset from "../pages/Dataset/UploadDataset";
import ManualDataset from "../pages/Dataset/ManualDataset";
import NotFound from "../pages/NotFound/NotFound";
import DataPreview from "../pages/Dataset/DataPreview";
import Visualize from "../pages/Visualize/Visualize";
import CompareDatasets from "../pages/Compare/CompareDatasets";
import Profile from "../pages/Profile/Profile";
import Stopwatch from "../pages/Stopwatch/Stopwatch";
import PrivacyPolicy from "../pages/Legal/PrivacyPolicy";
import TermsConditions from "../pages/Legal/TermsConditions";
import ProtectedRoute from "../components/common/ProtectedRoute";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dataset/create"
                element={
                    <ProtectedRoute>
                        <CreateDataset />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dataset/manual"
                element={
                    <ProtectedRoute>
                        <ManualDataset />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dataset/enter"
                element={
                    <ProtectedRoute>
                        <ManualDataset />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dataset/upload"
                element={
                    <ProtectedRoute>
                        <UploadDataset />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/dataset/preview"
                element={
                    <ProtectedRoute>
                        <DataPreview />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/visualize"
                element={
                    <ProtectedRoute>
                        <Visualize />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/compare"
                element={
                    <ProtectedRoute>
                        <CompareDatasets />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/stopwatch"
                element={
                    <ProtectedRoute>
                        <Stopwatch />
                    </ProtectedRoute>
                }
            />

            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;
