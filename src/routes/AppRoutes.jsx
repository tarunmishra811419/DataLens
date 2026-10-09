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

            <Route path="/dashboard" element={<Dashboard />} />

            <Route
                path="/dataset/create"
                element={<CreateDataset />}
            />

            <Route
                path="/dataset/manual"
                element={<ManualDataset />}
            />

            <Route
                path="/dataset/enter"
                element={<ManualDataset />}
            />

            <Route
                path="/dataset/upload"
                element={<UploadDataset />}
            />

            <Route
                path="/dataset/preview"
                element={<DataPreview />}
            />

            <Route
                path="/visualize"
                element={<Visualize />}
            />

            <Route path="/compare" element={<CompareDatasets />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;