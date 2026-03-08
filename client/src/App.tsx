import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Records from "@/pages/Records";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { Navigation } from "@/components/Navigation";
import { LanguageSelector } from "@/components/LanguageSelector";
import Analytics from "@/pages/Analytics";

function App() {
  return (
    <>
      <LanguageSelector />
      <Navigation />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/records" element={<Records />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </>
  );
}

export default App;