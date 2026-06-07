import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import AIComposer from "./pages/AIComposer";
import Scheduler from "./pages/Scheduler";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import AdminDashboard from "./pages/AdminDashboard";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import { Toaster } from "react-hot-toast";

export default function App() {
    return (
        <>
            <Toaster position="top-right" containerStyle={{ zIndex: 999999 }} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route element={<Layout />}> 
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/ai-composer" element={<AIComposer />} />
                    <Route path="/schedule" element={<Scheduler />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Routes>
        </>
    );
}
